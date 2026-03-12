import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token",
    });
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // ✅ ADD THIS LINE
    req.userId = decoded.userId;

    // optional
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

// ================= OPTIONAL AUTH MIDDLEWARE =================
// This middleware tries to authenticate but doesn't block if no token
export const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // No token provided - that's OK, just continue
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.userId = decoded.userId;
    req.user = decoded;
  } catch (error) {
    console.error("Invalid token:", error.message);
    // Invalid token - ignore it and continue
    // (token will not be available in req.user)
  }

  next();
};
