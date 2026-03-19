import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/roles.decorator';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  ResetPasswordDto,
} from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('assignable')
  @Roles('SUPER_ADMIN', 'ADMIN')
  getAssignableUsers() {
    return this.usersService.getAssignableUsers();
  }

  @Get('me')
  getMyDetails(@Request() req) {
    return this.usersService.getUserDetails(Number(req?.user?.id));
  }

  @Patch('me')
  updateMe(@Body() dto: UpdateUserDto, @Request() req) {
    return this.usersService.updateUser(
      Number(req.user.id),
      dto,
      Number(req.user.id),
    );
  }

  @Post()
  @Roles('SUPER_ADMIN')
  createUser(@Body() dto: CreateUserDto, @Request() req) {
    return this.usersService.createUser(dto, Number(req.user.id));
  }

  @Patch('me/password')
  changeOwnPassword(@Body() dto: ChangePasswordDto, @Request() req) {
    return this.usersService.changeOwnPassword(Number(req.user.id), dto);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @Request() req,
  ) {
    return this.usersService.updateUser(id, dto, Number(req.user.id));
  }

  @Patch(':id/role')
  @Roles('SUPER_ADMIN', 'ADMIN')
  changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: string,
    @Request() req,
  ) {
    return this.usersService.changeRole(
      id,
      role,
      Number(req.user.id),
      req.user.role,
    );
  }

  @Patch(':id/activate')
  @Roles('SUPER_ADMIN', 'ADMIN')
  activateUser(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.usersService.setActivationStatus(
      id,
      true,
      Number(req.user.id),
      req.user.role,
    );
  }

  @Patch(':id/deactivate')
  @Roles('SUPER_ADMIN', 'ADMIN')
  deactivateUser(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.usersService.setActivationStatus(
      id,
      false,
      Number(req.user.id),
      req.user.role,
    );
  }

  @Patch(':id/reset-password')
  @Roles('SUPER_ADMIN', 'ADMIN')
  adminResetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResetPasswordDto,
    @Request() req,
  ) {
    return this.usersService.adminResetPassword(
      id,
      dto,
      Number(req.user.id),
      req.user.role,
    );
  }
}
