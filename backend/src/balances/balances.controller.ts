import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BalancesService } from './balances.service';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('balances')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Post()
  create(@Request() req, @Body() createBalanceDto: CreateBalanceDto) {
    return this.balancesService.create(req.user.sub, createBalanceDto);
  }

  @Get('current')
  findCurrent(@Request() req) {
    return this.balancesService.findCurrentBalance(req.user.sub);
  }

  @Get()
  findAll(@Request() req) {
    return this.balancesService.findAll(req.user.sub);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBalanceDto: UpdateBalanceDto,
  ) {
    return this.balancesService.update(id, req.user.sub, updateBalanceDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.balancesService.remove(id, req.user.sub);
  }
}
