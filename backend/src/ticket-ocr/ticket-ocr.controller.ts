import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthGuard } from '../auth/auth.guard';
import { TicketOcrService } from './ticket-ocr.service';

@UseGuards(AuthGuard)
@Controller('ticket-ocr')
export class TicketOcrController {
  constructor(private readonly ticketOcrService: TicketOcrService) {}

  @Post('analyze')
  @UseInterceptors(
    FileInterceptor('ticket', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  analyze(@UploadedFile() file: Express.Multer.File) {
    return this.ticketOcrService.analyzeTicket(file);
  }
}
