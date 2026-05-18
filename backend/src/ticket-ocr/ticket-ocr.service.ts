import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
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
  "descripcion": "breve descripción del gasto en una oración, puedes incluir un listado de los items de la compra"
}

Si no podés determinar algún campo con certeza, dejalo como string vacío "".`;

@Injectable()
export class TicketOcrService {
  private readonly groq: Groq | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (apiKey && apiKey.trim()) {
      this.groq = new Groq({ apiKey: apiKey.trim() });
    } else {
      this.groq = null;
    }
  }

  async analyzeTicketBatch(
    files: Express.Multer.File[],
  ): Promise<
    Array<
      | { status: 'ok'; index: number; data: TicketData }
      | { status: 'error'; index: number; error: string }
    >
  > {
    const results = await Promise.allSettled(
      files.map((file) => this.analyzeTicket(file)),
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return { status: 'ok' as const, index, data: result.value };
      }
      const err = result.reason as Error;
      return {
        status: 'error' as const,
        index,
        error: err?.message ?? 'Error desconocido',
      };
    });
  }

  async analyzeTicket(file: Express.Multer.File): Promise<TicketData> {
    if (!this.groq) {
      throw new InternalServerErrorException(
        'Servicio de OCR no configurado. Configura GROQ_API_KEY en .env',
      );
    }

    if (!file) {
      throw new BadRequestException('No se recibió ninguna imagen');
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Formato no soportado. Usá JPG, PNG o WebP.',
      );
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
      max_tokens: 1000,
    });

    const rawText = completion.choices[0]?.message?.content ?? '';

    try {
      const cleaned = rawText
        .replace(/```(?:json)?/g, '')
        .replace(/```/g, '')
        .trim();
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
