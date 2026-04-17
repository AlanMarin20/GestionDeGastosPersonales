import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CreateSavingsMovementDto } from './dto/create-savings-movement.dto';
import { UpdateSavingsMovementDto } from './dto/update-savings-movement.dto';
import { SavingsMovementsService } from './savings-movements.service';

@UseGuards(AuthGuard)
@Controller('savings-movements')
export class SavingsMovementsController {
  constructor(
    private readonly savingsMovementsService: SavingsMovementsService,
  ) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateSavingsMovementDto) {
    return this.savingsMovementsService.create(req.user.sub, createDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.savingsMovementsService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.savingsMovementsService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateSavingsMovementDto,
  ) {
    return this.savingsMovementsService.update(id, req.user.sub, updateDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.savingsMovementsService.remove(id, req.user.sub);
  }
}
