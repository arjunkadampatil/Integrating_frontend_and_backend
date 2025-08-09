// backend/config/passport-setup.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback', // This is the route Google will redirect to
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const currentUser = await User.findOne({ googleId: profile.id });

        if (currentUser) {
          return done(null, currentUser);
        } else {
          // Create a new user if they don't exist
          const newUser = await new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            role: 'student',
            profileImageUrl: profile.photos[0].value,
          }).save();
          return done(null, newUser);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);