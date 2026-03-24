import User from "../models/user-model.js";
import Pickup from "../models/pickup-model.js";
import Opportunity from "../models/opportunity-model.js";
import Report from "../models/report-model.js";
import AdminLog from "../models/admin-log-model.js";
import { sendSuspensionStatusEmail } from "../utils/sendEmail.js";
import {
  logAdminAction,
  getClientIp,
  getUserAgent,
} from "../utils/adminLogHelper.js";

/*
---------------------------------------
GET DASHBOARD STATS (Admin Only)
---------------------------------------
*/
const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Log view action asynchronously (don't wait for it)
    logAdminAction(
      "view_analytics",
      null,
      "other",
      req.user._id,
      req.user.name,
      req.user.email,
      `Viewed dashboard statistics`,
      getClientIp(req),
      "success",
    ).catch(() => {});

    // Total counts
    const [totalUsers, completedPickups, pendingPickups, activeOpportunities] =
      await Promise.all([
        User.countDocuments(),
        Pickup.countDocuments({ status: "completed" }),
        Pickup.countDocuments({ status: "pending" }),
        Opportunity.countDocuments({ status: "open" }),
      ]);

    // User distribution by role
    const userDistribution = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const pieData = userDistribution.map((item) => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1) + "s",
      value: item.count,
    }));

    // Monthly pickups for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyPickups = await Pickup.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          pickups: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Monthly opportunities for the last 6 months
    const monthlyOpportunities = await Opportunity.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          opportunities: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Create array of all months in the last 6 months
    const currentDate = new Date();
    const barData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      );
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = monthNames[month - 1];

      const pickupCount =
        monthlyPickups.find((p) => p._id.year === year && p._id.month === month)
          ?.pickups || 0;

      const opportunityCount =
        monthlyOpportunities.find(
          (o) => o._id.year === year && o._id.month === month,
        )?.opportunities || 0;

      barData.push({
        month: monthName,
        pickups: pickupCount,
        opportunities: opportunityCount,
      });
    }

    // Recent users (last 5 registrations)
    const recentUsers = await User.find()
      .select("name role createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      totalUsers,
      completedPickups,
      pendingPickups,
      activeOpportunities,
      pieData,
      barData,
      recentUsers,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

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

    // Log view action asynchronously
    logAdminAction(
      "view_analytics",
      null,
      "other",
      req.user._id,
      req.user.name,
      req.user.email,
      `Viewed all users list`,
      getClientIp(req),
      "success",
    ).catch(() => {});

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

    const isSuspending = !user.isSuspended;
    const reason = req.body?.reason?.trim() || "";

    if (isSuspending && !reason) {
      return res.status(400).json({
        message: "Suspension reason is required",
      });
    }

    user.isSuspended = isSuspending;
    user.suspensionReason = isSuspending ? reason : "";
    user.suspendedAt = isSuspending ? new Date() : null;
    await user.save();

    // Send suspension status email asynchronously (fire-and-forget)
    sendSuspensionStatusEmail(user.email, {
      name: user.name,
      isSuspended: user.isSuspended,
      reason: user.suspensionReason,
    }).catch((mailError) => {
      console.error("Failed to send suspension status email:", mailError);
    });

    // Log admin action
    const actionType = isSuspending ? "Suspended" : "Unsuspended";
    await logAdminAction(
      "update_user",
      user._id,
      "user",
      req.user._id,
      req.user.name,
      req.user.email,
      `${actionType} user: ${user.name} (${user.email}) - Reason: ${reason}`,
      getClientIp(req),
      "success",
    );

    res.status(200).json({
      message: user.isSuspended
        ? "User suspended successfully"
        : "User unsuspended successfully",
      isSuspended: user.isSuspended,
    });
  } catch (error) {
    console.error("Suspend error:", error);

    // Log failed action
    await logAdminAction(
      "update_user",
      req.params.id,
      "user",
      req.user._id,
      req.user.name,
      req.user.email,
      `Failed to suspend/unsuspend user`,
      getClientIp(req),
      "failed",
      error.message,
    ).catch(() => {}); // Ignore logging error

    res.status(500).json({ message: error.message });
  }
};

