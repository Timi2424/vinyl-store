import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { Review } from '../model/review.model';
import { Vinyl } from '../model/vinyl.model';
import { CreateReviewDto } from './dto/create-review.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { systemLogger } from '../utils/logger';

jest.mock('../utils/logger');

describe('ReviewService', () => {
  let service: ReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewService],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    const mockReviewDto: CreateReviewDto = {
      content: 'Great vinyl!',
      rating: 5,
      vinylId: 'vinyl-123',
    };
    const mockUserId = 'user-123';

    it('should create a review successfully', async () => {
      jest.spyOn(Vinyl, 'findByPk').mockResolvedValue({ id: 'vinyl-123' } as Vinyl);
      jest.spyOn(Review, 'create').mockResolvedValue(mockReviewDto as any);

      const result = await service.createReview(mockReviewDto, mockUserId);

      expect(result).toEqual(mockReviewDto);
    });

    it('should throw NotFoundException if vinyl not found', async () => {
      jest.spyOn(Vinyl, 'findByPk').mockResolvedValue(null);
    
      await expect(service.createReview(mockReviewDto, mockUserId)).rejects.toThrow(NotFoundException);
    });    

    it('should throw InternalServerErrorException on creation failure', async () => {
      jest.spyOn(Vinyl, 'findByPk').mockResolvedValue({ id: 'vinyl-123' } as Vinyl);
      jest.spyOn(Review, 'create').mockRejectedValue(new Error('Create error'));
    
      await expect(service.createReview(mockReviewDto, mockUserId)).rejects.toThrow(
        InternalServerErrorException,
      );
    
      expect(systemLogger.error).toHaveBeenCalledWith('Failed to create review', expect.any(Error));
    });    
  });

  describe('deleteReview', () => {
    const mockReviewId = 'review-123';

    it('should delete review successfully', async () => {
      jest.spyOn(Review, 'findByPk').mockResolvedValue({
        destroy: jest.fn(),
      } as any);

      await service.deleteReview(mockReviewId);

      expect(systemLogger.log).toHaveBeenCalledWith(expect.stringContaining(`Review with ID ${mockReviewId} deleted`));
    });

    it('should throw NotFoundException if review not found', async () => {
      jest.spyOn(Review, 'findByPk').mockResolvedValue(null);

      await expect(service.deleteReview(mockReviewId)).rejects.toThrow(NotFoundException);
    });
  });
});
