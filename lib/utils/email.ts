import nodemailer from "nodemailer";

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

/**
 * Create email transporter based on environment variables
 */
function createTransporter() {
  // Use SMTP configuration from environment variables
  const smtpConfig = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_FROM,
      pass: process.env.SMTP_PASSWORD,
    },
  };

  // If SMTP credentials are not provided, use a test account (development only)
  if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
    console.warn(
      "⚠️  SMTP credentials not configured. Email sending will fail. Please set SMTP_USER and SMTP_PASSWORD environment variables."
    );
    // For development/testing, you can use Ethereal Email or similar
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal.user@ethereal.email",
        pass: "ethereal.password",
      },
    });
  }

  return nodemailer.createTransport(smtpConfig);
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@doctorbooking.com",
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Send calendar invitation email
 */
export async function sendCalendarInvite(
  to: string | string[],
  calendarContent: string,
  bookingDetails: {
    doctorName: string;
    customerName: string;
    date: string;
    time: string;
    services: string[];
  }
): Promise<boolean> {
  const subject = `Doctor Appointment - ${bookingDetails.doctorName} - ${bookingDetails.date}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Doctor Appointment Confirmation</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px;">Hello,</p>
          
          <p style="font-size: 16px;">Your doctor appointment has been confirmed. Please find the details below:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h2 style="margin-top: 0; color: #667eea;">Appointment Details</h2>
            <p><strong>Doctor:</strong> ${bookingDetails.doctorName}</p>
            <p><strong>Customer:</strong> ${bookingDetails.customerName}</p>
            <p><strong>Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
            <p><strong>Time:</strong> ${bookingDetails.time}</p>
            <p><strong>Services:</strong> ${bookingDetails.services.join(", ")}</p>
          </div>
          
          <p style="font-size: 16px;">
            A calendar invitation has been attached to this email. Please click "Add to Calendar" 
            or open the attached .ics file to add this appointment to your calendar.
          </p>
          
          <p style="font-size: 16px;">
            Please arrive on time for your appointment. If you need to cancel or reschedule, 
            please do so as soon as possible.
          </p>
          
          <p style="font-size: 16px; margin-top: 30px;">
            Best regards,<br>
            <strong>Doctor Booking App</strong>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </body>
    </html>
  `;

  const text = `
Doctor Appointment Confirmation

Your doctor appointment has been confirmed:

Doctor: ${bookingDetails.doctorName}
Customer: ${bookingDetails.customerName}
Date: ${new Date(bookingDetails.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
Time: ${bookingDetails.time}
Services: ${bookingDetails.services.join(", ")}

A calendar invitation has been attached to this email. Please open the .ics file to add this appointment to your calendar.

Please arrive on time for your appointment.
  `;

  return await sendEmail({
    to,
    subject,
    text,
    html,
    attachments: [
      {
        filename: "appointment.ics",
        content: calendarContent,
        contentType: "text/calendar; charset=UTF-8; method=REQUEST",
      },
    ],
  });
}


