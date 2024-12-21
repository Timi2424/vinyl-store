import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Review } from '../model/review.model';
import { Vinyl } from '../model/vinyl.model';
import { CreateReviewDto } from './dto/create-review.dto';
import { systemLogger } from '../utils/logger';

@Injectable()
export class ReviewService {
  async createReview(createReviewDto: CreateReviewDto, userId: string): Promise<Review> {
    try {
      const vinyl = await Vinyl.findByPk(createReviewDto.vinylId);
      if (!vinyl) {
        throw new NotFoundException(`Vinyl with ID ${createReviewDto.vinylId} not found`);
      }
  
      const review = await Review.create({
        ...createReviewDto,
        userId,
      });
      systemLogger.log(`Review ${review.id} created for vinyl ${createReviewDto.vinylId}`);
      return review;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      systemLogger.error('Failed to create review', error);
      throw new InternalServerErrorException('Failed to create review');
    }
  }

  async getReviewsByVinylId(vinylId: string, page: number = 1, pageSize: number = 10) {
    try {
      const offset = (page - 1) * pageSize;
      const reviews = await Review.findAndCountAll({
        where: { vinylId },
        offset,
        limit: pageSize,
      });

      if (!reviews.rows.length) {
        throw new NotFoundException(`No reviews found for vinyl ID ${vinylId}`);
      }

      const totalPages = Math.ceil(reviews.count / pageSize);
      return { reviews: reviews.rows, totalPages };
    } catch (error) {
      systemLogger.error('Failed to retrieve reviews', error);
      throw new InternalServerErrorException('Failed to retrieve reviews');
    }
  }

  async deleteReview(reviewId: string): Promise<void> {
    const review = await Review.findByPk(reviewId);
    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    try {
      await review.destroy();
      systemLogger.log(`Review with ID ${reviewId} deleted`);
    } catch (error) {
      systemLogger.error('Failed to delete review', error);
      throw new InternalServerErrorException('Failed to delete review');
    }
  }
}
