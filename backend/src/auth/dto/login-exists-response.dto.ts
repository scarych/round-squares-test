import { IsBoolean } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginExistsResponseDto {
  @IsBoolean()
  @ApiProperty({ type: 'boolean', description: 'Логин уже существует' })
  exists!: boolean;
}
