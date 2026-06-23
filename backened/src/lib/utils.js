// import jwt from 'jsonwebtoken';

// export const generateToken = (userId,res)=>{
//     const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
//     res.cookie("jwt",token,{
//         maxAge:7*24*60*60*1000,
//         httpOnly:true,
//         sameSite: "strict",
//         secure: process.env.NODE_ENV!=="development"
//     });
//     return token;
// }

import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
  if (!userId) {
    throw new Error('Invalid user ID');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT secret is not set');
  }

  try {
    const token = jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      secure: process.env.NODE_ENV !== "development",
      domain: process.env.NODE_ENV === "production" ? undefined : "localhost"
    });

    return token;
  } catch (error) {
    throw new Error(`Failed to generate token: ${error.message}`);
  }
};
