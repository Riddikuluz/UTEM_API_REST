var GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport =require('passport');
require('dotenv').config();
const axios = require("axios");

passport.use(new GoogleStrategy({
    clientID:          process.env.google_Client_Id,
    clientSecret:      process.env.google_Client_Secret,
    callbackURL:       process.env.http_Domain_Server ||process.env.http_Domain,
    passReqToCallback: true
  },
  async function(request, accessToken, refreshToken,idToken, profile, done)
  {
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken.id_token}`
    );
      done(null, response.data);
  }));
passport.serializeUser(
  (user,done)=>{done(null, user);
});

passport.deserializeUser(
  (user,done)=>{done(null, user);});