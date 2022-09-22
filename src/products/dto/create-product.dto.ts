import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'API Product',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'API Product',
  })
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @ApiProperty({
    default: 0,
    description: 'API Product',
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty({
    default: ['X', 'XL'],
    description: 'API Product',
  })
  @IsString({ each: true })
  @IsArray()
  sizes: string[];

  @ApiProperty({
    description: 'API Product',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'API Product',
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiProperty({
    description: 'API Product title',
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({
    description: 'API Product',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags: string[];

  @ApiProperty({
    description: 'API Product',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
