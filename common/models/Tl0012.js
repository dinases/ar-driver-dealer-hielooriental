module.exports = function(TL0012){

  TL0012.getZonesByEmployeeId = function(id, cb) {

    TL0012.find({where: { lccbnumi: id}}, function(err, modelInstance) {
      var array = [];

      for (var i = 0; i < modelInstance.length; i++) {
        array.push(modelInstance[i].lcnumi);
      }

      cb(null, array);
    });
  };

  TL0012.remoteMethod(
    'getZonesByEmployeeId',
    {
      accepts: [{arg: 'id', type: 'string'}],
      returns: {arg: 'result', type: 'string'},
      description: ['It get the ids about zones by employee id'],
      http: {path:'/getZonesByEmployeeId', verb: 'post'}
    }
  );
};
