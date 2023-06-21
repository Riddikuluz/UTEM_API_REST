const express = require("express");
const passport = require("passport");
const session = require("express-session");
const path = require("path");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
require("./auth");
const puerto = process.env.puertoServer || process.env.puerto;

function isLogIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.use(passport.initialize());
app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.clave,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, //ctp
  })
);

app.use(passport.session());
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/auth/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
    accessType: "offline",
    approvalPrompt: "force",
  })
);

app.get("/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/jwt",
    failureRedirect: "/auth/failure",
  })
);

app.get("/auth/jwt", isLogIn, (req, res) => {
  const dataUser = req.user;
  jwt.sign({ dataUser },process.env.clave,{ expiresIn: "24h" },
    function (err, token) {
      if (err) {
        res.sendStatus(500);
      } else {
        res.json(token);
        //res.redirect(`/auth/jwt/token?token=${token}`);
      }
    }
  );
});

app.get("/auth/jwt/token", verifyToken, function (req, res) {
  const tokenData = req.token;
  res.json(tokenData.dataUser);
  /*
  const token = req.query.token;
  jwt.verify({token}, process.env.clave, async function (err, tokendecode) {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(tokendecode.dataUser);
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${tokendecode.dataUser}`
      );
      res.send(response.data);
      //res.send(`DATA JWT: ${JSON.stringify(token)}`);
    }});
});
*/
});

//Authorization: Bearer <token>
function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = jwt.verify(bearerToken, process.env.clave);
    if (req.token) {
      next(); // Si el token es válido, pasa al siguiente middleware o ruta
    } else {
      res.sendStatus(403); // Si el token no es válido, responde con un estado 403 (Prohibido)
    }
  } else {
    res.sendStatus(403); // Si no se proporciona el encabezado de autorización, responde con un estado 403 (Prohibido)
  }
}

app.get("/auth/logout", (req, res) => {
  req.session.destroy();
  res.send("Hasta luego.");
});

app.get("/auth/failure", (req, res) => {
  res.sendStatus(500);
  res.send("Crenciales no validas.");
});

app.listen(puerto, () => {
  console.log(`Escuchando en el puerto ${puerto}`);
});

//npm install express dotenv express-session passport passport-google-oauth2 jsonwebtoken axios
//https://jwt.io/
