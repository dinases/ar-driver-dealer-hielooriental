module.exports = function(TO0011){

  TO0011.getDetailRequestByIds = function(ids, cb) {

    TO0011.find({where: { obnumi: { inq: ids}}}, function(err, modelInstance) {
      cb(null, modelInstance);
    });
  };

  TO0011.remoteMethod(
    'getDetailRequestByIds',
    {
      accepts: [{arg: 'ids', type: 'array'}],
      returns: {arg: 'result', type: 'string'},
      http: {path:'/getDetailRequestByIds', verb: 'post'},
      description: ['It get the request detail by its ids'],
    }
  );
};
