import { ApiProperty } from '@nestjs/swagger';
import { LoginDto } from './login.dto';
import { IsString } from '@nestjs/class-validator';

export class LoginPasswordDto extends LoginDto {
  @IsString()
  @ApiProperty({ description: 'Пароль', type: 'string' })
  password!: string;
}