/*
---------------------------------------
GET ANALYTICS DATA (Admin Only)
---------------------------------------
*/
const getAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Log view action asynchronously
    logAdminAction(
      "view_analytics",
      null,
      "other",
      req.user._id,
      req.user.name,
      req.user.email,
      `Viewed analytics - From: ${req.query.fromDate || "N/A"}, To: ${req.query.toDate || "N/A"}`,
      getClientIp(req),
      "success",
    ).catch(() => {});

    const { fromDate, toDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (fromDate) {
      dateFilter.$gte = new Date(fromDate);
    }
    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.$lte = endDate;
    }

    const pickupMatch =
      Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
    const userMatch =
      Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    // Total counts
    const [
      totalUsers,
      totalNGOs,
      totalVolunteers,
      totalAdmins,
      totalPickups,
      completedPickups,
      pendingPickups,
      totalOpportunities,
      activeOpportunities,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "ngo" }),
      User.countDocuments({ role: "volunteer" }),
      User.countDocuments({ role: "admin" }),
      Pickup.countDocuments(pickupMatch),
      Pickup.countDocuments({ ...pickupMatch, status: "completed" }),
      Pickup.countDocuments({ ...pickupMatch, status: "pending" }),
      Opportunity.countDocuments(),
      Opportunity.countDocuments({ status: "open" }),
    ]);

    const completionRate =
      totalPickups > 0
        ? Math.round((completedPickups / totalPickups) * 100)
        : 0;

    // Monthly pickup data (last 12 months or filtered range)
    const monthlyPickups = await Pickup.aggregate([
      { $match: pickupMatch },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Monthly opportunities data (last 12 months or filtered range)
    const monthlyOpportunities = await Opportunity.aggregate([
      {
        $match:
          Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Merge pickups and opportunities data - include all months
    const monthlyPickupData = [];
    const startDate = fromDate
      ? new Date(fromDate)
      : new Date(new Date().setMonth(new Date().getMonth() - 11));
    const endDate = toDate ? new Date(toDate) : new Date();

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setMonth(d.getMonth() + 1)
    ) {
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthName = monthNames[month - 1];

      const pickupCount =
        monthlyPickups.find((p) => p._id.year === year && p._id.month === month)
          ?.count || 0;

      const opportunityCount =
        monthlyOpportunities.find(
          (o) => o._id.year === year && o._id.month === month,
        )?.count || 0;

      monthlyPickupData.push({
        month: monthName,
        pickups: pickupCount,
        opportunities: opportunityCount,
      });
    }

    // User growth data (cumulative users over time)
    const userGrowth = await User.aggregate([
      userMatch ? { $match: userMatch } : { $match: {} },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Calculate cumulative users
    let cumulativeCount = 0;
    const userGrowthData = userGrowth.map((item) => {
      cumulativeCount += item.count;
      return {
        month: monthNames[item._id.month - 1],
        users: cumulativeCount,
      };
    });

    // User distribution by role
    const userDistribution = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const distributionData = userDistribution.map((item) => {
      const roleNames = {
        volunteer: "Volunteers",
        ngo: "NGOs",
        admin: "Admins",
      };
      return {
        name: roleNames[item._id] || item._id,
        value: item.count,
      };
    });

    res.status(200).json({
      stats: {
        totalUsers,
        totalNGOs,
        totalVolunteers,
        totalAdmins,
        totalPickups,
        completedPickups,
        pendingPickups,
        totalOpportunities,
        activeOpportunities,
        completionRate,
      },
      monthlyPickupData,
      userGrowthData,
      userDistribution: distributionData,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: error.message });
  }
};

/*
---------------------------------------
EXPORT USERS AS CSV (Admin Only)
---------------------------------------
*/
const exportUsersCSV = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Log export action asynchronously
    logAdminAction(
      "other",
      null,
      "other",
      req.user._id,
      req.user.name,
      req.user.email,
      `Exported users as CSV`,
      getClientIp(req),
      "success",
    ).catch(() => {});

    const users = await User.find().select(
      "name email role isSuspended isVerified createdAt",
    );

    // Create CSV header
    const csvHeader = "Name,Email,Role,Status,Verified,Created Date\n";

    // Create CSV rows
    const csvRows = users
      .map((user) => {
        const status = user.isSuspended ? "Suspended" : "Active";
        const verified = user.isVerified ? "Yes" : "No";
        const createdDate = new Date(user.createdAt).toLocaleDateString();

        return `"${user.name}","${user.email}","${user.role}","${status}","${verified}","${createdDate}"`;
      })
      .join("\n");

    const csvContent = csvHeader + csvRows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="users-report.csv"',
    );
    res.status(200).send(csvContent);
  } catch (error) {
    console.error("Export users error:", error);
    res.status(500).json({ message: error.message });
  }
};

/*
---------------------------------------
EXPORT PICKUPS AS CSV (Admin Only)
---------------------------------------
*/
const exportPickupsCSV = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Log export action asynchronously
    logAdminAction(
      "other",
      null,
      "other",
      req.user._id,
      req.user.name,
      req.user.email,
      `Exported pickups as CSV`,
      getClientIp(req),
      "success",
    ).catch(() => {});

    const pickups = await Pickup.find().populate("user_id", "name email");

    // Create CSV header
    const csvHeader =
      "User Name,User Email,Category,Location,Status,Scheduled Date,Created Date\n";

    // Create CSV rows
    const csvRows = pickups
      .map((pickup) => {
        const userName = pickup.user_id?.name || "N/A";
        const userEmail = pickup.user_id?.email || "N/A";
        const scheduledDate = new Date(
          pickup.scheduled_time,
        ).toLocaleDateString();
        const createdDate = new Date(pickup.createdAt).toLocaleDateString();

        return `"${userName}","${userEmail}","${pickup.category}","${pickup.location}","${pickup.status}","${scheduledDate}","${createdDate}"`;
      })
      .join("\n");

    const csvContent = csvHeader + csvRows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="pickups-report.csv"',
    );
    res.status(200).send(csvContent);
  } catch (error) {
    console.error("Export pickups error:", error);
    res.status(500).json({ message: error.message });
  }
};

