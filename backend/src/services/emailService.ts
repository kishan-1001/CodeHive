export class EmailService {
  private apiKey: string;
  private apiUrl = 'https://api.brevo.com/v3/smtp/email';

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('BREVO_API_KEY is not configured');
    }
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTPEmail(email: string, otp: string, purpose: 'register' | 'forgot_password' = 'register'): Promise<void> {
    const subject = purpose === 'register'
      ? "Your OTP for CodeHive Registration"
      : "Your OTP for Password Reset";

    const title = purpose === 'register'
      ? "Welcome to CodeHive!"
      : "Reset Your Password";

    const message = purpose === 'register'
      ? "Your OTP for account verification is:"
      : "Your OTP for password reset is:";

    const emailData = {
      sender: {
        name: "CodeHive",
        email: "codehive.auth@gmail.com"
      },
      to: [{
        email: email
      }],
      subject: subject,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${title}</h2>
          <p>${message}</p>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <br>
          <p>Best regards,<br>CodeHive Team</p>
        </div>
      `,
      replyTo: {
        email: "support@codehive.com"
      }
    };

    try {
      console.log(`Sending ${purpose} OTP email to:`, email);
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      console.log('Brevo API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Brevo API error:', errorData);
        throw new Error('Failed to send OTP email');
      }
      console.log('OTP email sent successfully');
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }
}

export const emailService = new EmailService();
