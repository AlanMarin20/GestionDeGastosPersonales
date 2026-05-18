import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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

  @Post('analyze-batch')
  @UseInterceptors(
    FilesInterceptor('tickets', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
    }),
  )
  analyzeBatch(@UploadedFiles() files: Express.Multer.File[]) {
    return this.ticketOcrService.analyzeTicketBatch(files);
  }
}
