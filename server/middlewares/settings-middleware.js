import Settings from "../models/settings-model.js";

/*
---------------------------------------
MAINTENANCE MODE MIDDLEWARE
Blocks non-admin users from accessing the platform during maintenance
---------------------------------------
*/
export const maintenanceModeMiddleware = async (req, res, next) => {
  try {
    const settings = await Settings.getInstance();

    if (settings.maintenanceMode) {
      // Allow admins to access everything
      if (req.user?.role === "admin") {
        return next();
      }

      // Allow auth routes
      if (req.path.includes("/api/auth")) {
        return next();
      }

      // Allow settings endpoint for frontend to check status
      if (req.path.includes("/api/settings")) {
        return next();
      }

      return res.status(503).json({
        message: settings.maintenanceMessage,
        maintenanceMode: true,
      });
    }

    next();
  } catch (error) {
    console.error("Maintenance mode check error:", error);
    next(); // Allow if there's an error checking settings
  }
};

/*
---------------------------------------
FEATURE TOGGLE MIDDLEWARE
Checks if specific features are enabled
---------------------------------------
*/
export const checkFeatureToggle = (feature) => {
  return async (req, res, next) => {
    try {
      const settings = await Settings.getInstance();

      if (!settings[feature]) {
        return res.status(403).json({
          message: `${feature} is currently disabled by administrators`,
          featureDisabled: true,
        });
      }

      next();
    } catch (error) {
      console.error("Feature toggle check error:", error);
      next(); // Allow if there's an error
    }
  };
};
