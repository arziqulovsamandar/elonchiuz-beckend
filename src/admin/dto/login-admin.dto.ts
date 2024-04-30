import { ApiProperty } from '@nestjs/swagger';
import {  IsNotEmpty, IsPhoneNumber, IsStrongPassword } from 'class-validator';

export class LoginAdminDto {
  @ApiProperty({
    example: '+998 33 336 00 44',
    description: 'Foydalanuvchi numberi',
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Uzbek1$t0n', description: 'Foydalanuvchi  paroli' })
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
