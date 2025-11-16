import nodemailer from 'nodemailer';
import { winstonLogger } from './winstonLogger.js';

const sendEmail = async (email: string, subject: string, message: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: subject,
      html: message,
    });
  } catch (error) {
    winstonLogger.error('Email not sent:', error);
    // Re-throw the error to be caught by the service
    throw new Error('Email sending failed');
  }
};

export default sendEmail;