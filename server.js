var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var http = require("http").Server(app);



app.use(bodyParser.json());

app.use("/api/productes",require("./controllers/api/producte")(http));
app.use("/api/botigues",require("./controllers/api/botiga"));
app.use("/",require("./controllers/static"));
app.use("/api/sessions", require("./controllers/api/sessions"));
app.use("/api/users", require("./controllers/api/users"));



var options = {
    root: __dirname + "/layouts"
};

/* aqui especifiques el layout que en aquest cas és examen.html
app.get('/',function(req, res){
    res.sendFile("producte.html",options);
});*/


var port = process.env.PORT || 8080;

http.listen(port, function() {
    console.log('Server listening on',port);
});




 
