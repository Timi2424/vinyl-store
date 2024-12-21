import { IsString, IsOptional, IsDecimal } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVinylDto {
  @ApiProperty({ description: 'Updated name of the vinyl record', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Updated artist of the vinyl record', required: false })
  @IsOptional()
  @IsString()
  artist?: string;

  @ApiProperty({ description: 'Updated description of the vinyl record', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Updated price of the vinyl record', required: false })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  price?: number;

  @ApiProperty({ description: 'Updated URL of the vinyl image', required: false })
  @IsOptional()
  @IsString()
  image?: string;
}
