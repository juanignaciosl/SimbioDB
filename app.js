// Modules
var email   = require("emailjs");
var CONFIG  = require("config-heroku");
var cronJob = require('cron').CronJob;
var CartoDB = require('cartodb');
var _u      = require('underscore');
var server  = email.server.connect({
  user:      CONFIG.gmail.email,
  password:  CONFIG.gmail.password,
  host:      "smtp.gmail.com",
  ssl:       true
});
var https = require("https");


// App vars
var pairs       = 8;
var start_date  = new Date('2013-10-24');

// Underscore
_u.templateSettings = {
  interpolate : /\{\{(.+?)\}\}/g
};

// CartoDB client
var client = new CartoDB({
  user:     CONFIG.cartodb.user,
  api_key:  CONFIG.cartodb.api_key
});

client.connect();

// SLACK client
var options = {
  host: 'vizzuality.slack.com',
  port: 443,
  path: '/services/hooks/incoming-webhook\?token\=' + CONFIG.slack.token,
  method: 'POST',
  "Content-Type": "application/json",
};

var slack = https.request(options, function(res) {
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('body: ' + chunk);
  });
});

slack.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});



// Runs every week at 09:00:00 AM checking if there was
// any change in the number of pairs at vizziotica
var check_cron = new cronJob({
  cronTime: "0 9 * * 6",
  onTick: function() {
    client.query("SELECT count(*) FROM cleaning_pairs", {}, function(err, res){
      console.log(err, res);
      if (!err && res) {
        pairs = res.rows[0].count;
      }
    });
  },
  start: true,
  timeZone: "Europe/Madrid"
});


// Runs every day at 09:30:00 AM in production.
// send the message and get a callback with an
// error or details of the message that was sent
var job = new cronJob({
  cronTime: CONFIG.cron.when,
  onTick: function() {

    var today = new Date();

    // Any birthday?
    client.query("SELECT alias, birthday, twitter, description, name, st_x(the_geom) as lon, st_y(the_geom) as lat FROM cleaning_guys WHERE birthday IS NOT NULL AND active IS true", {}, function(err, guys){

      // Check if it is birthday
      for (var i = 0; i < guys.rows.length; i++) {
        var birth = new Date(guys.rows[i].birthday);
        var utc = birth.getTime() + (birth.getTimezoneOffset() * 60000);
        var d = new Date(utc + (3600000*1));

        if (d.getMonth() == today.getMonth() && d.getDate() == today.getDate()) {
          // Compose the data
          var d_ = guys.rows[i];
          d_.birthday = d;
          d_.host = CONFIG.host;

          var message = {
            text:        _u.template("Happy birthday {{ alias }}!")(d_),
            from:        "Vizziotica <chorradas@vizzuality.com>",
            to:          CONFIG.gmail.to,
            cc:          "",
            subject:     _u.template("Happy birthday {{ alias }}!")(d_),
            attachment:  [{
              data:         _u.template(require('./lib/birthday_email').email)(d_),
              alternative:  true
            }]
          };

          // Send birthday to Vizzuality slack app
          slack.end(
            JSON.stringify({
              "channel":    "#general",
              "username":   "Mr. Cake",
              "text":       _u.template("Happy birthday {{ alias }}!")(d_),
              "icon_emoji": ":birthday:"
            })
          );

          server.send(message, function(err, msg) {
            if (err) console.log(err);
          });
        }
      }
    });

    // If it is Monday, pair cleaning email!
    if (today.getDay() == 1) {
      // Get turn
      var actual_week = today.getWeekFrom(start_date);
      var turn = actual_week % pairs;

      client.query("SELECT p1_guy,p2_guy FROM cleaning_pairs WHERE turns=" + turn, {}, function(err, guys){
        // Send email
        if (!err && guys.rows && guys.rows[0]) {

          client.query("SELECT * FROM cleaning_guys WHERE cartodb_id=" + guys.rows[0].p1_guy + " OR cartodb_id=" + guys.rows[0].p2_guy , {}, function(err, data){
            // Send email
            if (!err && data.rows && data.rows[0]) {
              data.host = CONFIG.host;
              // Email message
              var message = {
                text:        _u.template("This week {{ rows[0].alias }} and {{ rows[1].alias }} are going to clean the office :)")(data),
                from:        "Vizziotica <chorradas@vizzuality.com>",
                to:          CONFIG.gmail.to,
                cc:          "",
                subject:     _u.template("This week {{ rows[0].alias }} and {{ rows[1].alias }} are going to clean the office :)")(data),
                attachment:  [{
                  data:         _u.template(require('./lib/cleaning_email').email)(data),
                  alternative:  true
                }]
              };

              // Send birthday to Vizzuality slack app
              slack.end(
                JSON.stringify({
                  "channel":    "#general",
                  "username":   "cleaningbot",
                  "text":       _u.template("This week the cleaning personel is {{ rows[0].alias }} & {{ rows[1].alias }}")(data),
                  "icon_emoji": ":shit:"
                })
              );

              server.send(message, function(err, msg) {
                if (err) console.log(err);
              });
            }

          });
        }
      });
    }

  },
  start: false,
  timeZone: "Europe/Madrid"
});

job.start();


// Server
var express = require('express');
var app = express();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.compress());
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(app.router);
  app.use(express.static('./public', { maxAge: 86400000 })); // One day
});

