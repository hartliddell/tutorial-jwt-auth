const bodyParser = require('body-parser');
const express = require('express');
const jwt = require('jsonwebtoken');
const expressjwt = require('express-jwt');

const app = express();
const PORT = process.env.PORT || 8888;
const secretKey = 'mysupersecretkey';

app.use(bodyParser.json());

const jwtCheck = expressjwt({
  algorithms: ['HS256'],
  secret: secretKey,
});

const users = [
  {id: 1, username: 'admin', password: 'admin'},
  {id: 1, username: 'guest', password: 'guest'},
];

app.get('/status', getStatus);
app.get('/resource', getResource);
app.get('/resource/secret', jwtCheck, getResourceSecret);
app.post('/login', postLogin);

app.get('*', (req, res) => {
  res.sendStatus(404);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function getResource(req, res) {
  res
    .status(200)
    .send('Public resource, you can see this.');
}

function getResourceSecret(req, res) {
  res
    .status(200)
    .send('Secret resource, you should be logged in to see this.');
}

function getStatus(req, res) {
  const localTime = (new Date()).toLocaleTimeString();
  res
    .status(200)
    .send(`Server time is ${localTime}.`);
}

function postLogin(req, res) {
  const {
    password,
    username,
  } = req.body;
  if (!username || !password) {
    res
      .status(400)
      .send('Login requires username and password.');
      return;
  }

  const user = users.find((user) => {
    return user.username === username
      && user.password === password;
  });

  if (!user) {
    res
      .status(401)
      .send('Not authorized.');
    return;
  }

  const token = jwt.sign({
    sub: user.id,
    username: user.username,
  }, secretKey, { expiresIn: '3 hours' });

  res
    .status(200)
    .send({access_token: token});
}

