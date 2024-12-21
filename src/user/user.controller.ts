import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedRequest } from '../types/authReq.type';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { controllerLogger } from '../utils/logger';

@ApiTags('User (User Role Required)')
@Controller('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get authenticated user profile (User Role Required)' })
  @ApiResponse({
    status: 200,
    description: 'User profile including reviews and purchased vinyl records',
  })
  @Get('profile')
  async getProfile(@Req() req: AuthenticatedRequest) {
    try {
      controllerLogger.log(`UserController: Fetching profile for user ${req.user.email}`);
      const user = await this.userService.findById(req.user.id);
      controllerLogger.log(`UserController: Profile retrieved for user ${req.user.email}`);
      return { statusCode: HttpStatus.OK, data: user };
    } catch (error) {
      controllerLogger.error(`UserController: Error fetching profile for user ${req.user.email}`, error);
      throw new HttpException(
        error.message || 'Failed to retrieve profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Update user profile (User Role Required)' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  @ApiBody({
    description: 'Fields to update in the user profile',
    schema: {
      example: {
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'https://example.com/avatar.jpg',
        birthdate: '1990-01-01',
      },
    },
  })
  @Patch('profile')
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      controllerLogger.log(`UserController: Updating profile for user ${req.user.email}`);
      const updatedUser = await this.userService.updateById(req.user.id, updateUserDto);
      controllerLogger.log(`UserController: Profile updated for user ${req.user.email}`);
      return {
        statusCode: HttpStatus.OK,
        message: 'Profile updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      controllerLogger.error(`UserController: Error updating profile for user ${req.user.email}`, error);
      throw new HttpException(
        error.message || 'Failed to update profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Delete user profile (User Role Required)' })
  @ApiResponse({
    status: 204,
    description: 'User profile deleted successfully',
  })
  @Delete('profile')
  async deleteProfile(@Req() req: AuthenticatedRequest) {
    try {
      controllerLogger.log(`UserController: Deleting profile for user ${req.user.email}`);
      await this.userService.removeById(req.user.id);
      controllerLogger.log(`UserController: Profile deleted for user ${req.user.email}`);
      return { statusCode: HttpStatus.NO_CONTENT };
    } catch (error) {
      controllerLogger.error(`UserController: Error deleting profile for user ${req.user.email}`, error);
      throw new HttpException(
        error.message || 'Failed to delete profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

