import { Product } from 'src/products/entities';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as uuid from 'uuid';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    type: 'text',
    unique: true,
  })
  email: string;

  @Column({
    type: 'text',
    select: false,
  })
  password: string;

  @Column({
    type: 'text',
  })
  fullName: string;

  @Column({
    type: 'bool',
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'text',
    array: true,
    default: ['user'],
  })
  roles: string[];

  @OneToMany(() => Product, (product) => product.userId)
  product: Product;

  @BeforeInsert()
  userBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  userBeforeUpdate() {
    this.userBeforeInsert();
  }
}
