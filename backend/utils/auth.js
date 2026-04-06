import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("CRITICAL ERROR: JWT_SECRET environment variable is missing!");
}

export const protectAdmin = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized as admin' });
      }
      
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
         return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

export const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: '30d',
  });
};
