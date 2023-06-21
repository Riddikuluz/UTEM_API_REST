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
  async function(request, accessToken, refreshToken,idToken, profile, done){

    try {
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken.id_token}`
      );
      const data = {
        iss: response.data.iss,
        azp: response.data.azp,
        aud: response.data.aud,
        sub: response.data.sub,
        hd: response.data.hd,
        email: response.data.email,
        email_verified: response.data.email_verified,
        at_hash: response.data.at_hash,
        iat: response.data.iat,
        exp: response.data.exp,
      };
      //console.log(data);
      done(null, data);
    } catch (error) {
      done(error);
    }
      }));
passport.serializeUser(
  (user,done)=>{done(null, user);
});

passport.deserializeUser(
  (user,done)=>{done(null, user);});