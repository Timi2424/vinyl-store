import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../model/user.model';
import { UserType } from '../types/user.type';
import { systemLogger } from '../utils/logger';
import { Review } from '../model/review.model';
import { Vinyl } from '../model/vinyl.model';

@Injectable()
export class UserService {
  async findById(id: string): Promise<User> {
    try {
      const user = await User.findOne({
        where: { id },
        include: [
          { model: Review, as: 'reviews', required: false },
          { model: Vinyl, as: 'purchasedVinylRecords', required: false },
        ],
      });
  
      if (!user) {
        systemLogger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }
  
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      systemLogger.error(`Error in findById for ID ${id}`, error);
      throw new InternalServerErrorException('Failed to retrieve user profile');
    }
  }
  

async create(createUserDto: CreateUserDto): Promise<UserType> {
  try {
    const user = await User.create({
      ...createUserDto,
      birthdate: createUserDto.birthdate || '',
    });

    systemLogger.log(`User with ID ${user.id} created`);
    return user.get({ plain: true }) as UserType;
  } catch (error) {
    systemLogger.error('Failed to create user', error);
    throw new InternalServerErrorException('Failed to create user');
  }
}




async updateById(id: string, updateUserDto: Partial<UpdateUserDto>): Promise<UserType> {
  const user = await User.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }

  try {
    await user.update({
      ...updateUserDto,
    });

    systemLogger.log(`User with ID ${id} updated`);
    return user.get({ plain: true }) as UserType;
  } catch (error) {
    systemLogger.error(`Failed to update user with ID ${id}`, error);
    throw new InternalServerErrorException(`Failed to update user with ID ${id}`);
  }
}



  async removeById(id: string): Promise<void> {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    try {
      await user.destroy();
      systemLogger.log(`User with ID ${id} deleted`);
    } catch (error) {
      systemLogger.error(`Failed to delete user with ID ${id}`, error);
      throw new InternalServerErrorException(`Failed to delete user with ID ${id}`);
    }
  }
}
