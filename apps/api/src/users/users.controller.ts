import { Controller, Get, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('SUPER_ADMIN')
  getAllUsers() {
    return 'Protected Users Route';
  }
  @Get('assignable')
  @Roles('SUPER_ADMIN', 'ADMIN')
  getAssignableUsers() {
    return this.usersService.getAssignableUsers();
  }
  @Get('me')
  getMyDetails(@Request() req) {
    return this.usersService.getUserDetails(Number(req?.user?.userId));
  }
}
