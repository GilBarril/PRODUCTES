module.exports = function(http) {
        var Producte = require("../../models/producte");
        var Botiga = require("../../models/Botiga");
        var router = require("express").Router();
        var socket = require("../../controllers/api/botiguer")(http);

        router.get("/:id", function (req,res,next) {
            Producte.find({nom: req.params.id}).populate('Botiga').execute(function(err,producte) {
                if (err) {
                    return next(err);
                }
                res.json(producte);
            });

        });

        router.get("/", function(req, res, next) {
            Producte.find().sort('-date').populate('Botiga').exec(function(err, productes) {
                if (err) {
                    return next(err);
                }
                res.json(productes);
            });

        });



        router.post("/", function (req,res,next) {
            var producte = new Producte({
                Botiga: req.body.Botiga,
                nom: req.body.nom,
                preu: req.body.preu,
                existencies : req.body.existencies,
                });
            producte.save(function(err, producte) {
                if (err) { return next(err) }
                Producte.findById(producte._id).populate('Botiga').exec(function(err,pro) {
                    socket.nou(pro);
                })
                
                
                res.status(201).json(producte);
            });
        });


        router.put( "/:id", function( req, res, next ) {


            Producte.find({"nom": req.params.id} , function(err, producte) {
                console.log(producte);
                if (err) return next(err);
                Producte.findByIdAndUpdate(producte[0]._id, req.body, function(err,p) {
                    if (err) return next(err);
                    
                    res.status(201).json({"missatge" :"producte modificat"});
                    Producte.findById(p._id).populate('Botiga').exec(function(err,pro) {
                    socket.edita(pro);
                })
                    
                });
                        });
        });


        router.delete( "/:id", function( req, res, next ) {
        var idProducte;
           Producte.find({"nom":req.params.id},function(err, producte){
              idProducte= producte[0]._id;
             
           })
           Producte.remove({"nom":req.params.id}, function( err) {
               if(err){
                   return next(err);
               } 
               res.status(200);
               
               socket.borrar(idProducte);
            });
        });
        return  router;    
}
