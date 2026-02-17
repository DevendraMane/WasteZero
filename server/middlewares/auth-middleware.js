import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      message: "No token",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.userId = decoded.userId;

    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid token",
    });
  }
};
