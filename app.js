const express = require('express');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
require('./auth');

const PUERTO = process.env.puerto || 3000

app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

function isLogIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use(session({
  secret: process.env.clave,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },//ctp
}))

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google',
  passport.authenticate('google', {
    session: false,
    scope: ["profile", "email", "openid"],
  }
  ));

app.get('/auth/google/callback',
  passport.authenticate('google',
    {
      successRedirect: '/auth/jwt',
      failureRedirect: '/auth/google/failure',
    }
  ));

app.get('/auth/failure', isLogIn, (req, res) => {
  res.sendStatus(500);
  res.send('Crenciales no validas.');
});

app.get('/auth/jwt', isLogIn, (req, res) => {
  const dataRUser =req.user;
  console.log(req);
  jwt.sign({dataRUser},process.env.clave,{expiresIn: '24h'},  function(err, token){
    if (err) {
      res.sendStatus(500);
    } else {
      res.send( res.json({token})); 
    }});
});

app.get('/auth/logout', isLogIn, (req, res) => {
  req.session.destroy();
  res.send("Hasta luego.");
});

app.listen(PUERTO, () => {
  console.log(`Escuchando en el puerto ${PUERTO}`);
});


//npm install express dotenv express-session passport passport-google-oauth2 jsonwebtoken axios
//http://localhost:3000
//https://jwt.io/