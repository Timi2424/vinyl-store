import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  HasMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Review } from './review.model';
import { User } from './user.model';

@Table({
  tableName: 'vinyls',
})
export class Vinyl extends Model<Vinyl> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  artist: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  image: string;

  @HasMany(() => Review)
  reviews: Review[];

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  userId: string;

  @BelongsTo(() => User)
  user: User;
}
