module.exports = function(invoice) {
  var path = require('path');
  var app = require(path.resolve(__dirname, '../../server/server'));
  var ds = app.dataSources.sqldb;
  var controlCode = require(path.resolve(__dirname, '../../control code/ControlCode.js'))
  var dateFormat = require('dateformat');

  invoice.getDataForTheInvoice =  function(id, identityCard, amount, clientName, detail, cb) {
    var date = new Date();
    console.log(date);
    invoice.find({
      where: {
          and: [{yefdel: {lte: date}}, {yefal: {gte: date}}]
        }
      },
      function(err, modelInstance) {

        if (err)
          cb(null, {error: "No se pudo obtener los datos de dosificación"});
        else {

          if (modelInstance.length == 0)
            cb(null, {error: "No hay datos de dosificación"});
          else
            executeProcedure(cb, modelInstance, identityCard, amount, date, clientName, detail, id);
        }
      });
  };

  function executeProcedure(cb, modelInstance, identityCard, amount, date, clientName, detail, id) {
    var procedure = "EXEC dbo.sp_nfactura " + modelInstance[0].yeautoriz;

    ds.connector.execute(procedure, function(error, data) {
      if (error)
        cb(null, {error: "No se pudo obtener el numero de factura"})
      else
        generateControlCode(cb,
          modelInstance[0].yeautoriz,
          data[0].fvanfac,
          identityCard,
          date,
          amount,
          modelInstance[0].yekey,
          modelInstance,
          clientName,
          detail,
          id
        );
    })
  };

  function generateControlCode(cb, autorizationNumber, invoiceNumber, identityCard, date, amount, key, modelInstance, clientName, detail, id) {

    var code = controlCode.generateControlCode(autorizationNumber,
                            invoiceNumber,
                            identityCard,
                            dateFormat(date, "yyyy/mm/dd").replace(/[/]/g,''),
                            String(amount),
                            key
               );

    var dataForInvoice = invoice.app.models.Ts003;

    dataForInvoice.find({where: {scnumi: modelInstance[0].yenumi}}, function(error, data) {
        if (error)
          cb(null, {error: "No se pudo obtener el debito fiscal"})
        else {
          var percentage = (parseFloat(amount) * parseFloat(data[0].scdebfis)) / 100;
          saveInvoice(date, invoiceNumber, autorizationNumber, identityCard, clientName,
                      amount, percentage, code, modelInstance[0].yefal, modelInstance, detail, data, id, cb)
        }
    });



  };

  function saveInvoice(date, invoiceNumber, autorizationNumber, identityCard, clientName, amount, taxDebit, controlCode, limitDate, modelInstance, detail, inf, id, cb) {

    var procedure = "EXEC dbo.sp_Insert_TFV001 "
                    + "'" + date.toISOString() + "'" + ","
                    + invoiceNumber + ","
                    + autorizationNumber + ","
                    + "'" + identityCard + "'" + ","
                    + "'" + clientName + "'" + ","
                    + amount + ","
                    + taxDebit + ","
                    + "'" + controlCode + "'" + ","
                    + "'" + limitDate.toISOString() + "'" + ","
                    + id;

    ds.connector.execute(procedure, function(error, data) {
      if (error)
        cb(null, {error: "No se pudo guardar la cabezera de la factura", system: error})
      else {
        if (data[0].error == 0) {
            cb(null, {error: "No se pudo guardar la cabezera de la factura", system: data.error})
        } else {
            putIdAndSaveDetail(detail, data, inf, modelInstance[0].yesfc, modelInstance[0].yenota, modelInstance[0].yenota2, id, cb);
        }
      }
    })
  };

  function putIdAndSaveDetail(detail, data, inf, sfc, noteOne, noteTwo, id, cb) {
    try {

      detail.forEach(function(item) {
        item.fvbnumi = data[0].fvanumi;
      });

      inf[0].scsfc = sfc;
      inf[0].scnoteone = noteOne;
      inf[0].scnotetwo = noteTwo;
      inf[0].scid = id;

      var detailInvoice = invoice.app.models.Tfv0011

      detailInvoice.create(detail, function(error, result) {
        if (error)
          cb(null, {error: "No se pudo guardar el detalle de factura"})
        else
          cb(null, {header: data, detail: result, inf: inf})
      });

    } catch(ex) {
      cb(null, {error: "No se pudo obtener el detalle"})
    }
  }

  invoice.remoteMethod(
    'getDataForTheInvoice',
    {
      accepts: [{arg: 'id', type: 'string'},
                {arg: 'identityCard', type: 'string'},
                {arg: 'amount', type: 'string'},
                {arg: 'clientName', type: 'string'},
                {arg: 'detail', type: 'array'}],
      returns: {arg: 'result', type: 'string'},
      http: {path:'/getDataForTheInvoice', verb: 'post'},
      description: ['It gets the data for load the invoice'],
    }
  );
}
