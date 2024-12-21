import { IsString, IsNotEmpty, IsDecimal, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVinylDto {
  @ApiProperty({ description: 'Name of the vinyl record' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Artist of the vinyl record' })
  @IsNotEmpty()
  @IsString()
  artist: string;

  @ApiProperty({ description: 'Description of the vinyl record' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Price of the vinyl record' })
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '0,2' })
  price: number;

  @ApiProperty({ description: 'URL of the vinyl image', required: false })
  @IsOptional()
  @IsString()
  image?: string;
}
