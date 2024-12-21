import { Test, TestingModule } from '@nestjs/testing';
import { VinylService } from './vinyl.service';
import { Vinyl } from '../model/vinyl.model';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { systemLogger } from '../utils/logger';
import { CreateVinylDto } from './dto/create-vinyl.dto';

jest.mock('../utils/logger');

describe('VinylService', () => {
  let service: VinylService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VinylService],
    }).compile();

    service = module.get<VinylService>(VinylService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockVinylDto: CreateVinylDto = {
      name: 'Vinyl 1',
      artist: 'Artist 1',
      price: 20,
      description: 'A great vinyl record',
    };

    it('should create vinyl successfully', async () => {
      jest.spyOn(Vinyl, 'create').mockResolvedValue(mockVinylDto as any);

      const result = await service.create(mockVinylDto);

      expect(result).toEqual(mockVinylDto);
    });

    it('should throw InternalServerErrorException on creation failure', async () => {
      jest.spyOn(Vinyl, 'create').mockRejectedValue(new Error('Create error'));

      await expect(service.create(mockVinylDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    const mockVinylId = 'vinyl-123';

    it('should return vinyl if found', async () => {
      jest.spyOn(Vinyl, 'findByPk').mockResolvedValue({ id: mockVinylId } as Vinyl);

      const result = await service.findOne(mockVinylId);

      expect(result.id).toBe(mockVinylId);
    });

    it('should throw NotFoundException if vinyl not found', async () => {
      jest.spyOn(Vinyl, 'findByPk').mockResolvedValue(null);
    
      await expect(service.findOne(mockVinylId)).rejects.toThrow(NotFoundException);
    });
    
  });

  describe('remove', () => {
    const mockVinylId = 'vinyl-123';

    it('should delete vinyl successfully', async () => {
      jest.spyOn(Vinyl, 'findByPk').mockResolvedValue({
        destroy: jest.fn(),
      } as any);

      await service.remove(mockVinylId);

      expect(systemLogger.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if vinyl not found', async () => {
      jest.spyOn(Vinyl, 'findByPk').mockResolvedValue(null);

      await expect(service.remove(mockVinylId)).rejects.toThrow(NotFoundException);
    });
  });
});
