import { ProductImage } from './product-image.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    example: '14fe4e0d-3d9a-478e-ae54-a82ed9c8f228',
    description: 'Product ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Teslo Product',
    description: 'Title Product',
    uniqueItems: false,
  })
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty({
    example: 0,
    description: 'Price Product',
    uniqueItems: false,
  })
  @Column('float', {
    default: 0,
  })
  price: number;

  @ApiProperty({
    example: 'Shit in sale in shop teslo',
    description: 'Description Product',
    uniqueItems: false,
    default: null,
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    example: 'santiago_shirt50',
    description: 'Slug Product',
    uniqueItems: false,
  })
  @Column({
    type: 'text',
    unique: true,
  })
  slug: string;

  @ApiProperty({
    example: 40,
    description: 'Stock Product',
    default: 0,
  })
  @Column('int', {
    default: 0,
  })
  stock: number;

  @ApiProperty({
    example: ['X', 'XL', 'M'],
    description: 'Sizes Product',
    uniqueItems: false,
  })
  @Column('text', {
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    example: 'Men',
    description: 'Product gender',
    uniqueItems: false,
  })
  @Column({
    type: 'text',
  })
  gender: string;

  @ApiProperty({
    example: ['shirt', 'sport'],
    description: 'Tags Product',
    default: null,
  })
  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  tags: string[];

  // TODO: Agregar images y taps
  @ApiProperty()
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.product, { eager: true })
  userId: User;

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    if (this.slug) {
      this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '');
    }
  }
}
