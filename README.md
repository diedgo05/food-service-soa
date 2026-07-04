# Food Delivery SOA — Arquitectura Orientada a Servicios

Proyecto académico — Universidad Politécnica de Chiapas  
**Materia:** Arquitectura Orientada a Servicios  
**Equipo:** Patrón · Diego Jiménez Pérez · Gael Hueytlelt · Ángel Adrián Sánchez 

## Arquitectura

Tres servicios NestJS independientes con comunicación síncrona (REST) y asíncrona (Redis Pub/Sub), patrón Saga por orquestación y seguridad JWT.


| Servicio                        | Puerto | Responsabilidad                      | BD              |
| ------------------------------- | ------ | ------------------------------------ | --------------- |
| **Order Service** (Orquestador) | 3000   | Ciclo de vida del pedido, Saga, JWT  | `order_db`      |
| **Restaurant Service**          | 3001   | Restaurantes, menús, inventario      | `restaurant_db` |
| **Delivery Service**            | 3002   | Repartidores, asignaciones, tracking | `delivery_db`   |


## Requisitos

- Docker y Docker Compose
- Node.js 20+ (solo para desarrollo local)

## Levantar con Docker Compose

```bash
docker compose up --build
```

## Swagger (documentación de contratos)

- Order Service: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- Restaurant Service: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- Delivery Service: [http://localhost:3002/api/docs](http://localhost:3002/api/docs)

## Flujo de prueba

### 1. Obtener token JWT

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. Crear pedido (ejecuta la Saga completa)

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "restaurantId": 1,
    "items": [
      {"menuItemId": 1, "quantity": 2},
      {"menuItemId": 3, "quantity": 1}
    ],
    "customerName": "Juan Pérez",
    "deliveryAddress": "Calle 5 de Mayo #23, Centro"
  }'
```

### 3. Consultar pedidos

```bash
curl http://localhost:3000/orders \
  -H "Authorization: Bearer <TOKEN>"
```

## Saga — Flujo de orquestación

```
1. OrderService recibe solicitud
2. → REST → RestaurantService: validar ítems
3. → REST → RestaurantService: reservar stock
4. → REST → DeliveryService: verificar disponibilidad
5. → REST → DeliveryService: asignar repartidor
6. Si todo OK → CONFIRMED + publish "order.confirmed" (Redis)
7. Si falla paso 4 o 5 → COMPENSACIÓN: liberar stock + publish "order.cancelled"
```

## Tecnologías

- NestJS 10 + TypeORM + PostgreSQL 15
- Redis 7 (Pub/Sub)
- Passport JWT
- Swagger/OpenAPI
- Docker Compose

