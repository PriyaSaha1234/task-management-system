import jwt from 'jsonwebtoken';

export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// Remove the password hash before sending a user to the browser
export function publicUser(user) {
  const { password, ...rest } = user;
  return rest;
}
