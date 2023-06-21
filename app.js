const express = require('express');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
require('./auth');
const puerto = process.env.puertoServer || process.env.puerto

function isLogIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.use(passport.initialize());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.clave,
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false},//ctp
}))

app.use(passport.session());
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');});

  app.get('/auth/google',
    passport.authenticate('google', {
      session: false,
      scope: ["profile", "email"],
      accessType: "offline",
      approvalPrompt: "force"
    })
  );

app.get('/auth/google/callback',
  passport.authenticate('google',
    {
      successRedirect: '/auth/jwt',
      failureRedirect: '/auth/failure'
    }
  ));

app.get('/auth/jwt', isLogIn, (req, res) => {
  const dataUser =req.user;
  //console.log(dataUser.azp);
  jwt.sign( {dataUser}, process.env.clave, {expiresIn: '24h'}, function(err, token){
    if (err) {
      res.sendStatus(500);
    } else {
      res.redirect(`/auth/jwt/token?token=${token}`);
    }});
});

app.get('/auth/jwt/token', isLogIn, function(req, res) {
  const token = req.query.token;
  jwt.verify( token, process.env.clave, function(err, token){
    if (err) {
      res.sendStatus(500);
    } else {
      res.send(`Token JWT: ${req.query.token}`);
      //res.send(`DATA JWT: ${JSON.stringify(token)}`);
    }});
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.send("Hasta luego.");
});

app.get('/auth/failure', (req, res) => {
  res.sendStatus(500);
  res.send('Crenciales no validas.');
});

app.listen(puerto, () => {
  console.log(`Escuchando en el puerto ${puerto}`);
});


//npm install express dotenv express-session passport passport-google-oauth2 jsonwebtoken axios google-auth-library
//http://localhost:3000
//https://jwt.io/