// Verify reCAPTCHA v2 token
export const verifyRecaptcha = async (token) => {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    // reCAPTCHA v2 returns success: true/false
    if (!data.success) {
      return {
        valid: false,
        message: 'reCAPTCHA verification failed',
        error: data['error-codes']?.[0] || 'Unknown error',
      };
    }

    return {
      valid: true,
      message: 'reCAPTCHA verification successful',
    };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return {
      valid: false,
      message: 'Failed to verify reCAPTCHA',
      error: error.message,
    };
  }
};
