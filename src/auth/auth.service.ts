import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrytp from 'bcrypt';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';

import { JwtService } from '@nestjs/jwt';
import { Payload } from './interfaces/payload.interfaces';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtServices: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, ...userDate } = createUserDto;
    try {
      const user = this.userRepository.create({
        ...userDate,
        email,
        password: bcrytp.hashSync(password, bcrytp.genSaltSync(10)),
      });
      await this.userRepository.save(user);
      delete user.password;
      return {
        ...user,
        token: this.getJwtToken({ id: user.uuid, email: user.email }),
      };
    } catch (error) {
      this.handleDBErrors(error, email);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, uuid: true },
    });
    if (!user) throw new UnauthorizedException(`Credencials invalid (email)`);

    if (!bcrytp.compareSync(password, user.password))
      throw new UnauthorizedException(`Credencials invalid (password)`);

    return {
      ...user,
      token: this.getJwtToken({ id: user.uuid, email: user.email }),
    };
  }

  async checkStatus(user: User) {
    const { uuid, email, fullName } = user;

    return {
      uuid,
      email,
      fullName,
      toke: this.getJwtToken({ id: uuid, email }),
    };
  }

  private getJwtToken(payload: Payload): string {
    const token = this.jwtServices.sign(payload);

    return token;
  }

  private handleDBErrors(error: any, tema: string = ''): never {
    this.logger.error(error.detail);
    console.log(error);
    if (error.code === '23505')
      throw new BadRequestException(
        `The email ${tema} already exits in dataBase, duplicate value`,
      );

    throw new InternalServerErrorException(
      'Error internal server, talk in admin',
    );
  }
}
