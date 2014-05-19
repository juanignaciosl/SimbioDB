  
  /**
   *  SimbioDB application
   *
   */

  // Load external resources
  var _u = require('underscore');
  var CONFIG  = require("config-heroku");

  // Expose groups as global :D
  global.groups = CONFIG.app.groups;

  // Extend Date JS object
  var _date = require('./lib/date');
  _u.extend(Date.prototype, _date);

  // Create server
  var server = require('./lib/server');
  var app = server.init();
  
  // Endpoints
  app.get('/',            server.home );
  app.get('/error',       server.error );
  app.get('/maintenance', server.maintenance );
  
  app.use(                server.not_found );
  app.use(                server.internal_error );
  

  // Jobs
  var jobs = require('./lib/jobs');
  jobs.initGroupsCron();
  jobs.initWeekCron();


  if (!module.parent) {
    var port = process.env.PORT || 5000;
    app.listen(port);
    console.log('SimbioDB app started on port ' + port);
  }