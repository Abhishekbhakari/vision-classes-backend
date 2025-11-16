import sendEmail from '../../utils/sendEmail.js';
import AppError from '../../utils/appError.js';
import { HttpCode } from '../../constants/httpCode.js';

type ContactInput = {
  name: string;
  email: string;
  message: string;
};

class ContactService {
  public async sendContactEmail(input: ContactInput): Promise<void> {
    const { name, email, message } = input;
    const adminEmail = process.env.CONTACT_FORM_EMAIL; // Set this in your .env

    if (!adminEmail) {
      throw new AppError(
        'Contact form is not configured.',
        HttpCode.INTERNAL_SERVER_ERROR
      );
    }

    try {
      // 1. Send email to admin
      const subject = 'New Contact Form Message';
      const adminMessage = `
        <h1>New message from ${name}</h1>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `;
      await sendEmail(adminEmail, subject, adminMessage);

      // 2. Send confirmation email to user
      const userSubject = 'Thank you for contacting us!';
      const userMessage = `
        <h1>Hi ${name},</h1>
        <p>We have received your message and will get back to you shortly.</p>
        <p><strong>Your message:</strong></p>
        <p><em>${message}</em></p>
      `;
      await sendEmail(email, userSubject, userMessage);
    } catch (error: any) {
      throw new AppError(
        'Failed to send message, please try again.',
        HttpCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const contactService = new ContactService();