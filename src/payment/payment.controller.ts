import { Controller, Post, Body, Req, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { AuthenticatedRequest } from '../types/authReq.type';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { controllerLogger } from '../utils/logger';

@ApiTags('Payment (User Role Required)')
@Controller('payment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: 'Create a payment intent (Requires User Role)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'Amount in smallest currency unit (e.g., cents)' },
        currency: { type: 'string', description: 'Currency code (e.g., "usd")' },
        vinylId: { type: 'string', description: 'ID of the vinyl record being purchased' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Client secret for the payment intent' })
  @Post('intent')
  async createPaymentIntent(
    @Body() createPaymentDto: { amount: number; currency: string; vinylId: string },
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      controllerLogger.log(`PaymentController: User ${req.user.email} initiated a payment intent.`);
      const userEmail = req.user.email;
      const paymentIntent = await this.paymentService.createPaymentIntent(
        createPaymentDto.amount,
        createPaymentDto.currency,
        userEmail,
        createPaymentDto.vinylId,
      );
      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      controllerLogger.error('PaymentController: Failed to create payment intent', error);
      throw new HttpException('Failed to create payment intent', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

