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

//When the user inputs a url, it searches Genius.com for the lyrics and scrapes them
app.post('/search', (req, res) => {
  //GET the url
  axios.get(req.body.songUrl)
    .then(function (response) {
      //When a song is found, use Cheerio to find the .lyrics div and get all
      // the contents inside of it.
      const data = response.data;
      const $ = cheerio.load(data);
      //this gets the lyrics, uses regex to find any words that have brackets in them
      // eg [Verse] or [Chorus] etc
      const doc = $('.lyrics').text().replace(/ *\[[^\]]*]/g, '');

      // words is an array, which gets .push() to when the loop finds a space key
      // currentWord is the word the loop is going through.
      let words = [];
      let currentWord = '';

      //Go through each letter in the lyrics. Append each letter to currentWord
      // If the loop finds a space key, it pushed currentWord to the words variable
      for(i=0; i<doc.length; i++) {
        if(doc[i] === " ") {
          words.push(currentWord);
          currentWord = ''
        } else {
          currentWord += doc[i];
        }
      }

      //This function gets each word in the words array
      //then it will go through each word and assign it a value in a map
      //This is to find the most frequent words in the song
      function getFreq(words) {
        let freqMap = {};
        for(let i=0; i<words.length; i++) {
          let word = words[i];
          if(freqMap[word]) {
            freqMap[word]++;
          } else {
            freqMap[word] = 1;
          }
        }

        //the freqMap must be reordered into an array, as a map can't be changed (or sorted apparently?)
        //The for loop iterates through each key in the freqMap map, and takes the name of the key (the word)
        // and it also takes the value (how often the word is said)
        let orderedfreq = [];
        for(let key in freqMap) {
          orderedfreq.push({
            word: key,
            value: freqMap[key]
          })
        }
        //return the new array
        return orderedfreq;
      }

      //order the array by word frequency
      let freq = getFreq(words).sort(function(a, b) {
        return b.value - a.value;
      });

      return res.send(freq);
    })
    .catch(function (error) {
      console.log(error);
    })
    .finally(function() {
      return;
    })
});

app.listen(port, () => console.log('Running on port ', port));
