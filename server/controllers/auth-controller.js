import User from "../models/user-model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      address,
      coordinates,
      role,
      skills,
      location,
      bio,
    } = req.body;

    // check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // create user (password will be hashed automatically)
    const newUser = new User({
      name,
      email,
      password,
      address,
      coordinates,
      role,
      skills,
      location,
      bio,
    });

    await newUser.save();

    // generate token
    const token = newUser.generateToken();

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if email and password provided
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // compare password using schema method
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // generate token using schema method
    const token = user.generateToken();

    // send response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export default {
  register,
  login,
};
