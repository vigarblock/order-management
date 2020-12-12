import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderStatus } from './orderStatus';
import { Order } from './entities/order.entity';
import { OrderNotFoundException } from './errors/orderNotFoundException';
import { OrdersEventManager } from './ordersEventManager';
import { OrderDTO } from './DTO/OrderDTO';

const createdEvent = 'created';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private ordersEventManager: OrdersEventManager,
  ) {
    this.setupOrdersEventHandler();
  }

  async createOrder(customerId: string, amount: number) {
    const initialStatus = OrderStatus.Created;

    const order = new Order();
    order.customerId = customerId;
    order.status = initialStatus;
    order.amount = amount;

    await this.ordersRepository.insert(order);

    this.ordersEventManager.publish(createdEvent, order);

    return new OrderDTO(
      order.id,
      order.createdDate,
      order.status,
      order.amount,
    );
  }

  async getOrderStatus(orderId: string) {
    const orders = await this.ordersRepository.find({ id: orderId });

    if (orders?.length === 0) {
      throw new OrderNotFoundException(
        `Requested order with ID: "${orderId}" was not found`,
      );
    }
    return orders[0].status;
  }

  async cancelOrder(orderId: string) {
    const cancelledStatus = OrderStatus.Cancelled;
    const updateResult = await this.ordersRepository.update(orderId, {
      status: cancelledStatus,
    });

    if (updateResult.affected === 0) {
      throw new OrderNotFoundException(
        `Failed to cancel. Order with ID: "${orderId}" was not found`,
      );
    }

    return OrderStatus.Cancelled;
  }

  async processCreatedOrder(order: Order) {
    // TODO: 1 - Make call to payments service
    // TODO: 2 - Update status based on payments response
    // TODO: 3 - Update status
    const updateResult = await this.ordersRepository.update(order.id, {
      status: OrderStatus.Delivered,
    });
  }

  setupOrdersEventHandler() {
    this.ordersEventManager.subscribe(createdEvent, (payload) =>
      this.processCreatedOrder(payload),
    );
  }
}
