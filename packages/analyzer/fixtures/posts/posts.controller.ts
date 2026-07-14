import { Controller, Post, Body } from '@nestjs/common';
import { CreatePostDto } from './create-post.dto';

@Controller('posts')
export class PostsController {
  // VIOLATION: DTO class has no class-validator decorators (dto-no-validation)
  @Post()
  create(@Body() dto: CreatePostDto) {
    return dto;
  }
}
