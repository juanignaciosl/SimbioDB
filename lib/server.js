
  /**
   *  SimbioDB app server
   *
   */

  var CONFIG  = require("config-heroku");
  // Create CartoDB client
  var CartoDB = require('cartodb');
  var client = new CartoDB({
    user:     CONFIG.cartodb.user,
    api_key:  CONFIG.cartodb.api_key
  });
  client.connect();


  module.exports = {

    // Init server
    init: function() {
      var express = require('express');
      var app = express();

      app.configure(function(){
        app.set('views', __dirname + '/../views');
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

      return app;
    },

    home: function(req, res) {
      // Get turn
      var actual_week = new Date().getWeekFrom(new Date(CONFIG.app.start_date));
      var turn = ( actual_week % global.groups );

      client.query("SELECT team FROM groups WHERE cartodb_id=" + turn, {}, function(err, r){
        if (!err && r.rows && r.rows.length > 0) {

          // Get team ids
          var ids = (r.rows[0].team).split(',');
          var where = ' WHERE ';
          for (var i = 0,l = ids.length; i < l; i++) {
            where += ' cartodb_id=' + ids[i] + ' ';
            if (i + 1 < l) where += ' OR '
          }

          client.query("SELECT * FROM crew " + where , {}, function(err, data){
            if (err) data = { rows: [{}] };
            res.render('home', data);
          });

        } else {
          res.render('error');
        }

      });
    },

    maintenance: function(req, res) {
      res.render('maintenance');
    },

    error: function(req, res) {
      res.render('error');
    },

    not_found: function(req, res, next) {
      res.render('error', { status: 404, url: req.url });
    },

    internal_error: function(err, req, res, next){
      res.render('error', {
        status: err.status || 500,
        error: err
      });
    }

  }
