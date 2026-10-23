import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;

function getTransporter() {
  if (!env.SMTP.host) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP.host,
      port: env.SMTP.port,
      secure: env.SMTP.secure,
      auth: env.SMTP.user ? { user: env.SMTP.user, pass: env.SMTP.pass } : undefined,
    });
  }
  return transporter;
}

// Sends a plain-text confirmation. Failures are logged and never block the booking.
export async function sendConfirmationEmail(appointment) {
  const mailer = getTransporter();
  if (!mailer) return { skipped: true };

  const { reference, patientName, email, doctorName, treatment, appointmentDate, timeSlot } = appointment;
  const text = [
    `Dear ${patientName},`,
    '',
    `Thank you for booking with ${env.CLINIC_NAME}. Your request has been received.`,
    '',
    `Reference: ${reference}`,
    `Doctor: ${doctorName}`,
    `Treatment: ${treatment}`,
    `Preferred date: ${appointmentDate}`,
    `Preferred time: ${timeSlot}`,
    '',
    'Status: Pending. Our team will contact you to confirm your appointment.',
    '',
    `If you need to change this booking, please contact the clinic and quote reference ${reference}.`,
  ].join('\n');

  try {
    await mailer.sendMail({
      from: env.SMTP.from,
      to: email,
      subject: `Appointment request received (${reference})`,
      text,
    });
    return { sent: true };
  } catch (err) {
    console.error('Confirmation email failed for reference', reference, '-', err.code || err.message);
    return { sent: false };
  }
}

// Forwards a website enquiry to the clinic inbox. Returns false when SMTP is not configured.
export async function sendClinicEnquiry({ name, email, message }) {
  const mailer = getTransporter();
  if (!mailer || !env.CLINIC_EMAIL) return false;
  // Plain-text body, so the message cannot inject HTML into the clinic's mail client.
  await mailer.sendMail({
    from: env.SMTP.from,
    to: env.CLINIC_EMAIL,
    replyTo: email,
    subject: `Website enquiry from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  });
  return true;
}
