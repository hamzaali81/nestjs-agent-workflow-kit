// Fixture with deliberate violations for the analyzer spike.
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserPayload } from './update-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  // VIOLATION: data access directly in the controller (controller-data-access)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // VIOLATION: @Body typed as an interface (body-is-interface)
  @Post('update')
  update(@Body() payload: UpdateUserPayload) {
    return payload;
  }

  // OK: validated DTO class
  @Post()
  create(@Body() dto: CreateUserDto) {
    return dto;
  }
}
