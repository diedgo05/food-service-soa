import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class CheckAvailabilityDto {
  @ApiProperty({ required: false, description: 'Zona de entrega (opcional)' })
  @IsOptional()
  zone?: string;
}

export class AssignDeliveryDto {
  @ApiProperty({ example: 1, description: 'ID del pedido' })
  @IsInt()
  orderId: number;

  @ApiProperty({ example: 1, description: 'ID del repartidor' })
  @IsInt()
  deliveryPersonId: number;
}

export class ReleaseDeliveryDto {
  @ApiProperty({ example: 1, description: 'ID de la entrega a liberar' })
  @IsInt()
  deliveryId: number;
}

export class AvailabilityResponse {
  @ApiProperty() available: boolean;
  @ApiProperty({ required: false }) deliveryPersonId?: number;
  @ApiProperty({ required: false }) deliveryPersonName?: string;
}

export class AssignResponse {
  @ApiProperty() assigned: boolean;
  @ApiProperty({ required: false }) deliveryId?: number;
  @ApiProperty({ required: false }) error?: string;
}

export class ReleaseResponse {
  @ApiProperty() released: boolean;
}
