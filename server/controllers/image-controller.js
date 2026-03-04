import User from "../models/user-model.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

/* ================= UPLOAD PROFILE IMAGE ================= */

const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const user = await User.findById(userId);

    /* DELETE OLD IMAGE */
    if (user.profileImagePublicId) {
      await cloudinary.uploader.destroy(user.profileImagePublicId);
    }

    /* STREAM UPLOAD TO CLOUDINARY */

    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "wastezero_profiles" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          },
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await streamUpload();

    user.profileImage = result.secure_url;
    user.profileImagePublicId = result.public_id;

    await user.save();

    res.status(200).json({
      message: "Profile image updated",
      imageUrl: result.secure_url,
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
