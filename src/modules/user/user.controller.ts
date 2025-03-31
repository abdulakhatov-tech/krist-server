import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';

import { UserService } from './user.service';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UserRoleDto } from './dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    async findAll(@Query('role') role: UserRole) {
        return this.userService.findAll(role)
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.userService.findById(id);
    }


    @Post('/role/:id')
    async editUserRole(@Param('id') id: string, @Body() dto: UserRoleDto) {
        return this.userService.editUserRole(id, dto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.userService.deleteUser(id)
    }
}
