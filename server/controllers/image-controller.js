import User from "../models/user-model.js";

/* ================= UPLOAD PROFILE IMAGE ================= */
const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: req.file.filename },
      { new: true },
    ).select("-password");

    res.status(200).json({
      message: "Profile image updated successfully",
      imageUrl: req.file.filename,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export default {
  uploadProfileImage,
};
