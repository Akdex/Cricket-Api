const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const req = require("express/lib/request");
const axios = require("axios")
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const headers ={
  'x-rapidapi-host': process.env.API_HOST,
  'x-rapidapi-key': process.env.API_KEY
};
const CONSTANTS = {
  "upcomingMatches": "https://unofficial-cricbuzz.p.rapidapi.com/matches/list",
  "stadiumInfo": "https://unofficial-cricbuzz.p.rapidapi.com/venues/get-info",
  "news": "https://unofficial-cricbuzz.p.rapidapi.com/news/list"
}
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.get('/matches-upcoming', async (req, res) => {
  try{
    let match_list = await axios.get(`${CONSTANTS.upcomingMatches}?matchState=upcoming`, {headers: headers});
    match_list = match_list.data.typeMatches[0]
  
    let response = []

    match_list.seriesAdWrapper.forEach(element => {
      if(element.hasOwnProperty("seriesMatches")){
        element.seriesMatches.matches.forEach(el => {
          if (el.matchInfo.matchFormat === req.query.format.toUpperCase()){
            response.push(element)
          }
        })
      }
    });
    res.send(response)
  } 
  catch(err){
    console.log(err);
    res.status(400).send('something went wrong')
  }
});

app.get('/stadium-details/:venueId', async (req, res) => {
  try{
    let stadium_details = await axios.get(`${CONSTANTS.stadiumInfo}`, {headers: headers});
    res.send(stadium_details.data)
  }
  catch(error){
    console.log("PRINTING ERROR FOR STADIUM DETAILS =====>", error)
  }
});

app.get("/latest-news", async (req, res) => {
  try{
    let latest_news = await axios.get(`${CONSTANTS.news}?venueId=${req.params.venueId}`, {headers: headers});
    news = latest_news.data.newsList.filter(el => {
      if (el.hasOwnProperty("story")){
        let date = new Date(parseInt(el.story.pubTime));
        date = date.toLocaleString().split(',')
        el.story["time"] = date[1]
        el.story["date"] = date[0]
        return el
      }
    })
    res.send(news)
  }
  catch(error){
    console.log("PRINTING ERROR FOR STADIUM DETAILS =====>", error)
    res.status(400).send("Something went wrong");
  }
})

app.listen(port, function() {
  console.log(`Server started on port ${port}...`);
});