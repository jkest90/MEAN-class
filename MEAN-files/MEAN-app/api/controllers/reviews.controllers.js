var mongoose = require('mongoose');
var Hotel = mongoose.model('Hotel');

//-----GET ALL REVIEWS FOR A HOTEL
module.exports.reviewsGetAll = function (req, res) {
    var id = req.params.hotelId;
    console.log('GET reviews for hotelId', id);

    Hotel
        .findById(id)
        .select('reviews')
        .exec(function (err, doc) {
            var response = {
                status: 200,
                message: []
            };
            if (err) {
                console.log("Error finding hotel");
                response.status = 500;
                response.message = err;
            } else if (!doc) {
                console.log("Hotel is not found in database", id);
                response.status = 404;
                response.message = {
                    "message": "Hotel ID not found " + id
                };
            } else {
                response.message = doc.reviews ? doc.reviews : [];
            }
            res
                .status(response.status)
                .json(response.message);
        });
};

//-----GET SINGLE REVIEW FOR A HOTEL
module.exports.reviewsGetOne = function (req, res) {
    var hotelId = req.params.hotelId;
    var reviewId = req.params.reviewId;
    console.log('GET reviewId ' + reviewId + ' for hotelId ' + hotelId);

    Hotel
        .findById(hotelId)
        .select('reviews')
        .exec(function (err, hotel) {
            var response = {
                status: 200,
                message: {}
            };
            if (err) {
                console.log("Error finding hotel");
                response.status = 500;
                response.message = err;
            } else if (!hotel) {
                console.log("Hotel id not found in database", id);
                response.status = 404;
                response.message = {
                    "message": "Hotel ID not found " + id
                };
            } else {
                // Get the review
                response.message = hotel.reviews.id(reviewId);
                // If the review doesn't exist Mongoose returns null
                if (!response.message) {
                    response.status = 404;
                    response.message = {
                        "message": "Review ID not found " + reviewId
                    };
                }
            }
            res
                .status(response.status)
                .json(response.message);
        });

};



/* Mongo shell - add _id property to all review sub docs: 
db.hotels.update(
    {},
    {
        $set : {
            'reviews.0._id' : ObjectId()

        }
    },
    {
        multi : true
    }
) */


//add review to 'review's array, then save the hotel model instance (document we get when we execute findById). This mongoose mondel instance maps directly to a single item in the database. We find the hotel we're working with based on it's id, and then push in the data into the reviews array. 

// push review into 'reviews' array in model instance. 
var _addReview = function (req, res, hotel) {

    hotel.reviews.push({
        name: req.body.name,
        rating: parseInt(req.body.rating, 10),
        review: req.body.review
    });

    hotel.save(function (err, hotelUpdated) {
        if (err) {
            res
                .status(500)
                .json(err);
        } else {
            res
                .status(200)
                .json(hotelUpdated.reviews[hotelUpdated.reviews.length - 1]);
        }
    });

};

// 1. Get hotel based on hotel id paramater.
// 2. Select 'reviews' property subdocument and execute query. 
// 3. If error, send response status/message. 
// 4. If a review's subdoc (doc) exists, call _addReview function and pass in review subdoc. 
// 5. _addReview pushes an object containing the review into the 'reviews' array of our model instance. These properties access the name, rating, and review. This Mongoose model instance maps directly to the properties of a single item in the database. 
// 6. Save the updated review model instance and send the last review added (the one just created). In order to save the subdoc we must save the parent document. Can't just save the subdoc. Save method runs on the model instance 
module.exports.reviewsAddOne = function (req, res) {

    var id = req.params.hotelId;

    console.log('POST review to hotelId', id);

    Hotel
        .findById(id)
        .select('reviews')
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
            //if document exists, add review. if not, send err response status/message.
            //document we pass into pass into _addReview is the 'reviews' sub-document in our mongoose model schema (the 'reviews' property of the hotel schema).
            if (doc) {
                _addReview(req, res, doc);
            } else {
                res
                    .status(response.status)
                    .json(response.message);
            }
        });


};

module.exports.reviewsUpdateOne = function (req, res) {
    //PUT used for updating an ENTIRE document
    Hotel
        .findById(hotelId)
        .select('reviews')
        .exec(function (err, hotel) {
            var response = {
                status: 200,
                message: {}
            };
            if (err) {
                console.log("Error finding hotel");
                response.status = 500;
                response.message = err;
            } else if (!hotel) {
                console.log("Hotel id not found in database", id);
                response.status = 404;
                response.message = {
                    "message": "Hotel ID not found " + id
                };
            } else {
                // Get the review
                response.message = hotel.reviews.id(reviewId);
                // If the review doesn't exist Mongoose returns null
                if (!response.message) {
                    response.status = 404;
                    response.message = {
                        "message": "Review ID not found " + reviewId
                    };
                }
            }
            res
                .status(response.status)
                .json(response.message);
        });

}