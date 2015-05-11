module.exports = function(http) {
    var io = require("socket.io")(http);  //sockect.io necessita http per funcionar
 
   
    io.on('connection', function(socket) { 
    });

    return {
        nou: function(producte) {
            io.emit('newProduct',producte);
            console.log("Crea Producte");
        },
        edita : function(producte){
            io.emit('updateProduct',producte);
            console.log("EditarProducte");
        },
        borrar : function(producte){
            io.emit('deleteProduct',producte);
            console.log("ProducteEsborrat");
        }
         
    }
};