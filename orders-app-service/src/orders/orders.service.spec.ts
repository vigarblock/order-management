import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrdersEventManager } from './ordersEventManager';
import { PaymentsServiceClient } from '../clients/paymentsServiceClient';
import { OrderStatus } from './orderStatus';
import { OrderNotFoundException } from './errors/orderNotFoundException';

describe('OrdersService', () => {
  let ordersService: OrdersService;
  let ordersEventManager: OrdersEventManager;
  let paymentSvcClient: PaymentsServiceClient;

  const mockRepository = {
    insert: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        OrdersService,
        OrdersEventManager,
        PaymentsServiceClient,
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository,
        },
      ],
    }).compile();

    ordersService = moduleRef.get<OrdersService>(OrdersService);
    ordersEventManager = moduleRef.get<OrdersEventManager>(OrdersEventManager);
    paymentSvcClient = moduleRef.get<PaymentsServiceClient>(
      PaymentsServiceClient,
    );
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should insert to order repository with expected values', async () => {
      // Arrange
      const userId = 'foo-user';
      const amount = 250;

      const mockCalls = mockRepository.insert.mock.calls;
      jest.spyOn(ordersEventManager, 'publish').mockImplementation();

      // Act
      await ordersService.createOrder(userId, amount);

      // Assert
      expect(mockCalls[0][0].id).toBeDefined();
      expect(mockCalls[0][0].userId).toEqual(userId);
      expect(mockCalls[0][0].status).toEqual(OrderStatus.Created);
      expect(mockCalls[0][0].amount).toEqual(amount);
    });

    it('should update order status to confirmed when payment svc confirms', async () => {
      // Arrange
      const userId = 'foo-user';
      const amount = 250;

      const mockUpdateCalls = mockRepository.update.mock.calls;
      mockRepository.update.mockImplementation(() =>
        Promise.resolve({ affected: 1 }),
      );
      jest
        .spyOn(paymentSvcClient, 'postPaymentRequest')
        .mockImplementation(() =>
          Promise.resolve({
            status: 'confirmed',
          }),
        );

      // Act
      await ordersService.createOrder(userId, amount);

      // Assert
      expect(mockUpdateCalls[0][1].status).toEqual(OrderStatus.Confirmed);
    });

    it('should update order status to cancelled when payment svc declines', async () => {
      // Arrange
      const userId = 'foo-user';
      const amount = 250;

      const mockUpdateCalls = mockRepository.update.mock.calls;
      mockRepository.update.mockImplementation(() =>
        Promise.resolve({ affected: 1 }),
      );
      jest
        .spyOn(paymentSvcClient, 'postPaymentRequest')
        .mockImplementation(() =>
          Promise.resolve({
            status: 'declined',
          }),
        );

      // Act
      await ordersService.createOrder(userId, amount);

      // Assert
      expect(mockUpdateCalls[0][1].status).toEqual(OrderStatus.Cancelled);
    });

    it('should update order status from confirmed to delivered when payment svc confirms', async () => {
      // Arrange
      const userId = 'foo-user';
      const amount = 250;

      const mockUpdateCalls = mockRepository.update.mock.calls;
      mockRepository.update.mockImplementation(() =>
        Promise.resolve({ affected: 1 }),
      );
      jest
        .spyOn(paymentSvcClient, 'postPaymentRequest')
        .mockImplementation(() =>
          Promise.resolve({
            status: 'confirmed',
          }),
        );

      // Act
      await ordersService.createOrder(userId, amount);

      // Allow delay to test background logic
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      await delay(2500);

      // Assert
      expect(mockUpdateCalls[0][1].status).toEqual(OrderStatus.Confirmed);
      expect(mockUpdateCalls[1][1].status).toEqual(OrderStatus.Delivered);
    });
  });

  describe('getOrderStatus', () => {
    it('should return order status successfully', async () => {
      // Arrange
      const userId = 'foo-user';

      const order = new Order();
      order.status = OrderStatus.Created;

      mockRepository.find.mockImplementation(() => Promise.resolve([order]));

      // Act
      const result = await ordersService.getOrderStatus(userId);

      // Assert
      expect(result).toEqual(OrderStatus.Created);
    });

    it('should throw OrderNotFoundException if order is not found', async () => {
      // Arrange
      const userId = 'foo-user';

      mockRepository.find.mockImplementation(() => Promise.resolve([]));

      let caughtError;

      // Act
      try {
        await ordersService.getOrderStatus(userId);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError instanceof OrderNotFoundException).toBeTruthy();
    });
  });

  describe('cancelOrder', () => {
    it('should return cancelled order status successfully', async () => {
      // Arrange
      const userId = 'foo-user';

      mockRepository.update.mockImplementation(() =>
        Promise.resolve({ affected: 1 }),
      );

      // Act
      const result = await ordersService.cancelOrder(userId);

      // Assert
      expect(result).toEqual(OrderStatus.Cancelled);
    });

    it('should throw OrderNotFoundException if order not found when updating', async () => {
      // Arrange
      const userId = 'foo-user';

      mockRepository.update.mockImplementation(() =>
        Promise.resolve({ affected: 0 }),
      );

      let caughtError;

      // Act
      try {
        await ordersService.getOrderStatus(userId);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      expect(caughtError instanceof OrderNotFoundException).toBeTruthy();
    });
  });
});
