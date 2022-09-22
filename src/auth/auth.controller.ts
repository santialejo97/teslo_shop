import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Headers,
  SetMetadata,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { IncomingHttpHeaders } from 'http';
import { RawHeaders } from 'src/common/decorators/raw_headers.decorator';
import { AuthService } from './auth.service';
import { Auth } from './decorators';
import { GetUser } from './decorators/get_user.decorator';
import { RoleProtected } from './decorators/role-protected.decorator';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guard/user-role.guard';
import { ValidRoles } from './interfaces';
import { JwtStrategy } from './strategies/jwt.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('renew')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkStatus(user);
  }

  @Get('test')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser('user') user: User,
    @GetUser('email') email: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {
    return {
      ok: true,
      msg: 'Valor del usuario',
      user,
      email,
      rawHeaders,
      headers,
    };
  }
  // @SetMetadata('roles', ['admin', 'super-user'])

  @Get('test2')
  @RoleProtected(ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRouteSecond(@GetUser() user: User) {
    return {
      ok: true,
      msg: 'Test 2',
      user,
    };
  }

  @Get('test3')
  @Auth(ValidRoles.admin)
  privateRouteThree(@GetUser() user: User) {
    return {
      ok: true,
      msg: 'Test 2',
      user,
    };
  }
}
