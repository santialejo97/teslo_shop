import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { User } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private readonly productServices: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    const firstUser = await this.insertUser();
    await this.insertRowProduct(firstUser);
    return 'execute Seed';
  }

  private async deleteTables() {
    await this.productServices.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    await queryBuilder.delete().where({}).execute();
  }

  private async insertUser() {
    const seedUser = initialData.users;
    const users: User[] = [];
    seedUser.forEach(({ password, ...user }) => {
      users.push(
        this.userRepository.create({
          ...user,
          password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
        }),
      );
    });

    const dbUsers = await this.userRepository.save(users);
    return dbUsers[0];
  }

  private async insertRowProduct(user: User) {
    await this.productServices.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this.productServices.create(product, user));
    });

    await Promise.all(insertPromises);

    return true;
  }
}
