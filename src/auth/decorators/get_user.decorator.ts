import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    let user = req.user;

    if (!user)
      throw new InternalServerErrorException('User not found in request');

    return data == 'email' ? user[data] : user;
  },
);
