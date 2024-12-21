import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from '../model/user.model';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { systemLogger } from '../utils/logger';
import { CreateUserDto } from './dto/create-user.dto';

jest.mock('../utils/logger');

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    const mockUserId = 'user-123';

    it('should return the user when found', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({
        id: mockUserId,
        reviews: [],
        purchasedVinylRecords: [],
      } as any);

      const result = await service.findById(mockUserId);

      expect(result.id).toBe(mockUserId);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      await expect(service.findById(mockUserId)).rejects.toThrow(NotFoundException);
    });

    it('should log and throw InternalServerErrorException on database error', async () => {
      jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Database error'));
    
      await expect(service.findById(mockUserId)).rejects.toThrow(InternalServerErrorException);
    
      expect(systemLogger.error).toHaveBeenCalledWith(
        `Error in findById for ID ${mockUserId}`,
        expect.any(Error),
      );
    });    
  });

  describe('create', () => {
    const mockUserDto: CreateUserDto = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      birthdate: '1990-01-01',
    };

    it('should create a user successfully', async () => {
      jest.spyOn(User, 'create').mockResolvedValue({
        get: jest.fn().mockReturnValue(mockUserDto),
      } as any);

      const result = await service.create(mockUserDto);

      expect(result).toEqual(mockUserDto);
    });

    it('should log and throw InternalServerErrorException on creation failure', async () => {
      jest.spyOn(User, 'create').mockRejectedValue(new Error('Creation error'));

      await expect(service.create(mockUserDto)).rejects.toThrow(InternalServerErrorException);
      expect(systemLogger.error).toHaveBeenCalled();
    });
  });

  describe('updateById', () => {
    const mockUserId = 'user-123';
    const mockUpdateDto = { firstName: 'Updated' };

    it('should update user successfully', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({
        id: mockUserId,
        update: jest.fn(),
        get: jest.fn().mockReturnValue(mockUpdateDto),
      } as any);

      const result = await service.updateById(mockUserId, mockUpdateDto);

      expect(result).toEqual(mockUpdateDto);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
    
      await expect(service.findById(mockUserId)).rejects.toThrow(NotFoundException);
    });
    

    it('should log and throw InternalServerErrorException on update failure', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({
        update: jest.fn().mockRejectedValue(new Error('Update error')),
      } as any);

      await expect(service.updateById(mockUserId, mockUpdateDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(systemLogger.error).toHaveBeenCalled();
    });
  });

  describe('removeById', () => {
    const mockUserId = 'user-123';

    it('should delete user successfully', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({
        id: mockUserId,
        destroy: jest.fn(),
      } as any);

      await service.removeById(mockUserId);

      expect(systemLogger.log).toHaveBeenCalledWith(expect.stringContaining(`User with ID ${mockUserId} deleted`));
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      await expect(service.removeById(mockUserId)).rejects.toThrow(NotFoundException);
    });

    it('should log and throw InternalServerErrorException on deletion failure', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({
        destroy: jest.fn().mockRejectedValue(new Error('Deletion error')),
      } as any);

      await expect(service.removeById(mockUserId)).rejects.toThrow(InternalServerErrorException);
      expect(systemLogger.error).toHaveBeenCalled();
    });
  });
});
