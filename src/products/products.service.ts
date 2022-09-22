import { NotFoundException } from '@nestjs/common';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDTO } from 'src/common/dtos/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';
import * as uuid from 'uuid';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetail } = createProductDto;
      const product = this.productRepository.create({
        ...productDetail,
        images: images.map((image) =>
          this.productImagesRepository.create({ url: image }),
        ),
        userId: user,
      });
      await this.productRepository.save(product);
      return { ...product, images };
    } catch (error) {
      this.handleException(error);
    }
  }

  async findAll(pagination: PaginationDTO) {
    const { limit = 10, offset = 0 } = pagination;
    try {
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true,
        },
      });
      return products.map(({ images, ...product }) => ({
        product,
        images: images.map((image) => image.url),
      }));
    } catch (error) {
      this.handleException(error);
    }
  }

  async findOne(term: string) {
    // const product = await this.productRepository.findOneBy({ id: term });
    let product: Product;

    if (uuid.validate(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`The product with ${term} not exits`);
    }
    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...product } = await this.findOne(term);
    return { ...product, images: images.map((image) => image.url) };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product)
      throw new BadRequestException(`The product with id:${id} not found`);

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image) =>
          this.productImagesRepository.create({ url: image }),
        );
      }

      product.userId = user;
      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();
      // await this.productRepository.save(product);
      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleException(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return 'Delete Correct';
  }

  private handleException(error: any) {
    console.log(error);
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('prod');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleException(error);
    }
  }
}
