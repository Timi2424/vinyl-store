import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthenticatedRequest } from '../types/authReq.type';
import { controllerLogger, systemLogger } from '../utils/logger';

@ApiTags('Reviews')
@Controller('reviews')
@ApiBearerAuth()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiOperation({
    summary: 'Create a new review (User or Admin role required)',
    description: 'Requires user authentication.',
  })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid review input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createReview(@Body() createReviewDto: CreateReviewDto, @Req() req: AuthenticatedRequest) {
    try {
      controllerLogger.log(`Attempting to create a review for vinyl ID: ${createReviewDto.vinylId}`);
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      const review = await this.reviewService.createReview(createReviewDto, userId);
      systemLogger.log(`Review created successfully: ${review.id} by user: ${userId}`);
      return { statusCode: HttpStatus.CREATED, message: 'Review created successfully', data: review };
    } catch (error) {
      controllerLogger.error(`Failed to create review for vinyl ID: ${createReviewDto.vinylId}`, error);
      throw new HttpException(error.message || 'Failed to create review', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: 'Get all reviews for a vinyl record (Public)',
    description: 'Accessible to everyone (No authentication required).',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Number of items per page', example: 10 })
  @ApiParam({ name: 'vinylId', description: 'ID of the vinyl record' })
  @ApiResponse({ status: 200, description: 'List of reviews with pagination' })
  @ApiResponse({ status: 404, description: 'Vinyl not found' })
  @Get('vinyl/:vinylId')
  async getReviewsByVinylId(
    @Param('vinylId') vinylId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    try {
      controllerLogger.log(`Fetching reviews for vinyl ID: ${vinylId}`);
      const reviews = await this.reviewService.getReviewsByVinylId(vinylId, page, pageSize);
      return { statusCode: HttpStatus.OK, data: reviews };
    } catch (error) {
      controllerLogger.error(`Failed to fetch reviews for vinyl ID: ${vinylId}`, error);
      throw new HttpException(error.message || 'Failed to retrieve reviews', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: 'Delete a review by ID (Admin Role Required)',
    description: 'Requires admin privileges.',
  })
  @ApiParam({ name: 'reviewId', description: 'ID of the review' })
  @ApiResponse({ status: 204, description: 'Review deleted successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':reviewId')
  async deleteReview(@Param('reviewId') reviewId: string) {
    try {
      controllerLogger.log(`Attempting to delete review ID: ${reviewId}`);
      await this.reviewService.deleteReview(reviewId);
      systemLogger.log(`Review ID: ${reviewId} deleted successfully`);
      return { statusCode: HttpStatus.NO_CONTENT, message: 'Review deleted successfully' };
    } catch (error) {
      controllerLogger.error(`Failed to delete review ID: ${reviewId}`, error);
      throw new HttpException(error.message || 'Failed to delete review', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
