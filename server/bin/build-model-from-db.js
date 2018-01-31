'use strict';

var path = require('path');
var fs = require('fs');
var app = require(path.resolve(__dirname, './server'));
var outputPath = path.resolve(__dirname, './common/models');

var dataSource = app.dataSources.sqldb;

function schemaCB(err, schema) {
  console.log(schema);
  if (schema) {
    console.log('Auto discovery success: ' + schema.name);
    var outputName = outputPath + '/' + schema.name + '.json';
    fs.writeFile(outputName, JSON.stringify(schema, null, 2), function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log('JSON saved to ' + outputName);
      }
    });
  }
  if (err) {
    console.error(err);
    return;
  }
  return;
}

function createModels() {
  var array = ['TC001', 'TC004', 'TO001', 'TO0011', 'TFV001', 'TFV001'];
  for (var i = 0; i < array.length; i++) {
    dataSource.discoverSchema(array[i], {schema: 'dbo'}, schemaCB);
  }
}
