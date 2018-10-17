const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mogoose = require("mongoose");
const keys = require("./keys");

module.exports = function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: "/auth/google/callback",
        proxy: true
      },
      function(accessToken, refreshToken, profile, cb) {
        console.log(accessToken);
        console.log(profile);
      }
    )
  );
};
