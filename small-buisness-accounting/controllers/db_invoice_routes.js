// use express for routing
const router = require('express').Router();
// initiates database modesl into variable models
var db = require('../models');
// brings in the generated sequelize code that describes the database 
var initModels = require("../models/init-models");
// creates an instence of the database modesl
var models = initModels(db.sequelize);
// brings in sequelize operators
const Op = db.Sequelize.Op;
// sets port based on the deployment enviroment as determeind by const env
const PORT = process.env.PORT || 3001;


router.get('/invoice', async (req, res) => {
  // Send the rendered Handlebars.js template back as the response
  var findOpts = {
    include: [
      {
        model: models.dbo_invoicelines,
        as: "dbo_invoicelines",
      },
      {
        model: models.dbo_customers,
        as: "Invoice_Customer_dbo_customer"
      }
    ],
  };

  if (req.query.q) {
    findOpts.where = {
      [Op.or]: [
          { BillToName: { [Op.like]: req.query.q + "%" } },
          { ["$Invoice_Customer_dbo_customer.FirstName$"]: { [Op.like]: req.query.q + "%" } },
          { ["$Invoice_Customer_dbo_customer.LastName$"]: { [Op.like]: req.query.q + "%" } },
          { BillToName: { [Op.like]:'%' + req.query.q + "%" } },
        ]
      }
  }
  try {
    var c = await models.dbo_invoices.findAll(findOpts);
    var d = c.map((v) => v.dataValues);
    // console.log(d.dbo_invoicelines);
    // res.render('home', {data:d});
    res.status(200).json(d);
    // res.status(200).json(c)
  } catch (err) {
    res.status(500).json(err);
    console.log(err)
  }
});

router.get('/invoice/:id', async (req, res) => {
    var findOpts = {
        where: {
            Id: parseInt(req.params.id)
        },
        raw: true,
        include: [
          {
            model: models.dbo_invoicelines,
            as: "dbo_invoicelines",
          },
          {
            model: models.dbo_customers,
            as: "Invoice_Customer_dbo_customer"
          }
        ],
      };
    if (req.query.q) {
    findOpts.where = {
      [Op.or]: [
          { BillToName: { [Op.like]: req.query.q + "%" } },
          { ["$Invoice_Customer_dbo_customer.FirstName$"]: { [Op.like]: req.query.q + "%" } },
          { ["$Invoice_Customer_dbo_customer.LastName$"]: { [Op.like]: req.query.q + "%" } },
          { BillToName: { [Op.like]:'%' + req.query.q + "%" } },
        ]
      }
    }
    try {
        var invoiceData = await models.dbo_invoices.findAll(findOpts);
        if (invoiceData[0] == 0) {
            res.status(404).json({ message: "no records found to update with given id" });
            return;
        }
        res.json(invoiceData);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.put('/invoice/:id', async (req, res) => {
    try {
        var invoiceData = await models.dbo_invoices.update(
            req.body,
            {
                where: {
                    Id: parseInt(req.params.id)
                },
                raw: true
            }
        );
      // delete old invoicelines before adding the updated ones to prevent redundancy
    await models.dbo_invoicelines.destroy({
      where: {
        InvoiceLines_Invoice: req.params.id
      }
    });
    // loop over the items in the key InvoiceLines_Invoice key from the and create each line in dbo_invoicelines
    // 
    req.body.dbo_invoicelines.forEach(async element => {
      element.InvoiceLines_Invoice = req.params.id
      await models.dbo_invoicelines.create(
        element
      );
    });

    if (invoiceData[0] == 0){
      res.status(404).json({message: "no records found to update with given id"});
      return;
    }
    res.json(invoiceData);
  } catch (err) {
    res.status(500).json(err);
    console.log(err)
  }
});

router.post('/invoice/', async (req, res) => {
  try {
    // create a invoicedate out of a now instance
    req.body.InvoiceDate = Date.now();
    // create new invoice from the invoice portion of the body, define the fields from the keys in said portion
    const invoiceData = await models.dbo_invoices.create(
      req.body.invoice,
      {fields:Object.keys(req.body.invoice)}
    )

    var newInvoiceId = await db.sequelize.query("select @@identity as newInvoiceId");
    // get newly created invoice id
    // var newInvoiceId = await res.json(Id);  
    // create series of new invoice lines from the elements stored in the dbo_invoicelines
    //  key in the body using newInvoiceId as foriegn key for the invoice the invoice lines belong to
    req.body.dbo_invoicelines.forEach(async element => {
      element.InvoiceLines_Invoice = newInvoiceId[0][0].newInvoiceId;
      await models.dbo_invoicelines.create(
        element
      );
    });

    if (invoiceData[0] == 0){
      res.status(404).json({message: "no records found to update with given id"});
      return;
    }
    res.json(invoiceData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/invoice/:id', async (req, res) => {
    try {
        var invoiceData = await models.dbo_invoices.destroy(req.body,
            {
                where: {
                    Id: parseInt(req.params.id)
                },
                raw: true
            }
        );
    if (invoiceData[0] == 0) {
        res.status(404).json({ message: "no records found to update with given id" });
        return;
    }
    res.json(invoiceData);
} catch (err) {
    res.status(500).json(err);
}
});
  
module.exports = router;