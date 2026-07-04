import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { MenuItem } from '../restaurants/entities/menu-item.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, MenuItem])],
  providers: [SeedService],
})
export class SeedModule {}
