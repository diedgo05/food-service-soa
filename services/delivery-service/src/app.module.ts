import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryModule } from './delivery/delivery.module';
import { RedisSubscriberModule } from './redis/redis-subscriber.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 5435,
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASS || 'postgres',
            database: process.env.DB_NAME || 'delivery_db',
          }),
      autoLoadEntities: true,
      synchronize: true,
    }),
    DeliveryModule,
    RedisSubscriberModule,
    SeedModule,
  ],
})
export class AppModule {}