/*
---------------------------------------
EXPORT FULL REPORT AS TXT/PDF (Admin Only)
---------------------------------------
*/
const exportFullReport = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Log export action asynchronously
    logAdminAction(
      "other",
      null,
      "other",
      req.user._id,
      req.user.name,
      req.user.email,
      `Exported full platform report`,
      getClientIp(req),
      "success",
    ).catch(() => {});

    const [
      totalUsers,
      totalNGOs,
      totalVolunteers,
      totalAdmins,
      totalPickups,
      completedPickups,
      pendingPickups,
      totalOpportunities,
      activeOpportunities,
      users,
      pickups,
      opportunities,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "ngo" }),
      User.countDocuments({ role: "volunteer" }),
      User.countDocuments({ role: "admin" }),
      Pickup.countDocuments(),
      Pickup.countDocuments({ status: "completed" }),
      Pickup.countDocuments({ status: "pending" }),
      Opportunity.countDocuments(),
      Opportunity.countDocuments({ status: "open" }),
      User.find().select("name email role isVerified isSuspended"),
      Pickup.find().populate("user_id", "name email").limit(100),
      Opportunity.find().populate("ngo_id", "name").limit(50),
    ]);

    const completionRate =
      totalPickups > 0
        ? Math.round((completedPickups / totalPickups) * 100)
        : 0;

    // Format date
    const reportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Create HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>WasteZero Full Report</title>
