import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Payload } from '../interfaces/payload.interfaces';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configServices: ConfigService,
  ) {
    super({
      secretOrKey: configServices.get<string>('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: Payload): Promise<User> {
    const { email, id } = payload;

    const user = await this.userRepository.findOne({ where: { uuid: id } });

    if (!user) throw new UnauthorizedException('User not found');

    if (!user.isActive)
      throw new UnauthorizedException('User is inactive, talk with the admin');

    return user;
  }
}
