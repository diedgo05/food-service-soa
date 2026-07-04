import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsPositive, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

// ── Request DTOs ────────────────────────────────────────

export class OrderItemDto {
  @ApiProperty({ example: 1, description: 'ID del ítem del menú' })
  @IsInt()
  menuItemId: number;

  @ApiProperty({ example: 2, description: 'Cantidad solicitada' })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class ValidateItemsDto {
  @ApiProperty({ type: [OrderItemDto], description: 'Lista de ítems a validar' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class ReserveStockDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class ReleaseStockDto {
  @ApiProperty({ example: 'res-uuid-123', description: 'ID de la reservación a liberar' })
  reservationId: string;
}

// ── Response DTOs ───────────────────────────────────────

export class ItemDetailResponse {
  @ApiProperty() menuItemId: number;
  @ApiProperty() name: string;
  @ApiProperty() unitPrice: number;
  @ApiProperty() quantity: number;
  @ApiProperty() subtotal: number;
}

export class ValidateItemsResponse {
  @ApiProperty() valid: boolean;
  @ApiProperty() totalAmount: number;
  @ApiProperty({ type: [ItemDetailResponse] }) details: ItemDetailResponse[];
  @ApiProperty({ required: false }) error?: string;
}

export class ReserveStockResponse {
  @ApiProperty() reserved: boolean;
  @ApiProperty() reservationId: string;
  @ApiProperty({ required: false }) error?: string;
}

export class ReleaseStockResponse {
  @ApiProperty() released: boolean;
}
