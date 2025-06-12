import { ApiProperty } from '@nestjs/swagger';

export class UserInfoResponseDto {
  @ApiProperty({ type: 'string', description: 'Логин' })
  login!: string;
}
