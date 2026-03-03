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
          return done(null, false, {
            message:
              "User already exists with email/password. Please login normally.",
          });
        }

        /* ================= CASE 2 =================
           Already registered via Google
        */
        if (existingUser && existingUser.googleId) {
          if (googleImage && existingUser.profileImage !== googleImage) {
            existingUser.profileImage = googleImage;
            await existingUser.save();
          }

          return done(null, existingUser);
        }

        /* ================= CASE 3 =================
           New Google User
        */
        const newUser = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          profileImage: googleImage,
          role: "volunteer",
          isVerified: true,
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

export default passport;
