//-----MANAGE LOGIC AND FUNCTIONALITY OF ROUTES
var mongoose = require('mongoose');
var Hotel = mongoose.model('Hotel');

// Geospatial query to search for coordinates. 
var runGeoQuery = function (req, res) {
    //extract values from query string & create a geo-JSON point.
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);

    if (isNaN(lng) || isNaN(lat)) {
        res
            .status(400)
            .json({
                "message": "If supplied in querystring, lng and lat must both be numbers"
            });
        return;
    }
    // A geoJSON point
    var point = {
        type: "Point",
        coordinates: [lng, lat]
    };
    var geoOptions = {
        spherical: true,
        maxDistance: 2000,
        num: 5
    };

    Hotel
        .geoNear(point, geoOptions, function (err, results, stats) {
            console.log('Geo Results', results);
            console.log('Geo stats', stats);
            if (err) {
                console.log("Error finding hotels");
                res
                    .status(500)
                    .json(err);
            } else {
                res
                    .status(200)
                    .json(results);
            }
        });
};

//-----GET ALL HOTELS - subset/paginated (GET)
module.exports.hotelsGetAll = function (req, res) {
    console.log('GET the hotels');
    console.log(req.query);

    //offset: starting point of array
    //count: ending point
    var offset = 0;
    var count = 5;
    var maxCount = 10;

    // Run geoJSON function if lat & lng. Returns other hotels based on distance
    // Filtering results based should be done through filtering vs. additional routes
    if (req.query && req.query.lat && req.query.lng) {
        runGeoQuery(req, res);
        return;
    }
    // If we have a request query & a query of offset/count, offset/count = value of offset/value of count. 
    // parseInt to convert from string to   a number. 
    if (req.query && req.query.offset) {
        offset = parseInt(req.query.offset, 10);
    }
    if (req.query && req.query.count) {
        count = parseInt(req.query.count, 10);
    }
    if (isNaN(offset) || isNaN(count)) {
        res
            .status(400)
            .json({
                'message': 'If supplied in querystring count an offset should both be numbers'
            });
        return;
    }
    if (count > maxCount) {
        res
            .status(400)
            .json({
                'message': 'Count limit of ' + maxCount + ' exceeded'
            });
        return;
    }

    Hotel
        .find()
        .skip(offset)
        .limit(count)
        //exec method executes query. params: err, return data
        .exec(function (err, hotels) {
            if (err) {
                console.log('Error finding hotels');
                res
                    .status(500)
                    .json(err);
            } else {
                console.log('Found hotels', hotels.length);
                res
                    .json(hotels);
            }
        });
};



// Find the hotel by it's paramaterized ID from the url.
// hotelId variable accesses the paramaterized route (/:hotelId), defined in route's index.js via the request object.
// Execute. 
// Set a defualt status of 200 & a message of sending back the hotel document.   
// If an error is found, or no document was returned, change the status and message accordingly. 
// Return the status and the JSON through the response. 

//-----GET ONE HOTEL based on ID (GET)
module.exports.hotelsGetOne = function (req, res) {
    var id = req.params.hotelId;
    console.log('GET hotelId', id);

    Hotel
        .findById(id)
        .exec(function (err, doc) {
            var response = {
                status: 200,
                message: doc
            };
            if (err) {
                console.log("Error finding hotel");
                response.status = 500;
                response.message = err;
            } else if (!doc) {
                console.log("HotelId not found in database", id);
                response.status = 404;
                response.message = {
                    "message": "Hotel ID not found " + id
                };
            }
            res
                .status(response.status)
                .json(response.message);
        });

};


var _splitArray = function (input) {
    var output;
    if (input && input.length > 0) {
        output = input.split(';');
    } else {
        output = [];
    }
    return output;
};

//-----ADD ONE HOTEL (POST)
module.exports.hotelsAddOne = function (req, res) {
    console.log("POST new hotel");

    Hotel
        .create({
            // (object containing data to add to db, callback(err, hotel))
            name: req.body.name,
            description: req.body.description,
            stars: parseInt(req.body.stars, 10),
            services: _splitArray(req.body.services),
            photos: _splitArray(req.body.photos),
            currency: req.body.currency,
            location: {
                address: req.body.address,
                coordinates: [
                    parseFloat(req.body.lng),
                    parseFloat(req.body.lat)
                ]
            }
        }, function (err, hotel) {
            if (err) {
                console.log("Error creating hotel");
                res
                    .status(400)
                    .json(err);
            } else {
                console.log("Hotel created!", hotel);
                res
                    .status(201)
                    .json(hotel);
            }
        });

};


// 1. Find specific document to create a model instance. Exclude using 'select' to return only fields we can update.
// 2. Update the data in the model instance. 'doc' will be a MongoDB model instance of the MongoDB document. Use form data to set data in model instance. Apply directly to 'doc' model instance using dot syntax. 
// 3. Save the model instance into database using 'save' method
// 4. Send response to requester. If successful, REST standards indicate that a PUT request should return a response of 204. 

//-----UPDATE A SPECIFIC DOCUMENT (PUT)
module.exports.hotelsUpdateOne = function (req, res) {
    var hotelId = req.params.hotelId
    console.log('Get hotelId', hotelId);
// Step 1)
    Hotel
        .findById(hotelId)
         // since updating main document, not sub-documents, exclude sub-docs from query to keep out from model instance. use '-' with select to exclude fields.
        .select('-reviews -rooms')
        .exec(function (err, doc) {
            var response = {
                status: 200,
                message: doc
            };
            if (err) {
                console.log("Error finding hotel");
                response.status = 500;
                response.message = err;
            } else if (!doc) {
                console.log("HotelId not found in database", id);
                response.status = 404;
                response.message = {
                    "message": "Hotel ID not found " + id
                };
            }
            // return if response status has been changed from 200
            if (response.status !== 200) {
                res
                    .status(response.status)
                    .json(response.message);
            } else {
// Step 2)      
                doc.name = req.body.name; //model instance 'name' = request body 'name'
                doc.name = req.body.name,
                doc.description = req.body.description,
                doc.stars = parseInt(req.body.stars, 10),
                doc.services = _splitArray(req.body.services),
                doc.photos = _splitArray(req.body.photos),
                doc.currency = req.body.currency,
                doc.location = {
                    address: req.body.address,
                    coordinates: [
                    parseFloat(req.body.lng),
                    parseFloat(req.body.lat)
                    ]
                }
            };
// Step 3)
            doc.save(function(err, updatedHotel) {
                if(err) {
                    res
                        .status(500)
                        .json(err)  
                } else {
                    res
                        .status(204)
                        .json();
                }
            });
        });   
};