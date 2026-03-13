import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user-model.js";
import Settings from "../models/settings-model.js";
import logger from "../utils/logger.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const safeEmail = logger.maskEmail(email);

        if (!email) {
          logger.error("[PASSPORT] No email in Google profile");
          return done(new Error("Google account has no email"), null);
        }

        logger.info(
          `[PASSPORT] Processing Google auth for email: ${safeEmail}`,
        );

        /* GOOGLE PROFILE IMAGE */
        let googleImage = profile.photos?.[0]?.value || "";

        /* Improve Google image quality */
        if (googleImage) {
          googleImage = googleImage.replace("=s96-c", "=s400-c");
        }

        let existingUser = await User.findOne({ email });

        /* ================= CASE 1 =================
           Email exists but registered via password
        */
        if (existingUser && !existingUser.googleId) {
          logger.warn(
            `[PASSPORT] User ${safeEmail} exists with password, rejecting Google auth`,
          );
          return done(null, false, {
            message:
              "User already exists with email/password. Please login normally.",
          });
        }

        /* ================= CASE 2 =================
           Already registered via Google
        */
        if (existingUser && existingUser.googleId) {
          logger.info(
            `[PASSPORT] User ${safeEmail} already registered via Google, updating profile`,
          );
          if (googleImage && existingUser.profileImage !== googleImage) {
            existingUser.profileImage = googleImage;
            await existingUser.save();
          }

          return done(null, existingUser);
        }

        /* ================= CASE 3 =================
           New Google User
           Check if registrations are allowed
        */
        const settings = await Settings.getInstance();
        if (!settings.allowRegistrations) {
          logger.warn(
            `[PASSPORT] New user ${safeEmail} registration blocked: registrations disabled`,
          );
          return done(null, false, {
            message:
              "New registrations are currently disabled. Please contact admin to enable registrations.",
          });
        }

        logger.info(`[PASSPORT] Creating new Google user: ${safeEmail}`);
        const newUser = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          profileImage: googleImage,
          role: "volunteer",
          isVerified: true,
          isOnline: true,
          lastSeen: new Date(),
        });

        logger.info(`[PASSPORT] New user created: ${safeEmail}`);
        return done(null, newUser);
      } catch (error) {
        logger.error("[PASSPORT STRATEGY ERROR]", error);
        return done(error, null);
      }
    },
  ),
);

export default passport;
