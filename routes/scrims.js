var express = require('express');
var router = express.Router();

var Scrim = require('../models/scrim');
var User = require('../models/user');
var { authCheck } = require('../middleware/authCheck');

router.post("/create", authCheck, (req, res, next) => {
    User.findOne({ battletag: req.body.user }).then((user, err) => {
    
        var newScrim = new Scrim({
            user: req.body.user,
            best_of: req.body.bestOf,
            maps: req.body.maps,
            sr_lower: req.body.minSR,
            sr_higher: req.body.maxSR,
            region: req.body.region
        });
        newScrim.joinTeam1(user.battletag, "slot1", user.tankSR, user.image);

        newScrim.save((err, saved) => {
            console.log(err);
            console.log(saved);
            if(err) return res.json({ success: false });
            else return res.json({ success: true, scrimID: newScrim._id });
        })
    });
})

router.get("/scrim/:scrimID", (req, res, next) => {
    var scrimID = req.params.scrimID;
    Scrim.findById(scrimID).then((scrim, err) => {
        if(err) return res.json({ success: false });
        else return res.json({ success: true, scrim });
    })
})

router.get("/all", (req, res, next) => {
    Scrim.find({public: true}).populate({ path: 'scrim.team_1', strictPopulate: false }).then((scrims, err) => {
        if(err) return res.json({ success: false });
        return res.json({ success: true, scrims });
    })
})

router.post("/private", (req, res, next) => {
    var privateCode = req.body.privateCode;
    Scrim.findOne({ privateCode: privateCode }).then((scrim, err) => {
        if(err) return res.json({ success: false });
        if(!scrim) return res.json({ success: false });
        else return res.json({ success: true, scrimID: scrim._id });
    })
})

module.exports = router;