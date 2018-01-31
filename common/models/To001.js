module.exports = function(header){
  var path = require('path');
  var app = require(path.resolve(__dirname, '../../server/server'));
  var ds = app.dataSources.sqldb;

  header.updateStateTwoToThree = function(id, amount, idrepa, cb) {

    header.updateAll(
    {
        oanumi: id
    },
    {
      oaest: 3,
      oarepa: parseInt(idrepa)
    },
    function(err, modelInstance) {
      if (err)
        cb(null, false);
      else
        saveAmount(id, amount, cb);
    });
  };

  function saveAmount(id, amount, cb) {
    var credit = header.app.models.To001a1;

    credit.create({ognumi: id, ogcred: amount}, function(error, data) {
        if (error)
          cb(null, false)
        else
          cb(null, true);
    })
  }

  header.updateStateOneToTwo = function(id, cb) {

    header.updateAll(
    {
        oanumi: id
    },
    {
      oaest: 2
    },
    function(err, modelInstance) {
      if (err)
        cb(null, err);
      else
        cb(null, true);
    });
  }

  header.saveOrder = function(clientId, date, observation, products, cb) {

    var procedure = "EXEC dbo.sp_Insert_TO001 "
                    + "'" + date + "'" + ","
                    + clientId + ","
                    + "'" + observation + "'" + ","
                    + "'" + products + "'";

    ds.connector.execute(procedure, function(error, data) {
      if (error) {
        cb(null, {error: "No se pudo insertar la cabezera del pedido", system: error});
      } else {
        if (data[0].error == 0) {
          cb(null, {error: "No se pudo insertar la cabezera del pedido", system: error});
        } else {
          getClientAndDetail(data,cb);
        }
      }
    });
  }

  function getClientAndDetail(data, cb) {
      var detail = header.app.models.To0011;
      var client = header.app.models.Tc004;

      detail.find({ where: {obnumi: data[0].oanumi}}, function(error, detailResponse) {
        if (error) {
          data[0].client = 0;
          data[0].details = 0;
          cb(null, data);
        } else {

          client.find({where: {ccnumi: data[0].oaccli}}, function(error, clientResponse) {
            if (error) {
              data[0].client = 0;
              data[0].details = 0;
              cb(null, data)
            } else {
              data[0].details = detailResponse;
              cb(null, data);
            }
          });
        }
      });
  }

  header.remoteMethod(
    'getRequestHeaderByEmployeId',
    {
      accepts: [{arg: 'id', type: 'string'}],
      returns: {arg: 'result', type: 'string'},
      http: {path:'/getRequestHeaderByEmployeId', verb: 'post'},
      description: ['It get the request header by employee id'],
    }
  );

  header.remoteMethod(
    'updateStateTwoToThree',
    {
      accepts: [{arg: 'id', type: 'string'},
                {arg: 'amount', type: 'string'},
                {arg: 'idrepa', type: 'string'}],
      returns: {arg: 'result', type: 'string'},
      http: {path:'/updateStateTwoToThree', verb: 'post'},
      description: ['It update the state from two to three'],
    }
  );

  header.remoteMethod(
    'updateStateOneToTwo',
    {
      accepts: [{arg: 'id', type: 'string'}],
      returns: {arg: 'result', type: 'string'},
      http: {path:'/updateStateOneToTwo', verb: 'post'},
      description: ['It update the state from one to two'],
    }
  );

  header.remoteMethod(
    'saveOrder',
    {
      accepts: [{arg: 'clientId', type: 'string'},
                {arg: 'date', type: 'string'},
                {arg: 'observation', type: 'string'},
                {arg: 'products', type: 'array'}],
      returns: {arg: 'result', type: 'string'},
      http: {path:'/saveOrder', verb: 'post'},
      description: ['It saves a new order'],
    }
  );
};
