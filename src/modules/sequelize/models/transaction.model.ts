import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Account } from './account.model';

@Table({ tableName: 'transactions' })
export class Transaction extends Model<Transaction> {
  @Column({
    type: DataType.ENUM('DEPOSIT', 'WITHDRAW', 'TRANSFER'),
    allowNull: false,
  })
  type!: string;

  @Column({ type: DataType.FLOAT, allowNull: false })
  amount!: number;

  @ForeignKey(() => Account)
  @Column({ type: DataType.INTEGER })
  accountId!: number;

  @ForeignKey(() => Account)
  @Column({ type: DataType.INTEGER, allowNull: true })
  destinoId!: number | null;

  @BelongsTo(() => Account, 'accountId')
  account!: Account;

  @BelongsTo(() => Account, 'destinoId')
  destino!: Account | null;
}