<style>
  body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
  h1 { color: #16a34a; border-bottom: 3px solid #16a34a; padding-bottom: 10px; }
  h2 { color: #333; margin-top: 30px; border-left: 4px solid #16a34a; padding-left: 10px; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
  th { background-color: #f3f4f6; font-weight: bold; }
  tr:nth-child(even) { background-color: #f9fafb; }
  .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
  .stat-box { background: #f3f4f6; padding: 15px; border-left: 4px solid #16a34a; }
  .stat-label { font-size: 14px; color: #666; }
  .stat-value { font-size: 24px; font-weight: bold; color: #000; }
  .report-header { text-align: center; margin-bottom: 30px; }
  .report-date { color: #666; font-size: 14px; }
</style>
</head>
<body>
<div class="report-header">
  <h1>WasteZero Platform - Full Report</h1>
  <p class="report-date">Generated on ${reportDate}</p>
</div>

<h2>Executive Summary</h2>
<div class="stats-grid">
  <div class="stat-box">
    <div class="stat-label">Total Users</div>
    <div class="stat-value">${totalUsers}</div>
  </div>
  <div class="stat-box">
    <div class="stat-label">Total Pickups</div>
    <div class="stat-value">${totalPickups}</div>
  </div>
  <div class="stat-box">
    <div class="stat-label">Completion Rate</div>
    <div class="stat-value">${completionRate}%</div>
  </div>
  <div class="stat-box">
    <div class="stat-label">Active Opportunities</div>
    <div class="stat-value">${activeOpportunities}</div>
  </div>
</div>

<h2>User Statistics</h2>
<table>
  <tr>
    <th>Category</th>
    <th>Count</th>
  </tr>
  <tr>
    <td>Total Users</td>
    <td>${totalUsers}</td>
  </tr>
  <tr>
    <td>Volunteers</td>
    <td>${totalVolunteers}</td>
  </tr>
  <tr>
    <td>NGOs</td>
    <td>${totalNGOs}</td>
  </tr>
  <tr>
    <td>Admins</td>
    <td>${totalAdmins}</td>
  </tr>
</table>

<h2>Pickup Statistics</h2>
<table>
  <tr>
    <th>Status</th>
    <th>Count</th>
  </tr>
  <tr>
    <td>Completed</td>
    <td>${completedPickups}</td>
  </tr>
  <tr>
    <td>Pending</td>
    <td>${pendingPickups}</td>
  </tr>
  <tr>
    <td>Total</td>
    <td>${totalPickups}</td>
  </tr>
</table>

<h2>Opportunity Statistics</h2>
<table>
  <tr>
    <th>Metric</th>
    <th>Count</th>
  </tr>
  <tr>
    <td>Total Opportunities</td>
    <td>${totalOpportunities}</td>
  </tr>
  <tr>
    <td>Active Opportunities</td>
    <td>${activeOpportunities}</td>
  </tr>
</table>

<h2>Recent Users</h2>
<table>
  <tr>
    <th>Name</th>
    <th>Email</th>
    <th>Role</th>
    <th>Verified</th>
    <th>Status</th>
  </tr>
  ${users
    .slice(0, 20)
    .map(
      (u) => `
  <tr>
    <td>${u.name}</td>
    <td>${u.email}</td>
    <td>${u.role}</td>
    <td>${u.isVerified ? "Yes" : "No"}</td>
    <td>${u.isSuspended ? "Suspended" : "Active"}</td>
  </tr>
  `,
    )
    .join("")}
</table>

<h2>Recent Pickups</h2>
<table>
  <tr>
    <th>User</th>
    <th>Category</th>
    <th>Location</th>
    <th>Status</th>
  </tr>
  ${pickups
    .slice(0, 20)
    .map(
      (p) => `
  <tr>
    <td>${p.user_id?.name || "N/A"}</td>
    <td>${p.category}</td>
    <td>${p.location}</td>
    <td>${p.status}</td>
  </tr>
  `,
    )
    .join("")}
</table>

<h2>Recent Opportunities</h2>
<table>
  <tr>
    <th>Title</th>
    <th>NGO</th>
    <th>Location</th>
    <th>Status</th>
  </tr>
  ${opportunities
    .slice(0, 20)
    .map(
      (o) => `
  <tr>
    <td>${o.title}</td>
    <td>${o.ngo_id?.name || "N/A"}</td>
    <td>${o.location}</td>
    <td>${o.status}</td>
  </tr>
  `,
    )
    .join("")}
</table>

<hr style="margin-top: 40px; border: none; border-top: 2px solid #16a34a;">
<p style="text-align: center; color: #666; font-size: 12px;">
  This is an automated report generated by WasteZero Admin System
</p>
</body>
</html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="wastezero-full-report.html"',
    );
    res.status(200).send(htmlContent);
  } catch (error) {
    console.error("Export full report error:", error);
    res.status(500).json({ message: error.message });
  }
};

/*
---------------------------------------
GET ALL OPPORTUNITY REPORTS (Admin Only)
---------------------------------------
*/
const getOpportunityReports = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Log view action asynchronously
    logAdminAction(
      "view_analytics",
      null,
      "other",
      req.user._id,
      req.user.name,
      req.user.email,
      `Viewed opportunity reports - Status: ${req.query.status || "all"}`,
      getClientIp(req),
      "success",
    ).catch(() => {});

    const { status = "pending" } = req.query;

    const filter = status ? { status } : {};

    const reports = await Report.find(filter)
      .populate("opportunity_id", "title description location date ngo_id")
      .populate("reported_by", "name email")
      .populate("opportunity_id.ngo_id", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ message: error.message });
  }
};

/*
---------------------------------------
DELETE REPORTED OPPORTUNITY (Admin Only)
---------------------------------------
*/
const deleteReportedOpportunity = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { reportId } = req.params;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const opportunityId = report.opportunity_id;

    // Delete the opportunity
    await Opportunity.findByIdAndDelete(opportunityId);

    // Update report status
    report.status = "reviewed";
    report.reviewed_by = req.user._id;
    report.reviewed_at = new Date();
    await report.save();

    // Log admin action
    await logAdminAction(
      "delete_opportunity",
      opportunityId,
      "opportunity",
      req.user._id,
      req.user.name,
      req.user.email,
      `Deleted opportunity from report: ${reportId}`,
      getClientIp(req),
      "success",
    );

    res.status(200).json({ message: "Opportunity deleted successfully" });
  } catch (error) {
    console.error("Delete reported opportunity error:", error);

    // Log failed action
    await logAdminAction(
      "delete_opportunity",
      null,
      "opportunity",
      req.user._id,
      req.user.name,
      req.user.email,
      `Failed to delete opportunity from report`,
      getClientIp(req),
      "failed",
      error.message,
    ).catch(() => {}); // Ignore logging error

    res.status(500).json({ message: error.message });
  }
};

