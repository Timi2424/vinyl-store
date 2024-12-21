import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { systemLogger } from '../utils/logger';


@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
      debug: true,
    });

    this.transporter.verify((error) => {
      if (error) {
        systemLogger.error('Email service initialization error:', error);
      } else {
        systemLogger.log('Email service initialized successfully');
      }
    });
  }

  async sendProfileUpdatedEmail(user: { email: string; firstName: string }): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: user.email,
      subject: 'Profile Updated',
      text: `Hello ${user.firstName}, your profile has been updated successfully.`,
    };

    try {
      systemLogger.log(`Sending profile update email to ${user.email}...`);
      const info = await this.transporter.sendMail(mailOptions);
      systemLogger.log(`Profile update email sent: ${info.response}`);
    } catch (error) {
      systemLogger.error(`Failed to send profile update email: ${(error as Error).message}`);
    }
  }

  async sendPaymentConfirmation(email: string, amount: number): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: email,
      subject: 'Payment Confirmation',
      text: `Thank you for your purchase of $${(amount / 100).toFixed(2)}! Your payment has been successfully processed.`,
    };

    try {
      systemLogger.log(`Sending payment confirmation email to ${email}...`);
      const info = await this.transporter.sendMail(mailOptions);
      systemLogger.log(`Payment confirmation email sent: ${info.response}`);
    } catch (error) {
      systemLogger.error(`Failed to send payment confirmation email: ${(error as Error).message}`);
    }
  }
}
