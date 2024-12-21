import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { User } from '../../model/user.model';

@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('Access restricted to administrators');
    }

    const userRecord = await User.findByPk(user.id);

    if (!userRecord) {
      throw new ForbiddenException('User not found');
    }

    if (userRecord.role !== 'admin') {
      throw new ForbiddenException('Access restricted to administrators');
    }

    return true;
  }
}
