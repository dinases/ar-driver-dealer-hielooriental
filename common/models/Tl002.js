module.exports = function(tracking){
  var path = require('path');
  var app = require(path.resolve(__dirname, '../../server/server'));
  var ds = app.dataSources.sqldb;

  tracking.saveLocation = function(employeeId, lat, lng, cb) {
    var date = new Date();

    var procedure = "EXEC dbo.sp_Insert_TL002 "
                    + employeeId + ","
                    + "'" + date.toISOString() + "'" + ","
                    + "'" + date.getHours() + ":" + date.getMinutes() + "'" + ","
                    + lat + ","
                    + lng;

    ds.connector.execute(procedure, function(error, data) {
      if (error) {
        cb(null, {error: "No se pudo guardar la ubicación", system: error})
      } else {
        if (data[0].error == 0) {
          cb(null, {error: "No se pudo guardar la ubicación"})
        } else {
          cb(null, data)
        }
      }
    });
  }

  tracking.remoteMethod(
    'saveLocation',
    {
      accepts: [{arg: 'employeeId', type: 'String'},
                {arg: 'lat', type: 'String'},
                {arg: 'lng', type: 'String'}],
      returns: {arg: 'result', type: 'string'},
      http: {path:'/saveLocation', verb: 'post'},
      description: ['It saves the location from an employee'],
    }
  );
}
