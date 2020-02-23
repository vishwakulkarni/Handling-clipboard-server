var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = "mongodb+srv://admin:admin@clipboard-rtfg2.mongodb.net/test?retryWrites=true&w=majority";
var str = "";

var server = require('http').createServer(app);
// var io = require('socket.io')(server);


app.use(express.static(__dirname + '/node_modules'));
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/index.html');
});


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

app.route('/deleteClip').delete(function(req, res) {
  console.log('Got body DELETE:', req.body);
  let result = {};
  MongoClient.connect(url,function(err,db){
      var dbo = db.db("clipboard");
      id = req.body._id;
      console.log("Id to be deleted: "+id)
      var myquery = { _id: new mongodb.ObjectID(id) };
      dbo.collection("clips").deleteOne(myquery, function(err, res) {
          if (err) throw err;
          result["success"] = true
          result["message"] = "Successfully deleted the document"
          db.close();
        });
  });
  res.status(200);
  res.send(result);
});


// var express = require('express');
// var app = express();
var expressWs = require('express-ws')(app);
 
app.use(function (req, res, next) {
  console.log('middleware');
  req.testing = 'testing';
  return next();
});
 
// app.get('/desktopClient', function(req, res, next){
// //   console.log('get route', req.testing);
// //   res.end();
// });
 
app.ws('/desktopClient', function(ws, req) {
  ws.on('message', function(msg) {
    MongoClient.connect(url,function(err,db){
        var dbo = db.db("clipboard");
        

        let myobj = JSON.parse(msg);
        console.log("message from desktop client: ",myobj);
        dbo.collection("clips").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
        });
        // ws.send({
        //     success: true
        // })
    });
  });
  console.log('socket', req.testing);
});

app.ws('/mobileClient', function(ws, req) {
    ws.on('message', function(msg) {
      console.log(msg);
      MongoClient.connect(url,function(err,db){
        var dbo = db.db("clipboard");
        myobj = msg;
        dbo.collection("clips").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
          });
        });
        // ws.send({
        //     success: true
        // })
    });
    // console.log('socket', req.testing);
  });
 
app.listen(3000);