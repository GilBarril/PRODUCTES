var mongoose = require("mongoose");

/*mongolab user:gilgr1990@gmail.com pass:Willfreud41558234*/

mongoose.connect("mongodb://examen:examen1234@dbh62.mongolab.com:27627/examen", function(){
 console.log("connect a mongodb");
});

module.exports = mongoose;