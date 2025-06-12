import { ApiProperty } from '@nestjs/swagger';

export class BooleanValueResponseDto {
  @ApiProperty({ type: 'boolean', description: 'Значение' })
  value!: boolean;
}
