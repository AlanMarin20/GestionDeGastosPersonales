import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';

@UseGuards(AuthGuard)
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll(@Request() req) {
    return this.tagsService.findAll(req.user.sub);
  }

  @Post()
  create(@Request() req, @Body() dto: CreateTagDto) {
    return this.tagsService.create(req.user.sub, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.tagsService.remove(id, req.user.sub);
  }
}
