import { Controller, Get, Post, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto, OrderResponse } from './dto';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear pedido (ejecuta Saga de orquestación)' })
  @ApiResponse({ status: 201, type: OrderResponse, description: 'Pedido creado y procesado por la Saga' })
  create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los pedidos' })
  @ApiResponse({ status: 200, type: [OrderResponse] })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener pedido por ID' })
  @ApiResponse({ status: 200, type: OrderResponse })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
