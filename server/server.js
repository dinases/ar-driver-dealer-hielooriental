'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

// var path = require('path');
// var fs = require('fs');
// var app = require(path.resolve(__dirname, './server'));
// var outputPath = path.resolve(__dirname, '../common/models');
//
// var dataSource = app.dataSources.sqldb;
//
// function schemaCB(err, schema) {
//   console.log(schema);
//   if(schema) {
//     console.log("Auto discovery success: " + schema.name);
//     var outputName = outputPath + '/' +schema.name + '.json';
//     fs.writeFile(outputName, JSON.stringify(schema, null, 2), function(err) {
//       if(err) {
//         console.log(err);
//       } else {
//         console.log("JSON saved to " + outputName);
//       }
//     });
//   }
//   if(err) {
//     console.error(err);
//     return;
//   }
//   return;
// };
//
// dataSource.discoverSchema('TC002',{schema:'dbo'},schemaCB);
