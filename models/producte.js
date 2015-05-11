var db = require("../db");
var Producte = db.model('Producte', {
            Botiga:[{
                type: db.Schema.Types.ObjectId,
                ref: 'Botiga',
                required: true
            }],
            nom: {
                type: String,
                required: true,
                unique:true
            },
            preu: {
                type: String,
                required: true
            },
            existencies: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                required: true,
                default: Date.now
            }
       
    });

module.exports = Producte;