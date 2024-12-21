import { Table, Column, Model, DataType, PrimaryKey, HasMany } from 'sequelize-typescript';
import { Review } from './review.model';
import { Vinyl } from './vinyl.model';

@Table({
  tableName: 'users',
})
export class User extends Model<User> {
  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  avatar: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'user',
  })
  role: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: '',
  })
  birthdate: string;

  @HasMany(() => Review)
  reviews: Review[];

  @HasMany(() => Vinyl)
  purchasedVinylRecords: Vinyl[];
}
