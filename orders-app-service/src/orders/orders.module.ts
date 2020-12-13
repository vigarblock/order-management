import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersEventManager } from './ordersEventManager';
import { PaymentsServiceClient } from '../clients/paymentsServiceClient';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersEventManager, PaymentsServiceClient],
})
export class OrdersModule {}
