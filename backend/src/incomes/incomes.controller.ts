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
import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('incomes')
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @Post()
  create(@Request() req, @Body() createIncomeDto: CreateIncomeDto) {
    return this.incomesService.create(req.user.sub, createIncomeDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.incomesService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.incomesService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateIncomeDto: UpdateIncomeDto,
  ) {
    return this.incomesService.update(id, req.user.sub, updateIncomeDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.incomesService.remove(id, req.user.sub);
  }
}
