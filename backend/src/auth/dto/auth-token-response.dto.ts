import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenResponseDto {
  @ApiProperty({ type: 'string', description: 'Токен' })
  token!: string;
}
