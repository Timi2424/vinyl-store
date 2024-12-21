import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { User } from '../model/user.model';
import { Vinyl } from '../model/vinyl.model';
import { systemLogger } from '../utils/logger';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private emailService: EmailService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new InternalServerErrorException('Stripe secret key is not configured');
    }
    this.stripe = new Stripe(stripeSecretKey, {});
  }

  async createPaymentIntent(amount: number, currency: string, userEmail: string, vinylId: string) {
    if (amount <= 0) {
      throw new InternalServerErrorException('Invalid payment amount');
    }
  
    try {
      const vinyl = await Vinyl.findByPk(vinylId);
      if (!vinyl) {
        throw new NotFoundException(`Vinyl record with ID ${vinylId} not found`);
      }
  
      const user = await User.findOne({ where: { email: userEmail } });
      if (!user) {
        throw new NotFoundException(`User with email ${userEmail} not found`);
      }
  
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
      });
  
      await user.$add('purchasedVinylRecords', vinylId);
      systemLogger.log(`Vinyl ${vinylId} added to user ${userEmail}'s purchased records`);
  
      await this.emailService.sendPaymentConfirmation(userEmail, amount);
  
      return paymentIntent;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      systemLogger.error('Failed to create payment intent', error);
      throw new InternalServerErrorException(
        `Failed to create payment intent: ${error.message || error}`,
      );
    }
  }
  
}
