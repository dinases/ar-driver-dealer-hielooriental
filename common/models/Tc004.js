module.exports = function(TC004){
  var path = require('path');
  var app = require(path.resolve(__dirname, '../../server/server'));
  var ds = app.dataSources.sqldb;
  var request = require('request');

  TC004.getClientsByZones = function(zones, cb) {

    TC004.find({where: {

      and: [{ccest: 1}, {cczona: { inq: zones}}]
    }},

    function(err, modelInstance) {
      cb(null, modelInstance);
    });
  };

  TC004.executeProcedure = function(cb) {
      var procedure = "EXEC dbo.vis_transacciones"
      ds.connector.execute(procedure, function(error, data) {
        if (error) {
          cb(null, error)
        } else {
          cb(null, data)
        }
      })
  };

  TC004.sendNotification = function(data, cb) {
    var fcmToken = JSON.parse(data).fcmToken;
    var mRequestHeader = JSON.stringify(JSON.parse(data).mRequestHeader);

    var mBody = {
                  data: {"object": mRequestHeader},
                  to : fcmToken
                };
    mBody = JSON.stringify(mBody);

    request({
      url: 'https://fcm.googleapis.com/fcm/send',
      method: 'POST',
      headers: {
        'Content-Type' :' application/json',
        'Authorization': 'key=AAAAkhrejcA:APA91bEDDU7hupl4B-uOYemNyY936oj0KV9gemVHNxJ1nPZWBsT6mDYeek2p1p2OfaPwNpvBK52AaMVP3K6U55OM4JroBN00_EWdPrKP17QOVny0z0IbPpxd0XEovN3n3IafAtlqitOjnQbimx14QhRzVE0um2UBoA'
      },
      body: mBody
    },
    function(error, response, body) {
      if (error)
        cb(null, false)
      else if (response.statusCode >= 400)
        cb(null, false)
      else {
        if (JSON.parse(response.body).success == 1)
          cb(null, true)
        else
          cb(null, false)
      }
    });
  };

  TC004.saveClient = function(param, cb) {

    param = JSON.parse(param);
    var procedure = "EXEC dbo.sp_Insert_TC004 "
                    + "'" + param.name + "'" + ","
                    + param.zone + ","
                    + "'" + param.clientNit + "'" + ","
                    + "'" + param.nit + "'" + ","
                    + "'" + param.phone + "'" + ","
                    + "'" + param.address + "'" + ","
                    + "'" + param.reason + "'" + ","
                    + param.lat + ","
                    + param.lng;

    ds.connector.execute(procedure, function(error, data) {
      if (error) {
        cb(null, {error: "No se pudo guardar el cliente", system: error});
      } else {
        if (data[0].error == 0)
            cb(null, {error: "No se pudo guardar el cliente"});
        else
            cb(null, true);
      }
    });
  }

  TC004.remoteMethod(
    'getClientsByZones',
    {
      accepts: [{arg: 'zones', type: 'array'}],
      returns: {arg: 'result', type: 'string'},
      http: {path:'/getClientsByZones', verb: 'post'},
      description: ['It get the clients by their zone'],
    }
  );

  TC004.remoteMethod(
    'executeProcedure',
    {
      returns: {arg: 'result', type: 'string'},
      http: {path:'/executeProcedure', verb: 'post'},
      description: ['It execute a procedure'],
    }
  );

  TC004.remoteMethod(
    'sendNotification',
    {
      accepts: [{arg: 'data', type: 'string'}],
      returns: {arg: 'result', type: 'string'},
      http: {path:'/sendNotification', verb: 'get'},
      description: ['It sends a notification'],
    }
  );

  TC004.remoteMethod(
    'saveClient',
    {
      accepts: [{arg: 'param', type: 'string'}],
      returns: {arg: 'result', type: 'string'},
      http: {path:'/saveClient', verb: 'post'},
      description: ['It saves a new client'],
    }
  );
};
