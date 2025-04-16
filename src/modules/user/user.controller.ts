import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { UserService } from './user.service';
import { UserRole } from 'src/common/enums/user-role.enum';
import { AddUserDto, EditUserDto, EditUserOrderInfoDto, UserRoleDto } from './dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('role') role: UserRole,
    @Query('search') search: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,

  ) {
    const queries = {
        page: parseInt(page),
        limit: parseInt(limit),
        role: role,
        search,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
    }

    return this.userService.findAll(queries);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put('/role/:id')
  async editUserRole(@Param('id') id: string, @Body() dto: UserRoleDto) {
    return this.userService.editUserRole(id, dto);
  }

  @Post()
  async add(@Body() dto: AddUserDto) {
    return this.userService.addUser(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: EditUserDto) {
    return this.userService.editUser(id, dto);
  }

  @Patch(':id/order-info')
  async updateUserOrderInfo(@Param('id') id: string, @Body() dto: EditUserOrderInfoDto) {
    return this.userService.editUserOrderInfo(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
