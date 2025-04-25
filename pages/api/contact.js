import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message } = req.body;
    
    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'chatxcontactus@gmail.com',
        pass: process.env.EMAIL_PASSWORD // Set this in .env.local
      }
    });

    // Email options
    const mailOptions = {
      from: email,
      to: 'chatxcontactus@gmail.com',
      subject: `ChatX Contact Form: ${subject || 'New message'}`,
      replyTo: email,
      text: `
Name: ${name}
Email: ${email}
Subject: ${subject || 'N/A'}

Message:
${message}
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #f18203;">New Contact Form Submission</h2>
  <p><strong>From:</strong> ${name} (${email})</p>
  <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 15px;">
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, '<br>')}</p>
  </div>
</div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    // Return success
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
} 