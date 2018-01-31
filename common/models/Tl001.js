module.exports = function(TL001){

  TL001.getZonesByZoneIds = function(ids, cb) {

    TL001.find({where: { lanumi: { inq: ids}}}, function(err, modelInstance) {
      var array = [];

      for (var i = 0; i < modelInstance.length; i++) {
        array.push(modelInstance[i].lazona);
      }

      cb(null, array);
    });
  };

  TL001.remoteMethod(
    'getZonesByZoneIds',
    {
      accepts: [{arg: 'ids', type: 'array'}],
      returns: {arg: 'result', type: 'string'},
      http: {path:'/getZonesByZoneIds', verb: 'post'},
      description: ['It get the zones about zones table by its ids'],
    }
  );
};
