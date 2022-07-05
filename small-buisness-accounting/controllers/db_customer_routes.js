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


router.get('/customer', async (req, res) => {
    var findOpts = {
        include: [
            {
                model: models.dbo_invoices,
                as: "dbo_invoices",
            },
            {
                model: models.dbo_proposals,
                as: "dbo_proposals",
            }
        ],
    };
    if (req.query.q) {
        // specifies the params of the sequelize findAll request
        findOpts.where = {
            // sequelize where variable for specifying selecting criteria
                // specifies the Sequelize or operator
                [Op.or]: [
                    // FirstName = querystring?q=
                    { FirstName: { [Op.like]: req.query.q + "%" } },
                    // OR
                    // LastName = querystring?=q
                    { LastName: { [Op.like]: req.query.q + "%" } }
                ],

        };
    }
    try {
        var customerData = await models.dbo_customers.findAll(findOpts);
        res.status(200).json(customerData);
    }
   catch (err) {
    res.status(400).json(err);
  }
});

router.get('/customer/:id', async (req, res) => {
    var findOpts = {
        where: {
            Id: parseInt(req.params.id)
        },
        raw: true,
        include: [
            {
                model: models.dbo_invoices,
                as: "dbo_invoices",
            },
            {
                model: models.dbo_proposals,
                as: "dbo_proposals",
            }
        ],
    };
    try {
        var CustomerData = await models.dbo_customers.findAll(findOpts);
        if (CustomerData[0] == 0) {
            res.status(404).json({ message: "no records found to update with given id" });
            return;
        }
        res.json(CustomerData);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.put('/customer/:id', async (req, res) => {
    try {
        var CustomerData = await models.dbo_customers.update(
            req.body,
            {
                where: {
                    Id: parseInt(req.params.id)
                },
                raw: true
            }
        );
        if (CustomerData[0] == 0) {
            res.status(404).json({ message: "no records found to update with given id" });
            return;
        }
        res.json(CustomerData);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/customer/', async (req, res) => {
    try {
        req.body.DateCreated = Date.now()
        const customerData = await models.dbo_customers.create(
            req.body,
            { fields: Object.keys(req.body) }
        );
        if (customerData[0] == 0) {
            res.status(404).json({ message: "no records found to update with given id" });
            return;
        }
        res.json(customerData);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.delete('/customer/:id', async (req, res) => {
    try {
        var CustomerData = await models.dbo_customers.destroy(req.body,
            {
                where: {
                    Id: parseInt(req.params.id)
                },
                raw: true
            }
        );
    if (CustomerData[0] == 0) {
        res.status(404).json({ message: "no records found to update with given id" });
        return;
    }
    res.json(CustomerData);
} catch (err) {
    res.status(500).json(err);
}
});
  
module.exports = router;