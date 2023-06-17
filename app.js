const express = require('express');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const app = express();
const PUERTO = process.env.PORT || 3000
require('./auth');
const jwt = require('jsonwebtoken');

app.use(express.json());

app.use(express.static(path.join(__dirname, 'client')));

function isLogIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use(session({
  secret: 'secreto',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },//ctp
}))

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  }
  ));

app.get('/auth/google/callback',
  passport.authenticate('google',
    {
      successRedirect: '/auth/protected',
      failureRedirect: '/auth/google/failure',
    }
  ));

app.get('/auth/failure', isLogIn, (req, res) => {
  res.send('Falla en el login');
});

app.get('/auth/protected', isLogIn, (req, res) => {
  const dataUser = {
    subUser: req.user.sub,
    mailUser: req.user.email,
    emailVerifiedUser: req.user.email_verified,
  }
  jwt.sign({ dataUser: dataUser }, 'secretkey', { expiresIn: '24h' }, (err, token) => {
    if (err) {
      res.sendStatus(500);
    } else {
      //res.json({ token });
      res.send( token );
    }
  });

  //console.log(req);
  //console.log(res);
});

app.get('/auth/logout', isLogIn, (req, res) => {
  req.session.destroy();
  res.send("Hasta luego.");
});


app.listen(PUERTO, () => {
  console.log(`Escuchando en el puerto ${PUERTO}`);
});


//npm install express dotenv express-session passport passport-google-oauth2 jsonwebtoken
//http://localhost:3000
//https://jwt.io/