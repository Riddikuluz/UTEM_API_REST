var GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");

// Se configura Passport con la estrategia de autenticación de Google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.google_Client_Id, // ID de cliente de Google
      clientSecret: process.env.google_Client_Secret, // Clave secreta de cliente de Google
      callbackURL: process.env.http_Domain_Server || process.env.http_Domain, // URL de retorno de llamada para la autenticación de Google
      passReqToCallback: true, // Pasar la solicitud al callback para mayor flexibilidad
    },
    async function (
      request,
      accessToken,
      refreshToken,
      idToken,
      profile,
      done
    ) {
      try {
        done(null, idToken.id_token); // Se completa la autenticación con el token de identificación de Google
      } catch (error) {
        functions.logError(error); // Se registra el error en caso de que ocurra
        done(error); // Se indica el error en la autenticación
      }
    }
  )
);

// Serialización y deserialización del usuario en la sesión
passport.serializeUser((user, done) => {
  done(null, user); // Se serializa el usuario en la sesión
});

passport.deserializeUser((user, done) => {
  done(null, user); // Se deserializa el usuario en la sesión
});