/*
---------------------------------------
DISMISS OPPORTUNITY REPORT (Admin Only)
---------------------------------------
*/
const dismissOpportunityReport = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { reportId } = req.params;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Update report status
    report.status = "dismissed";
    report.reviewed_by = req.user._id;
    report.reviewed_at = new Date();
    await report.save();

    // Log admin action
    await logAdminAction(
      "dismiss_report",
      report.opportunity_id,
      "report",
      req.user._id,
      req.user.name,
      req.user.email,
      `Dismissed opportunity report: ${reportId}`,
      getClientIp(req),
      "success",
    );

    res.status(200).json({ message: "Report dismissed successfully" });
  } catch (error) {
    console.error("Dismiss report error:", error);

    // Log failed action
    await logAdminAction(
      "dismiss_report",
      null,
      "report",
      req.user._id,
      req.user.name,
      req.user.email,
      `Failed to dismiss opportunity report`,
      getClientIp(req),
      "failed",
      error.message,
    ).catch(() => {}); // Ignore logging error

    res.status(500).json({ message: error.message });
  }
};

/*
---------------------------------------
GET ADMIN ACTIVITY LOGS (Admin Only)
---------------------------------------
*/
const getAdminLogs = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const {
      page = 1,
      limit = 20,
      action,
      adminId,
      status,
      fromDate,
      toDate,
    } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (action) filter.action = action;
    if (adminId) filter.admin_id = adminId;
    if (status) filter.status = status;

    // Date range filter
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    // Fetch logs
    const [logs, total] = await Promise.all([
      AdminLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AdminLog.countDocuments(filter),
    ]);

    res.status(200).json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get admin logs error:", error);
    res.status(500).json({ message: error.message });
  }
};

/*
---------------------------------------
DELETE ADMIN LOG (Admin Only)
---------------------------------------
*/
const deleteAdminLog = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { logId } = req.params;

    const log = await AdminLog.findByIdAndDelete(logId);
    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    res.status(200).json({ message: "Log deleted successfully" });
  } catch (error) {
    console.error("Delete admin log error:", error);
    res.status(500).json({ message: error.message });
  }
};

/*
---------------------------------------
CLEAR OLD ADMIN LOGS (Admin Only)
---------------------------------------
*/
const clearOldLogs = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { daysOld = 90 } = req.body;

    // Delete logs older than specified days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await AdminLog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    res.status(200).json({
      message: `Deleted ${result.deletedCount} logs older than ${daysOld} days`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear old logs error:", error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  getDashboardStats,
  getAnalytics,
  getAllUsers,
  toggleSuspendUser,
  exportUsersCSV,
  exportPickupsCSV,
  exportFullReport,
  getOpportunityReports,
  deleteReportedOpportunity,
  dismissOpportunityReport,
  getAdminLogs,
  deleteAdminLog,
  clearOldLogs,
};
