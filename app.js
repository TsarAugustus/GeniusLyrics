const express = require('express');
const path = require('path');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');

const port = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.pug');
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('index');
});


app.post('/search', (req, res) => {
  console.log('POST')
  console.log(req.body)
  axios.get(req.body.songUrl)
    .then(function (response) {
      console.log('Then')
      const data = response.data;
      const $ = cheerio.load(data);
      const doc = $('.lyrics').text()
      return res.send(doc)
    })
    .catch(function (error) {
      console.log(error);
    })
    .finally(function() {
      return;
    })
});

app.listen(port, () => console.log('Running on port ', port));
