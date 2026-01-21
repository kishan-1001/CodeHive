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
  async sendApplicationEmail(data: {
    name: string;
    email: string;
    phone: string;
    linkedin?: string;
    resume: string;
    coverLetter?: string;
    jobTitle: string;
  }): Promise<void> {
    const emailData = {
      sender: {
        name: "CodeHive Careers",
        email: "codehive.auth@gmail.com"
      },
      to: [{
        email: "codehive.auth@gmail.com",
        name: "CodeHive HR"
      }],
      subject: `New Job Application: ${data.jobTitle} - ${data.name}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Job Application</h2>
          <p><strong>Job Title:</strong> ${data.jobTitle}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          
          <h3 style="color: #555;">Applicant Details</h3>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          ${data.linkedin ? `<p><strong>LinkedIn/Portfolio:</strong> <a href="${data.linkedin}">${data.linkedin}</a></p>` : ''}
          <p><strong>Resume Link:</strong> <a href="${data.resume}">${data.resume}</a></p>
          
          ${data.coverLetter ? `
          <h3 style="color: #555;">Cover Letter</h3>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${data.coverLetter}</div>
          ` : ''}
          
          <br>
          <p style="font-size: 12px; color: #888;">This application was submitted through the CodeHive Career page.</p>
        </div>
      `,
      replyTo: {
        email: data.email,
        name: data.name
      }
    };

    try {
      console.log(`Sending application email for ${data.name} to CodeHive`);
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
        throw new Error('Failed to send application email');
      }
      console.log('Application email sent successfully');
    } catch (error) {
      console.error('Error sending application email:', error);
      throw new Error('Failed to send application email');
    }
  }

  async sendContactEmail(data: {
    name: string;
    email: string;
    message: string;
  }): Promise<void> {
    const emailData = {
      sender: {
        name: data.name,
        email: "codehive.auth@gmail.com"
      },
      to: [{
        email: "codehive.auth@gmail.com",
        name: "CodeHive Support"
      }],
      subject: `New Contact Message from ${data.name}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Message</h2>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          
          <h3 style="color: #555;">Message</h3>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${data.message}</div>
          
          <br>
          <p style="font-size: 12px; color: #888;">This message was sent from the CodeHive Contact form.</p>
        </div>
      `,
      replyTo: {
        email: data.email,
        name: data.name
      }
    };

    try {
      console.log(`Sending contact email from ${data.email}`);
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
        throw new Error('Failed to send contact email');
      }
      console.log('Contact email sent successfully');
    } catch (error) {
      console.error('Error sending contact email:', error);
      throw new Error('Failed to send contact email');
    }
  }
}

export const emailService = new EmailService();
