module.exports = function(invoice) {
  var path = require('path');
  var fs = require('fs');
  var controlCode = require(path.resolve(__dirname, '../../control code/ControlCode.js'))


  invoice.controlCode = function(cb) {
    fs.readFile(path.resolve(__dirname, '../../control code/5000CasosPruebaCCVer7.txt'), function (err, data) {
      if (err) {
        cb(null, err)
      }

      var lines = data.toString().split("\n");
      var count=0;
      var result = new Array();
      for (elem of lines) {
          var params = elem.split("|");
          var code = controlCode.generateControlCode(params[0],//Numero de autorizacion
                                  params[1],//Numero de factura
                                  params[2],//Número de Identificación Tributaria o Carnet de Identidad
                                  params[3].replace(/[/]/g,''),//fecha de transaccion de la forma AAAAMMDD
                                  params[4],//Monto de la transacción
                                  params[5]//Llave de dosificación
                  );

          result.push("Codigo generado: " + code + " Codigo SIN: " + params[10]);

          if(params[10]===code){
              count = count + 1;
          }
      };
      cb(null, {codigos: result, totalValidos: count});
    });
  };

  invoice.remoteMethod(
    'controlCode',
    {
      returns: {arg: 'result', type: 'string'},
      http: {path:'/controlCode', verb: 'post'},
    }
  );
}
