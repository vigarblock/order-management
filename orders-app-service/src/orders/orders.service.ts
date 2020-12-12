import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderStatus } from './orderStatus';
import { Order } from './entities/order.entity';
import { OrderNotFoundException } from './errors/orderNotFoundException';
import { OrdersEventManager } from './ordersEventManager';
import { OrderDTO } from './DTO/OrderDTO';
import { PaymentsServiceClient } from 'src/clients/paymentsServiceClient';

const createdEvent = 'created';
const confirmedEvent = 'confirmed';

const deliverDelayMs = 2000;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private ordersEventManager: OrdersEventManager,
    private paymentsServiceClient: PaymentsServiceClient,
  ) {
    this.setupOrdersEventHandler();
  }

  async createOrder(userId: string, amount: number) {
    const initialStatus = OrderStatus.Created;

    const order = new Order();
    order.userId = userId;
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
    await this.updateOrderStatus(orderId, cancelledStatus);
    return OrderStatus.Cancelled;
  }

  private async processCreatedOrder(order: Order) {
    const response = await this.paymentsServiceClient.postPaymentRequest(
      order.userId,
      'MockedPaymentMethod',
      order.amount,
    );

    console.log('Payment response', response);

    let orderStatus: OrderStatus;
    if (response.status === 'confirmed') {
      orderStatus = OrderStatus.Confirmed;
    }

    if (response.status === 'declined') {
      orderStatus = OrderStatus.Cancelled;
    }

    if (!orderStatus) {
      throw new Error(
        `Failed to determine payment response for order with ID: ${order.id}`,
      );
    }

    await this.updateOrderStatus(order.id, orderStatus);

    if (orderStatus === OrderStatus.Confirmed) {
      console.log('Submitting event to confirm');
      this.ordersEventManager.publish(confirmedEvent, order);
    }
  }

  private async processConfirmedOrder(order: Order) {
    await this.delay(deliverDelayMs);
    console.log('Confirming order');
    await this.updateOrderStatus(order.id, OrderStatus.Delivered);
  }

  private setupOrdersEventHandler() {
    this.ordersEventManager.subscribe(createdEvent, (payload) =>
      this.processCreatedOrder(payload),
    );
    this.ordersEventManager.subscribe(confirmedEvent, (payload) =>
      this.processConfirmedOrder(payload),
    );
  }

  private async updateOrderStatus(orderId: string, orderStatus: OrderStatus) {
    const updateResult = await this.ordersRepository.update(orderId, {
      status: orderStatus,
    });

    if (updateResult.affected === 0) {
      throw new OrderNotFoundException(
        `Failed to update order post payment. Order with ID: "${orderId}" was not found`,
      );
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
