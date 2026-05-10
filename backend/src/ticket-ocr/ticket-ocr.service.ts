import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

export interface TicketData {
  comercio: string;
  fecha: string;
  monto: string;
  categoria: string;
  descripcion: string;
}

const PROMPT = `Analizá esta imagen de un ticket o comprobante de compra.
Extraé los siguientes datos y respondé ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin bloques de código:

{
  "comercio": "nombre del comercio o tienda",
  "fecha": "fecha en formato YYYY-MM-DD",
  "monto": "monto total como número sin símbolo de moneda (ej: 1250.50)",
  "categoria": "una de estas categorías: Supermercado, Restaurante, Transporte, Salud, Educación, Entretenimiento, Ropa, Tecnología, Hogar, Ocio, Otro",
  "descripcion": "breve descripción del gasto en una oración"
}

Si no podés determinar algún campo con certeza, dejalo como string vacío "".`;

@Injectable()
export class TicketOcrService {
  private readonly groq: Groq;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('GROQ_API_KEY no configurada');
    }
    this.groq = new Groq({ apiKey: apiKey.trim() });
  }

  async analyzeTicket(file: Express.Multer.File): Promise<TicketData> {
    if (!file) {
      throw new BadRequestException('No se recibió ninguna imagen');
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Formato no soportado. Usá JPG, PNG o WebP.');
    }

    const base64Image = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64Image}`;

    const completion = await this.groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: dataUrl } },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 512,
    });

    const rawText = completion.choices[0]?.message?.content ?? '';

    try {
      const cleaned = rawText.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned) as Partial<TicketData>;
      return {
        comercio: parsed.comercio ?? '',
        fecha: parsed.fecha ?? '',
        monto: parsed.monto ?? '',
        categoria: parsed.categoria ?? '',
        descripcion: parsed.descripcion ?? '',
      };
    } catch {
      throw new InternalServerErrorException(
        'No se pudo interpretar la respuesta de la IA. Intentá con otra imagen.',
      );
    }
  }
}
