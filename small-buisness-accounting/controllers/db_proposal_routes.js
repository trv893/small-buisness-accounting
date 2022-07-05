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


router.get('/proposal', async (req, res) => {
  // Send the rendered Handlebars.js template back as the response
  var findOpts = {
    include: [
        {
            model: models.dbo_customers,
            as: "Proposal_Customer_dbo_customer",
        }
    ],
  };

  if (req.query.q) {
    findOpts.where = {
      [Op.or]: [
        {
          ["$Proposal_Customer_dbo_customer.FirstName$"]: {
            [Op.like]: `${req.query.q}%`,
          },
        },
        {
          ["$Proposal_Customer_dbo_customer.LastName$"]: {
            [Op.like]: `${req.query.q}%`,
          },
        },
        {
          JobName: {
            [Op.like]: `${req.query.q}%`,
          },
        },
      ],
    };
  }

  try {
    var c = await models.dbo_proposals.findAll(findOpts);
    var d = c.map((v) => v.dataValues);
    // console.log(c);
    // res.render('home', {data:d});
    res.status(200).json(d);
    // res.status(200).json(c)
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/proposal/:id', async (req, res) => {
    var findOpts = {
        where: {
            Id: parseInt(req.params.id)
        },
        raw: true,
        include: [
            {
                model: models.dbo_customers,
                as: "Proposal_Customer_dbo_customer",
            },
        ],
      };
      if (req.query.q) {
    findOpts.where = {
      [Op.or]: [
        {
          ["$Proposal_Customer_dbo_customer.FirstName$"]: {
            [Op.like]: `${req.query.q}%`,
          },
        },
        {
          ["$Proposal_Customer_dbo_customer.LastName$"]: {
            [Op.like]: `${req.query.q}%`,
          },
        },
        {
          JobName: {
            [Op.like]: `${req.query.q}%`,
          },
        },
      ],
    };
  }
    try {
        var proposalData = await models.dbo_proposals.findAll(findOpts);
        if (proposalData[0] == 0) {
            res.status(404).json({ message: "no records found to update with given id" });
            return;
        }
        res.json(proposalData);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.put('/proposal/:id', async (req, res) => {
    try {
        var proposalData = await models.dbo_proposals.update(
            req.body,
            {
                where: {
                    Id: parseInt(req.params.id)
                },
                raw: true
            }
        );
        if (proposalData[0] == 0) {
            res.status(404).json({ message: "no records found to update with given id" });
            return;
        }
        res.json(proposalData);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/proposal/', async (req, res) => {
    try {
        req.body.DateCreated = Date.now()
        const proposalData = await models.dbo_proposals.create(
            req.body,
            { fields: Object.keys(req.body) }
        );
        if (proposalData[0] == 0) {
            res.status(404).json({ message: "no records found to update with given id" });
            return;
        }
        res.json(proposalData);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.delete('/proposal/:id', async (req, res) => {
    try {
        var proposalData = await models.dbo_proposals.destroy(req.body,
            {
                where: {
                    Id: parseInt(req.params.id)
                },
                raw: true
            }
        );
    if (proposalData[0] == 0) {
        res.status(404).json({ message: "no records found to update with given id" });
        return;
    }
    res.json(proposalData);
} catch (err) {
    res.status(500).json(err);
}
});
  
module.exports = router;