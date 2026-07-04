import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  menuItemId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'ID del restaurante' })
  @IsInt()
  restaurantId: number;

  @ApiProperty({ type: [OrderItemDto], description: 'Ítems del pedido' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del cliente' })
  @IsString()
  customerName: string;

  @ApiProperty({ example: 'Calle 5 de Mayo #23, Centro', description: 'Dirección de entrega' })
  @IsString()
  deliveryAddress: string;
}

export class OrderResponse {
  @ApiProperty() id: number;
  @ApiProperty() restaurantId: number;
  @ApiProperty() items: OrderItemDto[];
  @ApiProperty() status: string;
  @ApiProperty() totalAmount: number;
  @ApiProperty() customerName: string;
  @ApiProperty() deliveryAddress: string;
  @ApiProperty({ required: false }) deliveryPersonId?: number;
  @ApiProperty({ required: false }) failureReason?: string;
  @ApiProperty() createdAt: Date;
}

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'Nombre de usuario' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'admin123', description: 'Contraseña' })
  @IsString()
  password: string;
}

export class LoginResponse {
  @ApiProperty() access_token: string;
}
