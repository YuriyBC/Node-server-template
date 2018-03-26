const knex = require('./db/knex');
const crypto = require('crypto');
const express = require('express');
const path = require('path');

const GET_USER = function (req, res) {
  knex('users').select().where({
    id: req.headers.clientid,
    token: req.headers.token
  }).then((user) => {
    if (user.length) {
      res.status(200);
      res.send('Success');
    } else {
      res.status(401);
      res.send('User not found')
    }
  }).catch((error) => {
    res.status(401);
    res.send('User not found')
  })
}

const SIGN_IN_USER = function (req, res) {
  let token;
  let email = req.body.email
  knex('users').where(
    knex.raw('LOWER("email") = ?', email)
  ).then((user) => {
    // we check if password is valid and then update token
    if (user[0].password.toString() === req.body.password.toString()) {
      token = generateToken();
      knex('users').where('id', user[0].id).update({token: token}).then(() => {
        knex('users').select().where('id', user[0].id).then((user) => {
          let obj = {...user[0]}
          delete obj.password
          res.status(200);
          res.send(obj)
        })
      })
    } else {
      res.status(401);
      res.send('Wrong password');
    }
  }).catch((error) => {
    res.status(401);
    res.send('User does not exists');
  })
}

const SIGN_UP_USER = function (req, res) {
  let token;
  let email = req.body.email || '';
  let password = req.body.password || '';
  let firstName = req.body.firstName || '';
  let secondName = req.body.secondName || '';

  knex.select('*').from('users').then((users) => {
    // if user already exist
    let isUserExist = users.some((user) => {
      return user.email === email
    });
    if (!isUserExist) {
      token = generateToken();
      let newUser = {
        email: email,
        password: password,
        firstname: firstName,
        secondname: secondName,
        token: token
      }
      knex('users').insert(newUser).then(() => {
        res.status(200);
        res.send(newUser)
      })
    } else {
      res.status(401);
      res.send('User Already Exists');
    }
  });
}

function generateToken () {
  return crypto.randomBytes(64).toString('hex');
}

module.exports.GET_USER = GET_USER;
module.exports.SIGN_IN_USER = SIGN_IN_USER;
module.exports.SIGN_UP_USER = SIGN_UP_USER;