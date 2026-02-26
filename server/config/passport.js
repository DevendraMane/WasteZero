import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user-model.js";

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

        if (!email) {
          return done(new Error("Google account has no email"), null);
        }

        const existingUser = await User.findOne({ email });

        // 🔴 Case 1: Email exists but registered via normal login
        if (existingUser && !existingUser.googleId) {
          return done(null, false, {
            message:
              "User already exists with email/password. Please login normally.",
          });
        }

        // 🟢 Case 2: Already registered with Google
        if (existingUser && existingUser.googleId) {
          return done(null, existingUser);
        }

        // 🟢 Case 3: New Google user
        const newUser = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          role: "volunteer",
          isVerified: true, // Google users auto-verified
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

export default passport;
