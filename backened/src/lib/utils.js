import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
  if (!userId) throw new Error('Invalid user ID');
  if (!process.env.JWT_SECRET) throw new Error('JWT secret is not set');

  try {
    const token = jwt.sign(
      { userId: userId.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const isProduction = process.env.NODE_ENV === 'production';

    // In production (cross-origin): sameSite=none + secure=true is REQUIRED for cookies to work
    // In development (same origin): sameSite=strict is fine
    res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'strict',
      secure: isProduction, // MUST be true when sameSite=none
      // Do NOT set domain at all — let the browser handle it
    });

    return token;
  } catch (error) {
    throw new Error(`Failed to generate token: ${error.message}`);
  }
};