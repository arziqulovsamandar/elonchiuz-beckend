import { Table, Model, Column, DataType, HasMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

interface UserAttrs {
  last_name: string;
  first_name: string;
  kompaniya_name:string;
  phone: string;
  password: string;
  hashed_refresh_token: string;
}

@Table({ tableName: 'User' })
export class User extends Model<User, UserAttrs> {
  @ApiProperty({ example: 1, description: 'Unikal Id' })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'John', description: 'Admin ismi' })
  @Column({
    type: DataType.STRING,
  })
  first_name: string;

  @ApiProperty({ example: 'John', description: 'Kompaniya nomi' })
  @Column({
    type: DataType.STRING,
  })
  kompaniya_name: string;

  @ApiProperty({ example: 'Smith', description: 'Admin familiyasi' })
  @Column({
    type: DataType.STRING,
  })
  last_name: string;

  @ApiProperty({ example: 'Uzbek!$t0n', description: 'Admin paroli' })
  @Column({
    type: DataType.STRING,
  })
  password: string;

  @ApiProperty({
    example: '+998881112233',
    description: 'Admin telefon nomeri',
  })
  @Column({
    type: DataType.STRING,
  })
  phone: string;

  @ApiProperty({
    example: 'dsf7787cvnc9s_kjsjfndf7',
    description: 'Admin hashed refresh tokeni',
  })
  @Column({
    type: DataType.STRING,
  })
  hashed_refresh_token: string;
}
