import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Transaction } from './transaction.model';

@Table({ tableName: 'accounts' })
export class Account extends Model<Account> {
  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  number!: number;

  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
  balance!: number;

  @HasMany(() => Transaction)
  transactions!: Transaction[];
}
