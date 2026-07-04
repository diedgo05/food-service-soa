import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import {
  CheckAvailabilityDto, AssignDeliveryDto, ReleaseDeliveryDto,
  AvailabilityResponse, AssignResponse, ReleaseResponse,
} from './dto';

@ApiTags('Delivery')
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly service: DeliveryService) {}

  @Get('persons')
  @ApiOperation({ summary: 'Listar todos los repartidores' })
  findAllPersons() {
    return this.service.findAllPersons();
  }

  @Post('check-availability')
  @ApiOperation({ summary: 'Verificar disponibilidad de repartidor' })
  @ApiResponse({ status: 200, type: AvailabilityResponse })
  checkAvailability(@Body() dto: CheckAvailabilityDto) {
    return this.service.checkAvailability();
  }

  @Post('assign')
  @ApiOperation({ summary: 'Asignar repartidor a un pedido (parte de la Saga)' })
  @ApiResponse({ status: 200, type: AssignResponse })
  assign(@Body() dto: AssignDeliveryDto) {
    return this.service.assign(dto.orderId, dto.deliveryPersonId);
  }

  @Post('release')
  @ApiOperation({ summary: 'Liberar repartidor asignado (compensación de Saga)' })
  @ApiResponse({ status: 200, type: ReleaseResponse })
  release(@Body() dto: ReleaseDeliveryDto) {
    return this.service.release(dto.deliveryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de una entrega' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findDelivery(id);
  }
}
