// Serviço de envio de emails
import { config } from './config-simple';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private provider: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.provider = config.email.provider;
    this.fromEmail = config.email.fromEmail;
    this.fromName = config.email.fromName;
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    try {
      switch (this.provider) {
        case 'resend':
          return await this.sendWithResend(options);
        case 'sendgrid':
          return await this.sendWithSendGrid(options);
        case 'console':
        default:
          return await this.sendWithConsole(options);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async sendWithConsole(options: EmailOptions): Promise<{ success: boolean }> {
    console.log('📧 Email (Console Mode):');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('HTML:', options.html);
    console.log('Text:', options.text);
    return { success: true };
  }

  private async sendWithResend(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    const apiKey = config.email.resendApiKey;
    if (!apiKey) {
      console.warn('⚠️ RESEND_API_KEY not configured, using console mode');
      return this.sendWithConsole(options);
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: `${this.fromName} <${this.fromEmail}>`,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to send email',
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  private async sendWithSendGrid(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    const apiKey = config.email.sendgridApiKey;
    if (!apiKey) {
      console.warn('⚠️ SENDGRID_API_KEY not configured, using console mode');
      return this.sendWithConsole(options);
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: options.to }],
              subject: options.subject,
            },
          ],
          from: {
            email: this.fromEmail,
            name: this.fromName,
          },
          content: [
            {
              type: 'text/html',
              value: options.html,
            },
            ...(options.text ? [{
              type: 'text/plain',
              value: options.text,
            }] : []),
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: errorText || 'Failed to send email',
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }
}

export const emailService = new EmailService();

