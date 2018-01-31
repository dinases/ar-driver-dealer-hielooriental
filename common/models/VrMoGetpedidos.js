module.exports = function(header, cb) {

  header.getRequestHeaderByEmployeId = function(id, cb) {

    updateState(id);

    header.find({where:
      {
        and:
        [
          {
            oarepa: id,
            oaap:1,
            cceven:false
          },
          {
            or: [
                  {
                    oaest:2
                  },
                  {
                    oaest:1
                  }
                ]
          }
        ]
      }
    }, function(err, modelInstance) {
      var array = [];

      for (var i = 0; i < modelInstance.length; i++) {
        array.push(modelInstance[i].oanumi);
      }

      cb(null, {modelInstance: modelInstance, ids: array});
    });
  };

  function updateState(id) {

    header.updateAll({
                      oarepa: id,
                      oaest: 1
                    }
                    , {oaest: 2}, function(err, info) {
                      console.log(err);
                      console.log(info);
                    });
  };

  header.remoteMethod(
    'getRequestHeaderByEmployeId',
    {
      accepts: [{arg: 'id', type: 'string'}],
      returns: {arg: 'result', type: 'string'},
      http: {path:'/getRequestHeaderByEmployeId', verb: 'post'},
      description: ['It get the request header by employee id'],
    }
  );
}
