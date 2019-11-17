/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var ObjectId = require('mongodb').ObjectId;
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

function makeRequest(url){
  return new Promise(function(resolve, reject){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
      if (this.status >= 200 && this.status < 300)
        resolve(JSON.parse(xhr.responseText));
      else reject({
        status: this.status,
        statusText: xhr.statusText
      });
    }
    xhr.onerror = function(){
      reject({
        status: this.status,
        statusText: this.statusText
      })
    };
    xhr.send();
  });
}

module.exports = function (app, db) {
  
  app.route('/api/stock-prices')
  .get(function (req, res){
    var ip = req.headers["x-forwarded-for"].match(/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/)[0];
    var stocks = req.query.stock;
    if (!Array.isArray(stocks)) stocks = [stocks];
    if(stocks.length > 2) stocks.splice(2);
    Promise.all(stocks.map(e=>{
      var url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${e}&apikey=${process.env.API_KEY}`;
      var dataReq = new XMLHttpRequest();
      dataReq.open('GET', url, true);
      return makeRequest(url)
      .then(data => {
        //console.log(rawData);
        var metaData = data['Meta Data'];
        var timeData = data["Time Series (Daily)"];
        var dates = Object.keys(data).sort((a,b)=>a-b);
        return {
          symbol: metaData.symbol,
          
        }
      })
      .catch(err => console.log('Promise Error: ', err))
    }))
    .then(data => {
      console.log(data);
    })
  });
};
