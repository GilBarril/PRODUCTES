var db = require("../db");
var Botiga = db.model('Botiga', {
            nom: {
                type: String,
                required: true
            },

            poblacio: {
                type: String,
                required: true
            }
    });

module.exports = Botiga;
