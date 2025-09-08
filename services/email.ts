
import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport(config.smtp);

export async function sendContactEmail(name: string, fromEmail: string, message: string) {
  const mailOptions = {
    from: `"Biophilia Website" <${config.smtp.auth.user}>`,
    to: config.smtp.auth.user,
    replyTo: fromEmail,
    subject: `New Contact Form Message from ${name}`,
    text: message,
    html: `
      <p><strong>From:</strong> ${name}</p>
      <p><strong>Email:</strong> ${fromEmail}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}