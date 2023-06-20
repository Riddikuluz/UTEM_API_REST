const express = require('express');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const app = express();
const jwt = require('jsonwebtoken');
const PUERTO = process.env.puerto || 3000
require('dotenv').config();
require('./auth');

function isLogIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

//app.use(passport.initialize());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

app.use(session({
  secret: process.env.clave,
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false},//ctp
}))

app.use(passport.session());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');});

app.get('/auth/google', passport.authenticate('google',
 {scope: [ 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google',
    {
      successRedirect: '/auth/jwt',
      failureRedirect: '/auth/google/failure',
    }
  ));

app.get('/auth/jwt', isLogIn, (req, res) => {
  const dataUser =req.user;
  //console.log(dataUser.azp);
  jwt.sign({dataUser},process.env.clave,{expiresIn: '24h'},function(err, token){
    if (err) {
      res.sendStatus(500);
    } else {
      res.redirect(`/token?token=${token}`);
    }});
});

app.get('/token', isLogIn, function(req, res) {
  const token = req.query.token;
  res.send(`Token JWT: ${token}`);
});

app.get('/auth/logout', isLogIn, (req, res) => {
  req.session.destroy();
  res.send("Hasta luego.");
});

app.get('/auth/failure', isLogIn, (req, res) => {
  res.sendStatus(500);
  res.send('Crenciales no validas.');
});

app.listen(PUERTO, () => {
  console.log(`Escuchando en el puerto ${PUERTO}`);
});


//npm install express dotenv express-session passport passport-google-oauth2 jsonwebtoken axios
//http://localhost:3000
//https://jwt.io/