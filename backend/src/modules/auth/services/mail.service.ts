import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { mailConfig } from '../../../config/mail/mail.config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @Inject(mailConfig.KEY)
    private readonly mailConfiguration: ConfigType<typeof mailConfig>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.mailConfiguration.host || 'smtp.gmail.com',
      port: this.mailConfiguration.port || 587,
      secure: this.mailConfiguration.port === 465,
      auth: {
        user: this.mailConfiguration.user,
        pass: this.mailConfiguration.password,
      },
    });
  }

  async sendVerificationCode(email: string, name: string, code: string): Promise<void> {
    const mailOptions = {
      from: `"${this.mailConfiguration.fromName}" <${this.mailConfiguration.fromEmail}>`,
      to: email,
      subject: `Wandercall Verification Code: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0B0F19; color: #ffffff; rounded-corner: 16px;">
          <h2 style="color: #a855f7; margin-bottom: 20px;">Welcome to Wandercall, ${name}!</h2>
          <p style="font-size: 16px; color: #d4d4d8;">Thank you for starting your journey with us. Use the verification code below to verify your account:</p>
          <div style="background-color: #18181b; padding: 15px 25px; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #38bdf8; text-align: center; margin: 25px 0; border: 1px solid #27272a;">
            ${code}
          </div>
          <p style="font-size: 14px; color: #a1a1aa;">This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #27272a; margin: 30px 0;" />
          <p style="font-size: 12px; color: #71717a; text-align: center;">&copy; Wandercall Inc. Ultra-Scale Travel & Experience Platform</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(`Failed to send verification code email to ${email}`, error);
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const mailOptions = {
      from: `"${this.mailConfiguration.fromName}" <${this.mailConfiguration.fromEmail}>`,
      to: email,
      subject: `Welcome to the Wandercall Community, ${name}! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0B0F19; color: #ffffff;">
          <h2 style="color: #38bdf8;">Your Profile is Live!</h2>
          <p style="font-size: 16px; color: #d4d4d8;">Congratulations, ${name}! Your profile setup is complete and your account is now fully active.</p>
          <p style="font-size: 16px; color: #d4d4d8;">You can now join live campfires, track quests, and discover experiences worth remembering.</p>
          <hr style="border: none; border-top: 1px solid #27272a; margin: 30px 0;" />
          <p style="font-size: 12px; color: #71717a; text-align: center;">&copy; Wandercall Inc.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}`, error);
    }
  }
}
