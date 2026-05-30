import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { RecommendationsService } from './recommendations.service';

@UseGuards(AuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Post('generate-ai')
  generateAi(@Request() req) {
    return this.recommendationsService.generateAiRecommendations(req.user.sub);
  }

  @Post()
  create(@Request() req, @Body() createDto: CreateRecommendationDto) {
    return this.recommendationsService.create(req.user.sub, createDto);
  }

  @Get()
  findAll(@Request() req, @Query('role') role?: string) {
    if (role === 'advisor') {
      return this.recommendationsService.findAllByAdvisor(req.user.sub);
    }

    return this.recommendationsService.findAllForUser(req.user.sub);
  }

  @Get('dashboard')
  getDashboard(@Request() req) {
    return this.recommendationsService.getDashboardRecommendations(req.user.sub);
  }

  @Get('historia')
  getHistoria(
    @Request() req,
    @Query('emisor') emisor?: string,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
  ) {
    return this.recommendationsService.getHistoria(
      req.user.sub,
      emisor,
      mes ? Number(mes) : undefined,
      anio ? Number(anio) : undefined,
    );
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.recommendationsService.findOneForUser(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateRecommendationDto,
  ) {
    return this.recommendationsService.updateForUser(
      id,
      req.user.sub,
      updateDto,
    );
  }

  @Patch(':id/read')
  markAsRead(@Request() req, @Param('id') id: string) {
    return this.recommendationsService.markAsReadForUser(id, req.user.sub);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.recommendationsService.removeForUser(id, req.user.sub);
  }
}
