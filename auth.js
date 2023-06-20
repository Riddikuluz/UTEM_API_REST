var GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport =require('passport');
require('dotenv').config();
const axios = require("axios");

passport.use(new GoogleStrategy({
    clientID:          process.env.GOOGLE_CLIENT_ID,
    clientSecret:      process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:       process.env.HTTP_DOMAIN,
    passReqToCallback: true
  },
  async function(request, accessToken, refreshToken, profile, done) {

       const response = await axios.get(
          `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`
        );
        const data = response.data;
        done(null, data);
      }));

passport.serializeUser(
  (user,done)=>{done(null, user);
});

passport.deserializeUser(
  (user,done)=>{done(null, user);});