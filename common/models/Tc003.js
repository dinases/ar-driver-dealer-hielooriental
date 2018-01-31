module.exports = function(categories, cb) {

  categories.findAndMatchPrice = function(cb) {
    categories.find({
      where: {
        chcatcl: 1
      },
      include:
        {
          relation: 'product'
        }
    }, function(error, modelInstance) {
      if (error)
        cb(null, {error: "No se pudo obtener los productos", system: error})

      var products = [];
      var promises = [];

      for (var i = 0; i < modelInstance.length; i++) {
        promises.push(modelInstance[i].product.getAsync());
      }

      Promise.all(promises)
      .then(values => {

        for (var i = 0; i < values.length; i++) {
          for (var j = 0; j < modelInstance.length; j++) {
            if (values[i]) {

              if (values[i].canumi == modelInstance[j].chcprod) {
                values[i].precio = modelInstance[j].chprecio;
              }
            } else {
              values.splice(i, 1);
            }
          }
        }

        cb(null, values);
      })
      .catch(error => {
        cb(null, {error: "No se pudo obtener los productos", system: error})
      });

    });
  }

  categories.remoteMethod(
    'findAndMatchPrice',
    {
      returns: {arg: 'result', type: 'string'},
      http: {path:'/findAndMatchPrice', verb: 'post'},
      description: ['It sends the products'],
    }
  );
}
