//-----MANAGE LOGIC AND FUNCTIONALITY OF ROUTES  
var ObjectId = require('mongodb').ObjectId;
var dbconn = require('../data/dbconnection.js');
var hotelData = require('../data/hotel-data.json');

//--GET ALL HOTELS (subset/paginated)
module.exports.hotelsGetAll = function (req, res) {
    
    //instantiate database connection & use 'hotels' collection
    var db = dbconn.get();
    var collection = db.collection('hotels');
    
    //offset: starting point of array
    //count: ending point
    var offset = 0;
    var count = 5;
    
    // If we have a request query & a query of offset/count, offset/count = value of offset/value of count. 
    // parseInt to convert from string to a number. 
    if (req.query && req.query.offset) {
        offset = parseInt(req.query.offset, 10);
    }
    
    if (req.query && req.query.count) {
        count = parseInt(req.query.count, 10);
    }
    
    
    collection.
      find()
      .skip(offset)
      .limit(count)
      .toArray(function (err, docs) {  //async/non-blocking   
        console.log("Found hotels", docs);
        res
            .status(200)
            .json(docs);
      })
};

//--GET ONE HOTEL (based on ID)
module.exports.hotelsGetOne = function (req, res) {

    //instantiate database connection & use 'hotels' collection
    var db = dbconn.get();
    var collection = db.collection('hotels');

    //extract url parameter from request object and store in a variable.
    // hotelId variable accesses the paramaterized route (/:hotelId), defined in route's index.js via the request object. 
    var hotelId = req.params.hotelId;

    console.log('GET hotelId', hotelId);
    
    collection
      .findOne({
        _id : ObjectId(hotelId) 
    }, function (err, doc) {
        res
            .status(200)
            .json(doc);
      });
    
};

//--ADD ONE HOTEL
module.exports.hotelsAddOne = function (req, res) {
    var db = dbconn.get();
    var collection = db.collection('hotels');
    var newHotel;
    
    if (req.body && req.body.name && req.body.stars) {
        newHotel = req.body;
        newHotel.stars = parseInt(req.body.stars, 10); //from string to number
        collection.insertOne(newHotel, function(err, response) {
            console.log(response);
            console.log(response.ops);
            res
                .status(201)
                .json(response.ops)
        });
    } else {
        console.log("Data missing from body");
        res
            .status(400)
            .json({ message : "Required data missing from body" });
    }
};