app.get('/', function(req, res){
  // Get turn
  var actual_week = new Date().getWeekFrom(start_date);
  var turn = actual_week % pairs;

  client.query("SELECT p1_guy,p2_guy FROM cleaning_pairs WHERE turns=" + turn, {}, function(err, guys){
    if (!err && guys.rows && guys.rows.length > 0) {
      client.query("SELECT * FROM cleaning_guys WHERE cartodb_id=" + guys.rows[0].p1_guy + " OR cartodb_id=" + guys.rows[0].p2_guy , {}, function(err, data){
        if (err) data = { rows: [{}]};
        res.render('home', data);
      });
    } else {
      res.render('error');
    }
  });
});

app.post('/bot/cleaning', function(req, res){
  // Get turn
  var actual_week = new Date().getWeekFrom(start_date);
  var turn = actual_week % pairs;

  client.query("SELECT p1_guy,p2_guy FROM cleaning_pairs WHERE turns=" + turn, {}, function(err, guys){
    if (!err && guys.rows && guys.rows.length > 0) {
      client.query("SELECT * FROM cleaning_guys WHERE cartodb_id=" + guys.rows[0].p1_guy + " OR cartodb_id=" + guys.rows[0].p2_guy , {}, function(err, data){
        res.json({ "text": _u.template("This week the cleaning personel is {{ rows[0].alias }} & {{ rows[1].alias }}")(data) });
      });
    } else {
      res.json({ "text": "Shit happens..." });
    }
  });
});

app.post('/bot/birthdays', function(req, res) {

  // Any birthday?
  client.query("SELECT alias, birthday, twitter, description, name, st_x(the_geom) as lon, st_y(the_geom) as lat FROM cleaning_guys WHERE birthday IS NOT NULL AND active IS true", {}, function(err, guys){

    var arr = [];
    var today = new Date();

    // Check if it is birthday
    for (var i = 0; i < guys.rows.length; i++) {
      var birth = new Date(guys.rows[i].birthday);
      var utc = birth.getTime() + (birth.getTimezoneOffset() * 60000);
      var d = new Date(utc + (3600000*1));

      if (d.getMonth() == today.getMonth() && d.getDate() == today.getDate()) {
        arr.push(guys.rows[i]);
      }
    }

    var msg = "Happy birthday ";
    for (var i=0,l=arr.length; i<l; i++) {
      if (i > 0) {
        msg += "& ";
      }
      msg += arr[i].alias + " ";
    }

    if (arr.length > 0) {
      res.json({ "text": _u.template("{{ msg }}")({ msg: msg })  });
    } else {
      res.json({ "text": "No births, no cakes, no fun..." });
    }

  });

});

app.post('/bot/birthdays/next', function(req, res) {

  // Any birthday?
  client.query("SELECT alias, birthday, twitter, description, name, st_x(the_geom) as lon, st_y(the_geom) as lat FROM cleaning_guys WHERE birthday IS NOT NULL AND active IS true", {}, function(err, guys){

    var arr = [];
    var today = new Date();

    // Check if it is birthday
    for (var i = 0; i < guys.rows.length; i++) {
      var birth = new Date(guys.rows[i].birthday);
      var utc = birth.getTime() + (birth.getTimezoneOffset() * 60000);
      var d = new Date(utc + (3600000*1));

      if (
        (d.getDate() > today.getDate() && d.getMonth() >= today.getMonth()) ||
        (d.getMonth() > today.getMonth())
      ) {
        arr.push(guys.rows[i]);
      }
    }

    arr.sort(function(a,b){
      var d = new Date(b.birthday);
      d.setFullYear(today.getFullYear());
      var c = new Date(a.birthday);
      c.setFullYear(today.getFullYear());
      return c - d;
    });

    var next = arr[0];
    next.birthday = new Date(next.birthday);
    res.json({ "text": _u.template("{{ alias }} will turn {{ (birthday.getAge() + 1) }} on {{ birthday.getMonth() + 1 }}/{{ birthday.getDate() }}")(next)  });
  });

});

app.get('/birthdays', function(req, res) {

  var birthdays = "";

  client.query("SELECT alias, birthday, twitter, description, name, st_x(the_geom) as lon, st_y(the_geom) as lat FROM cleaning_guys WHERE birthday IS NOT NULL AND active IS true", {}, function(err, guys){
    // Check if it is birthday
    for (var i = 0; i < guys.rows.length; i++) {
      var birth = new Date(guys.rows[i].birthday);
      utc = birth.getTime() + (birth.getTimezoneOffset() * 60000);
      d = new Date(utc + (3600000*1));

      birthdays += guys.rows[i].alias + " -> " + d.getDate() + "/" + (d.getMonth()+1) + "/" + d.getFullYear() + "\n"
    }

    res.write(birthdays);
    res.end();
  });
});

// Error pages //

app.get('/maintenance', function(req, res){
  res.render('maintenance');
});

app.get('/error', function(req, res){
  res.render('error');
});

app.use(function(req, res, next){
  res.render('error', { status: 404, url: req.url });
});

app.use(function(err, req, res, next){
  res.render('error', {
      status: err.status || 500
    , error: err
  });
});

if (!module.parent) {
  var port = process.env.PORT || 5000;
  app.listen(port);
  console.log('Vizziotica app started on port ' + port);
}

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
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay())/7);
}

Date.prototype.getAge = function(date) {
  var _today = new Date();
  var age = _today.getFullYear() - this.getFullYear();
  var m = _today.getMonth() - this.getMonth();
  if (m < 0 || (m === 0 && _today.getDate() < this.getDate())) {
    age--;
  }
  return age;
}
