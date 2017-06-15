// DEFINE ROUTES 

var express = require('express');
var router = express.Router();

var ctrlHotels = require('../controllers/hotels.controllers.js');


//When there is a get request to /hotels, call hotelsGetAll function from controller. 
router
    .route('/hotels/')
    .get(ctrlHotels.hotelsGetAll);
router
    //define paramater with colon, which controller can then access. 
    .route('/hotels/:hotelId')
    .get(ctrlHotels.hotelsGetOne);

router
    .route('/hotels/new')
    .post(ctrlHotels.hotelsAddOne);

//Export Express router to require in app.js 
module.exports = router;