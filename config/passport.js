const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const keys = require("./keys");

//bring in model
require("../models/User");
const User = mongoose.model("users");

module.exports = function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: "/auth/google/callback",
        proxy: true
      },
      function(accessToken, refreshToken, profile, done) {
        // console.log(accessToken);
        // console.log(profile);
        const image = profile.photos[0].value.substring(
          0,
          profile.photos[0].value.indexOf("?")
        );
        const newUser = {
          googleID: profile.id,
          email: profile.emails[0].value,
          firstname: profile.name.givenName,
          lastname: profile.name.familyName,
          image: image
        };

        //save to database
        User.findOne({
          googleID: profile.id
        })
          .then(user => {
            if (user) {
              //return user
              done(null, user);
            } else {
              //create user
              new User(newUser).save().then(user => done(null, user));
            }
          })
          .catch(err => console.log(err));
      }
    )
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
