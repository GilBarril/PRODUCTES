
var Botiga = require("../../models/Botiga");
var router = require("express").Router();

router.get("/:id", function (req,res,next) {
    Botiga.find({nom: req.params.id}, function(err,botiga) {
        if (err) {
            return next(err);
        }
        res.json(botiga);
    });
   
});

router.get("/", function(req, res, next) {
    Botiga.find().sort('-date').populate('Botiga').exec(function(err, botigues) {
        if (err) {
            return next(err);
        }
        res.json(botigues);
    });
    
});


router.post("/", function (req,res,next) {
    var botiga = new Botiga({
        nom: req.body.nom,
        poblacio: req.body.poblacio
    });
    botiga.save(function(err, botiga) {
        if (err) { return next(err) }
        res.status(201).json(botiga);
    });
});


router.put( "/:id", function( req, res, next ) {
   
    
    Botiga.find({"nom": req.params.id} , function(err, botiga) {
        console.log(botiga);
        if (err) return next(err);
        Botiga.findByIdAndUpdate(botiga[0]._id, req.body, function(err) {
            if (err) return next(err);
            console.log('patata')
            res.status(201).json({"missatge" :"botiga modificada"});
        });
                });
});


router.delete( "/:id", function( req, res, next ) {
    
   Botiga.remove({"nom":req.params.id}, function( err) {
       if(err){
           return next(err);
       } 
       res.status(200);
    });
});
module.exports = router;