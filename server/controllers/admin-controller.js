import User from "../models/user-model.js";

/*
---------------------------------------
GET ALL USERS (Admin Only)
---------------------------------------
*/
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find().select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ message: error.message });
  }
};

/*
---------------------------------------
SUSPEND / UNSUSPEND USER
---------------------------------------
*/
const toggleSuspendUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        message: "Cannot suspend another admin",
      });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.status(200).json({
      message: user.isSuspended
        ? "User suspended successfully"
        : "User unsuspended successfully",
      isSuspended: user.isSuspended,
    });
  } catch (error) {
    console.error("Suspend error:", error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  getAllUsers,
  toggleSuspendUser,
};
