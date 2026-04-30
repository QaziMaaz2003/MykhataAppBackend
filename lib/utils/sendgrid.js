import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendOTPEmail = async (email, otp) => {
  try {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@khataapp.com',
      subject: 'Your KhataApp Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p style="color: #666; font-size: 16px;">Welcome to KhataApp!</p>
          <p style="color: #666; font-size: 16px;">Your verification code is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h1 style="color: #4ca3f8; letter-spacing: 5px; font-size: 32px; margin: 0;">
              ${otp}
            </h1>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">© KhataApp ${new Date().getFullYear()}</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@khataapp.com',
      subject: 'Reset Your KhataApp Password',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #666; font-size: 16px;">We received a request to reset your password.</p>
          <p style="color: #666; font-size: 16px;">Your password reset code is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h1 style="color: #4ca3f8; letter-spacing: 5px; font-size: 32px; margin: 0;">
              ${resetLink}
            </h1>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request a password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">© KhataApp ${new Date().getFullYear()}</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    throw error;
  }
};
