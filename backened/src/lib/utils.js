import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
  if (!userId) throw new Error('Invalid user ID');
  if (!process.env.JWT_SECRET) throw new Error('JWT secret is not set');

  const token = jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Still set cookie for same-origin / future use
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('jwt', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
  });

  // Also expose token in response header so frontend can save it
  res.setHeader('X-Auth-Token', token);

  return token;
};