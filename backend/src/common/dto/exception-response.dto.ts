import { ApiProperty } from '@nestjs/swagger';

export class HttpExceptionResponse {
  @ApiProperty({ type: 'number', description: 'Код ошибки' })
  statusCode!: number;

  @ApiProperty({ type: 'string', description: 'Сообшение об ошибке' })
  message!: string;

  @ApiProperty({ type: 'string', description: 'Название ошибки' })
  error!: string;
}
