import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { systemLogger } from '../utils/logger';
import { User } from '../model/user.model';
import { UserType } from '../types/user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  generateJwt(payload: { sub: string; email: string }): string {
    systemLogger.log(`Generating JWT for user: ${payload.email}`);
    return this.jwtService.sign(payload);
  }

  async signIn(user: UserType): Promise<string> {
    try {
      systemLogger.log(`Attempting sign-in for user: ${user.email}`);
      
      const existingUser = await User.findByPk(user.id);

      if (!existingUser) {
        const createUserDto: CreateUserDto = {
          id: user.id,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          avatar: user.avatar || '',
          role: 'user',
        };

        systemLogger.log(`User not found, creating new user: ${user.email}`);
        await this.registerUser(createUserDto);
      } else {
        systemLogger.log(`User found, proceeding with sign-in: ${user.email}`);
      }

      return this.generateJwt({
        sub: user.id,
        email: user.email,
      });
    } catch (error) {
      systemLogger.error(`Error during sign-in for user: ${user.email}`, error);
      throw new InternalServerErrorException('Failed to sign in the user');
    }
  }

  async registerUser(user: CreateUserDto): Promise<string> {
    try {
      systemLogger.log(`Registering new user: ${user.email}`);
      const newUser = await User.create(user);

      systemLogger.log(`User registered successfully: ${user.email}`);
      return this.generateJwt({
        sub: newUser.id,
        email: newUser.email,
      });
    } catch (error) {
      systemLogger.error(`Error registering user: ${user.email}`, error);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async findUserByEmail(email: string) {
    try {
      systemLogger.log(`Searching for user by email: ${email}`);
      return User.findOne({ where: { email } });
    } catch (error) {
      systemLogger.error(`Error finding user by email: ${email}`, error);
      throw new InternalServerErrorException('Failed to find user by email');
    }
  }
}
