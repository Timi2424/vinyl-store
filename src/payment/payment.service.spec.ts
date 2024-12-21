import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { Vinyl } from '../model/vinyl.model';
import { User } from '../model/user.model';
import { systemLogger } from '../utils/logger';

jest.mock('../utils/logger');

describe('PaymentService', () => {
  let service: PaymentService;
  let stripeMock: { paymentIntents: { create: jest.Mock } };
  let configService: Partial<ConfigService>;
  let emailService: Partial<EmailService>;

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockReturnValue('fake-stripe-secret-key'),
    };

    emailService = {
      sendPaymentConfirmation: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: ConfigService, useValue: configService },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);

    stripeMock = {
      paymentIntents: {
        create: jest.fn(),
      },
    };
    service['stripe'] = stripeMock as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPaymentIntent', () => {
    const mockUserEmail = 'test@example.com';
    const mockVinylId = 'vinyl-123';
    const mockAmount = 5000;
    const mockCurrency = 'usd';

    beforeEach(() => {
      jest.spyOn(Vinyl, 'findByPk').mockResolvedValue({ id: mockVinylId } as Vinyl);
      jest.spyOn(User, 'findOne').mockResolvedValue({ id: 'user-123', $add: jest.fn() } as any);
    });

    it('should throw an error if amount is <= 0', async () => {
      await expect(
        service.createPaymentIntent(0, mockCurrency, mockUserEmail, mockVinylId),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw NotFoundException if vinyl is not found', async () => {
      jest.spyOn(Vinyl, 'findByPk').mockResolvedValue(null);
    
      await expect(
        service.createPaymentIntent(mockAmount, mockCurrency, mockUserEmail, mockVinylId),
      ).rejects.toThrow(NotFoundException);
    });
    
    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
    
      await expect(
        service.createPaymentIntent(mockAmount, mockCurrency, mockUserEmail, mockVinylId),
      ).rejects.toThrow(NotFoundException);
    });
    

    it('should call Stripe to create a payment intent', async () => {
      stripeMock.paymentIntents.create.mockResolvedValue({ id: 'pi_123' } as Stripe.PaymentIntent);

      const result = await service.createPaymentIntent(
        mockAmount,
        mockCurrency,
        mockUserEmail,
        mockVinylId,
      );

      expect(stripeMock.paymentIntents.create).toHaveBeenCalledWith({
        amount: mockAmount,
        currency: mockCurrency,
      });
      expect(result).toEqual({ id: 'pi_123' });
    });

    it('should add vinyl to the user’s purchased records', async () => {
      const mockUser = { id: 'user-123', $add: jest.fn() } as any;
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);

      await service.createPaymentIntent(mockAmount, mockCurrency, mockUserEmail, mockVinylId);

      expect(mockUser.$add).toHaveBeenCalledWith('purchasedVinylRecords', mockVinylId);
    });

    it('should send a payment confirmation email', async () => {
      await service.createPaymentIntent(mockAmount, mockCurrency, mockUserEmail, mockVinylId);

      expect(emailService.sendPaymentConfirmation).toHaveBeenCalledWith(mockUserEmail, mockAmount);
    });

    it('should log success', async () => {
      jest.spyOn(systemLogger, 'log');

      await service.createPaymentIntent(mockAmount, mockCurrency, mockUserEmail, mockVinylId);

      expect(systemLogger.log).toHaveBeenCalledWith(
        expect.stringContaining(`Vinyl ${mockVinylId} added to user ${mockUserEmail}'s purchased records`),
      );
    });

    it('should throw an InternalServerErrorException on Stripe failure', async () => {
      stripeMock.paymentIntents.create.mockRejectedValue(new Error('Stripe error'));
    
      await expect(
        service.createPaymentIntent(mockAmount, mockCurrency, mockUserEmail, mockVinylId),
      ).rejects.toThrow(InternalServerErrorException);
    
      expect(systemLogger.error).toHaveBeenCalledWith(
        'Failed to create payment intent',
        expect.any(Error),
      );
    });
    
  });
});
