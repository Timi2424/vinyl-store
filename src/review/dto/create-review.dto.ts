import { IsString, IsNotEmpty, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Content of the review' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: 'Rating score of the review', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'ID of the vinyl record being reviewed' })
  @IsNotEmpty()
  @IsString()
  vinylId: string;
}
