
  
  /**
   *  SimbioDB cron jobs
   *
   */

  var email   = require("emailjs");
  var CONFIG  = require("config-heroku");
  var cronJob = require('cron').CronJob;

  var _u      = require('underscore');
  var server  = email.server.connect({
    user:      CONFIG.gmail.email,
    password:  CONFIG.gmail.password,
    host:      "smtp.gmail.com",
    ssl:       true
  });
  var https = require("https");

  // Underscore 
  _u.templateSettings = {
    evaluate    : /\{\{([\s\S]+?)\}\}/g,
    interpolate : /\{\{=([\s\S]+?)\}\}/g,
    escape      : /\{\{-([\s\S]+?)\}\}/g
  };

  // Create CartoDB client
  var CartoDB = require('cartodb');
  var client = new CartoDB({
    user:     CONFIG.cartodb.user,
    api_key:  CONFIG.cartodb.api_key
  });
  client.connect();

  

  module.exports = {

    // Check groups everyday
    initGroupsCron: function() {

      // Runs every week at 09:00:00 AM checking if there was
      // any change in the number of pairs at SimbioDB
      var cron = new cronJob({
        cronTime: "0 9 * * 6",
        onTick: function() {
          client.query("SELECT count(*) FROM groups", {}, function(err, res){
            if (!err && res) {
              global.groups = res.rows[0].count;
            } else {
              console.log("[GROUPS CRON] ", err);
            }
          });
        },
        start: true,
        timeZone: "Europe/Madrid"
      });
    },


    // Check birthdays and cleaning groups
    initWeekCron: function() {

      // Runs every day at 09:30:00 AM in production.
      // send the message and get a callback with an
      // error or details of the message that was sent
      var job = new cronJob({
        cronTime: CONFIG.cron.when,
        onTick: function() {

          var today = new Date();

          // Any birthday?
          client.query("SELECT *, st_x(the_geom) as lon, st_y(the_geom) as lat FROM crew WHERE birthday IS NOT NULL", {}, function(err, guys){

            if (err) {
              console.log("[BIRTHDAY MAIL] ", err);
              return false;
            }

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
                  text:        _u.template("Happy birthday {{= alias }}!")(d_),
                  from:        "SimbioDB <chorradas@vizzuality.com>", 
                  to:          CONFIG.gmail.to,
                  cc:          "",
                  subject:     _u.template("Happy birthday {{= alias }}!")(d_),
                  attachment:  [{
                    data:         _u.template(require('../views/mails/birthday_email').email)(d_),
                    alternative:  true
                  }]
                };

                server.send(message, function(err, msg) {
                  if (err) console.log(err);
                });
              }
            }
          });

          // If it is Monday, pair cleaning email!
          // if (today.getDay() == 1) {
            // Get turn
            var actual_week = today.getWeekFrom(CONFIG.app.start_date);
            var turn = actual_week % global.groups;

            client.query("SELECT team FROM groups WHERE cartodb_id=" + turn, {}, function(err, r){

              if (err || r.rows.length === 0) {
                console.log("[CLEAN EMAIL]", err);
                return false;
              }

              // Get team ids
              var ids = (r.rows[0].team).split(',');
              var where = ' WHERE ';
              for (var i = 0,l = ids.length; i < l; i++) {
                where += ' cartodb_id=' + ids[i] + ' ';
                if (i + 1 < l) where += ' OR '
              }

              // Send email
              client.query("SELECT * FROM crew " + where , {}, function(err, data){
                // Send email
                if (!err && data.rows && data.rows[0]) {
                  data.host = CONFIG.host;
                  
                  // Get names
                  var names = '';
                  for (var i = 0,l = data.rows.length; i < l; i++) {
                    if (i === 0) {
                      names += ''
                    } else if (i + 1 < l) {
                      names += ', '
                    } else {
                      names += ' and '
                    }

                    names += data.rows[i].alias
                  }

                  // Email message
                  var message = {
                    text:        _u.template("This week " + names + " are going to clean the office :)")(data),
                    from:        "Vizziotica <chorradas@vizzuality.com>", 
                    to:          CONFIG.gmail.to,
                    cc:          "",
                    subject:     _u.template("This week " + names + " are going to clean the office :)")(data),
                    attachment:  [{
                      data:         _u.template(require('../views/mails/cleaning_email').email)(data),
                      alternative:  true
                    }]
                  };

                  server.send(message, function(err, msg) {
                    if (err) console.log(err);
                  });
                }
                  
              });
            });
          // }

        },
        start: true,
        timeZone: "Europe/Madrid"
      });
    }

  }