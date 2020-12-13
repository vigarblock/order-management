import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrdersEventManager } from './ordersEventManager';
import { PaymentsServiceClient } from '../clients/paymentsServiceClient';
import { OrderStatus } from './orderStatus';
import { OrderDTO } from './DTO/OrderDTO';
import { OrderNotFoundException } from './errors/orderNotFoundException';

describe('OrdersController', () => {
  let ordersController: OrdersController;
  let ordersService: OrdersService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        OrdersService,
        OrdersEventManager,
        PaymentsServiceClient,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            insert: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    ordersController = moduleRef.get<OrdersController>(OrdersController);
    ordersService = moduleRef.get<OrdersService>(OrdersService);
  });

  describe('createOrder', () => {
    it('should throw 400 when userId is empty', async () => {
      // Arrange
      const userId = '';
      const amount = 500;

      let caughtError;

      // Act
      try {
        await ordersController.createOrder(userId, amount);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError.status).toEqual(400);
      expect(caughtError.message).toEqual(
        "Failed to find a value for required parameter 'userId'",
      );
    });

    it('should throw 400 when amount is empty', async () => {
      // Arrange
      const userId = 'foo-user';
      const amount: any = '';

      let caughtError;

      // Act
      try {
        await ordersController.createOrder(userId, amount);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError.status).toEqual(400);
      expect(caughtError.message).toEqual(
        "Failed to find a value for required parameter 'amount'",
      );
    });

    it('should throw 400 when amount is not a valid number', async () => {
      // Arrange
      const userId = 'foo-user';
      const amount: any = '25sg43';

      let caughtError;

      // Act
      try {
        await ordersController.createOrder(userId, amount);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError.status).toEqual(400);
      expect(caughtError.message).toEqual(
        "Invalid value provided for parameter 'amount'",
      );
    });

    it('should throw 500 when payments service errors out', async () => {
      // Arrange
      const userId = 'foo-user';
      const amount: any = 250;

      jest.spyOn(ordersService, 'createOrder').mockImplementation(() => {
        throw new Error('Simulated service failure');
      });

      let caughtError;

      // Act
      try {
        await ordersController.createOrder(userId, amount);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError.status).toEqual(500);
      expect(caughtError.message).toEqual(
        'Unexpected failure occurred when creating an order. Details: Simulated service failure',
      );
    });

    it('should return order response successfully', async () => {
      // Arrange
      const userId = 'foo-user';
      const amount: any = 250;

      jest.spyOn(ordersService, 'createOrder').mockImplementation(() => {
        return Promise.resolve(
          new OrderDTO('order-id', new Date(), OrderStatus.Created, amount),
        );
      });

      // Act
      const result = await ordersController.createOrder(userId, amount);

      // Assert
      expect(result.id).toEqual('order-id');
      expect(result.status).toEqual(OrderStatus.Created);
      expect(result.amount).toEqual(amount);
    });
  });

  describe('getOrderStatus', () => {
    it('should throw 400 when orderId is empty', async () => {
      // Arrange
      const orderId = '';

      let caughtError;

      // Act
      try {
        await ordersController.getOrderStatus(orderId);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError.status).toEqual(400);
      expect(caughtError.message).toEqual(
        "The provided Order ID: '' is invalid",
      );
    });

    it('should throw 400 when orderId is not a valid uuid', async () => {
      // Arrange
      const orderId = 'sehrheise-25236-gesg';

      let caughtError;

      // Act
      try {
        await ordersController.getOrderStatus(orderId);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError.status).toEqual(400);
      expect(caughtError.message).toEqual(
        "The provided Order ID: 'sehrheise-25236-gesg' is invalid",
      );
    });

    it('should throw 404 when order is not found', async () => {
      // Arrange
      const orderId = '2835e294-ca01-4f64-8d7c-72a2e65c1f24';

      jest.spyOn(ordersService, 'getOrderStatus').mockImplementation(() => {
        throw new OrderNotFoundException('Not found');
      });

      let caughtError;

      // Act
      try {
        await ordersController.getOrderStatus(orderId);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError.status).toEqual(404);
      expect(caughtError.message).toEqual('Not found');
    });

    it('should throw 500 when order service errors', async () => {
      // Arrange
      const orderId = '2835e294-ca01-4f64-8d7c-72a2e65c1f24';

      jest.spyOn(ordersService, 'getOrderStatus').mockImplementation(() => {
        throw new Error('Simulated failure');
      });

      let caughtError;

      // Act
      try {
        await ordersController.getOrderStatus(orderId);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError.status).toEqual(500);
      expect(caughtError.message).toEqual(
        'Unexpected failure occurred when creating an order. Details: Simulated failure',
      );
    });

    it('should return order status successfully', async () => {
      // Arrange
      const orderId = '2835e294-ca01-4f64-8d7c-72a2e65c1f24';

      jest.spyOn(ordersService, 'getOrderStatus').mockImplementation(() => {
        return Promise.resolve(OrderStatus.Delivered);
      });

      // Act
      const result = await ordersController.getOrderStatus(orderId);

      // Assert
      expect(result.orderStatus).toEqual(OrderStatus.Delivered);
    });
  });

  describe('cancelOrder', () => {
    it('should throw 400 when orderId is empty', async () => {
      // Arrange
      const orderId = '';

      let caughtError;

      // Act
      try {
        await ordersController.cancelOrder(orderId);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError.status).toEqual(400);
      expect(caughtError.message).toEqual(
        "The provided Order ID: '' is invalid",
      );
    });

    it('should throw 400 when orderId is not a valid uuid', async () => {
      // Arrange
      const orderId = 'sehrheise-25236-gesg';

      let caughtError;

      // Act
      try {
        await ordersController.cancelOrder(orderId);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError.status).toEqual(400);
      expect(caughtError.message).toEqual(
        "The provided Order ID: 'sehrheise-25236-gesg' is invalid",
      );
    });

    it('should throw 404 when order is not found', async () => {
      // Arrange
      const orderId = '2835e294-ca01-4f64-8d7c-72a2e65c1f24';

      jest.spyOn(ordersService, 'cancelOrder').mockImplementation(() => {
        throw new OrderNotFoundException('Not found');
      });

      let caughtError;

      // Act
      try {
        await ordersController.cancelOrder(orderId);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError.status).toEqual(404);
      expect(caughtError.message).toEqual('Not found');
    });

    it('should throw 500 when order service errors', async () => {
      // Arrange
      const orderId = '2835e294-ca01-4f64-8d7c-72a2e65c1f24';

      jest.spyOn(ordersService, 'cancelOrder').mockImplementation(() => {
        throw new Error('Simulated failure');
      });

      let caughtError;

      // Act
      try {
        await ordersController.cancelOrder(orderId);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError.status).toEqual(500);
      expect(caughtError.message).toEqual(
        'Unexpected failure occurred when creating an order. Details: Simulated failure',
      );
    });

    it('should return order cancelled status successfully', async () => {
      // Arrange
      const orderId = '2835e294-ca01-4f64-8d7c-72a2e65c1f24';

      jest.spyOn(ordersService, 'cancelOrder').mockImplementation(() => {
        return Promise.resolve(OrderStatus.Cancelled);
      });

      // Act
      const result = await ordersController.cancelOrder(orderId);

      // Assert
      expect(result.orderStatus).toEqual(OrderStatus.Cancelled);
    });
  });
});
