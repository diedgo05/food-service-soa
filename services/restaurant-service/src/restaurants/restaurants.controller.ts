import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import {
  ValidateItemsDto, ReserveStockDto, ReleaseStockDto,
  ValidateItemsResponse, ReserveStockResponse, ReleaseStockResponse,
} from './dto';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly service: RestaurantsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los restaurantes' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener restaurante por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get(':id/menu')
  @ApiOperation({ summary: 'Obtener menú de un restaurante' })
  getMenu(@Param('id', ParseIntPipe) id: number) {
    return this.service.getMenu(id);
  }

  @Post(':id/validate-items')
  @ApiOperation({ summary: 'Validar ítems y disponibilidad de stock' })
  @ApiResponse({ status: 200, type: ValidateItemsResponse })
  validateItems(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ValidateItemsDto,
  ) {
    return this.service.validateItems(id, dto.items);
  }

  @Post(':id/reserve-stock')
  @ApiOperation({ summary: 'Reservar stock de ítems (parte de la Saga)' })
  @ApiResponse({ status: 200, type: ReserveStockResponse })
  reserveStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReserveStockDto,
  ) {
    return this.service.reserveStock(id, dto.items);
  }

  @Post(':id/release-stock')
  @ApiOperation({ summary: 'Liberar stock reservado (compensación de Saga)' })
  @ApiResponse({ status: 200, type: ReleaseStockResponse })
  releaseStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReleaseStockDto,
  ) {
    return this.service.releaseStock(dto.reservationId);
  }
}
