// Modules
var email   = require("emailjs");
var CONFIG  = require("config");
var cronJob = require('cron').CronJob;
var CartoDB = require('cartodb');
var server  = email.server.connect({
  user:      CONFIG.gmail.email,
  password:  CONFIG.gmail.password,
  host:      "smtp.gmail.com",
  ssl:       true
});

// App vars
var pairs       = 7;
var start_date  = new Date('2013-04-22');
var vizz_email  = require('./lib/email').email;

// Email message
var message = {
  text:        "This week {{ p1_alias }} and {{ p2_alias }} are going to clean the office :)", 
  from:        "Vizziotica <jmedina@vizzuality.com>", 
  to:          CONFIG.gmail.to,
  cc:          "",
  subject:     "This week {{ p1_alias }} and {{ p2_alias }} are going to clean the office :)",
  attachment:  [{
    data:         vizz_email,
    alternative:  true
  }]
};


// Runs every Monday at 09:30:00 AM.
// send the message and get a callback with an
// error or details of the message that was sent
var job = new cronJob({
  cronTime: CONFIG.cron.when,
  onTick: function() {
    // CartoDB client
    var client = new CartoDB({
      user:     CONFIG.cartodb.user,
      api_key:  CONFIG.cartodb.api_key
    });

    // Get turn
    var actual_week = new Date().getWeekFrom(start_date);
    var turn = actual_week % pairs;

    client.on('connect', function() {
      client.query("SELECT * FROM cleaning_pairs WHERE turns=" + turn, {}, function(err, data){
        // Send email
        if (!err && data.rows && data.rows[0])
          server.send(parseMessage(message, data.rows[0]), function(err, message) { console.log(err || message); });
      });
    });

    client.connect();
  },
  start: false,
  timeZone: "Europe/Madrid"
});

job.start();


// Server
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.send('Hello World');
});

app.listen(3000);

// Parsing message
function parseMessage(msg, data) {
  msg.text                = msg.text.replace('{{ p1_alias }}', data.p1_alias).replace('{{ p2_alias }}', data.p2_alias);
  msg.subject             = msg.subject.replace('{{ p1_alias }}', data.p1_alias).replace('{{ p2_alias }}', data.p2_alias);
  msg.attachment[0].data  = msg.attachment[0].data
    .replace(/{{ p1_twitter }}/g, data.p1_twitter)
    .replace(/{{ p2_twitter }}/g, data.p2_twitter)
    .replace(/{{ p1_alias }}/g, data.p1_alias)
    .replace(/{{ p2_alias }}/g, data.p2_alias)
    .replace(/{{ host }}/g, CONFIG.host);
  return msg;
}

// Date helper
Date.prototype.getWeekFrom = function(date) {
  var onejan = new Date(date);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
}
