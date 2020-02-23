var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://admin:admin@clipboard-rtfg2.mongodb.net/test?retryWrites=true&w=majority";
var str = "";


app.post('/addClip', (req, res) => {
    console.log('Got body:', req.body);
    MongoClient.connect(url,function(err,db){
        var dbo = db.db("clipboard");
        myobj = req.body;
        dbo.collection("clips").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
          });
    });
    res.send(200);
});

app.route('/clips/:userId').get(function(req, res) {
    userId = req.params.userId;
    console.log(userId);
    main_result = {};
   MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("clipboard");
    var query = {user: userId};
    dbo.collection("clips").find(query).toArray(function(err, result) {
      if (err) throw err;
      main_result = result;
      //console.log(result);
      db.close();
      res.send(result);
    });
    //res.send(main_result);
   });
});



var server = app.listen(3000, function() {console.log("Server listening on port http://localhost:3000 ");});