import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
    verificationToken: {
      type: String,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isSuspended: {
      type: Boolean,
      default: false,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    coordinates: {
      type: String, // or use object if storing lat/lng
      default: "",
    },

    role: {
      type: String,
      enum: ["volunteer", "ngo", "admin"],
      required: true,
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    location: {
      type: String,
      trim: true,
      default: "",
    },

    bio: {
      type: String,
      maxlength: 300,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

//
// Hash password automatically
//
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//
// Generate JWT
//
userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "30d" },
  );
};

//
// Compare password
//
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
