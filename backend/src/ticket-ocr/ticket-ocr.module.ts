import { Module } from '@nestjs/common';
import { TicketOcrController } from './ticket-ocr.controller';
import { TicketOcrService } from './ticket-ocr.service';

@Module({
  controllers: [TicketOcrController],
  providers: [TicketOcrService],
})
export class TicketOcrModule {}
