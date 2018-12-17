require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const book = require('./scripts/book');

app.get('/', (req, res) => {
  res.send('Autoroom Booker v1');
});

app.post('/autobook', async (req, res) => {
  const { username, password } = req.body;
  const { msg, err } = await book(username, password);
  if (err) {
    res.status(400).send(err.message);
    return;
  }

  res.send(msg);
});

// eslint-disable-next-line no-console
app.listen(3000, () => console.log('Sauder Room Booker Running'));
