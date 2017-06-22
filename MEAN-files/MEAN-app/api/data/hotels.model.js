// A schema is the Mongoose model that represents, and is the entry-point into a collection in our database. In our 'meanhotel' DB collection 'hotels', we have our JSON hotel data. By defining a schema, we tell the application the type of data we have in each document, ultimately providing a representation of this JSON data which we can then retrieve in whichever manner we please within our controller. ALL of the interaction with our data is done through the model. 

var mongoose = require('mongoose');

//-----DEFINE SCHEMA FOR SUB-DOCUMENTS (nested documents)

var reviewSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
   rating : {
       type : Number,
       min : 0,
       max : 5,
       required : true
   },
    review : {
        type : String,
        required : true
    },
    createdOn : {
        type : Date,
        'default' : Date.now
    }
});

var roomSchema = new mongoose.Schema({
    type : String,
    number : Number,
    description : String,
    photos : [String],
    price : Number
});

//-----DEFINE HOTEL SCHEMA
// types: String, Number, Boolean, Dates, Buffer (binary data), Object ID, Mixed (any data type), Array

var hotelSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true //validation: this path must always have a value
    },
    stars : {  // a number, default value of 0; min value of 0; max value of 5
        type : Number,
        min : 0,
        max : 5,
        'default' : 0 //default - JS reserved word - to avoid lint errors use 'default'
    },
    services : [String], //an array of strings 
    description : String,
    photos : [String],
    currency : String,
    reviews : [reviewSchema], //pass in name of review schema. adds unique _id prop. 
    rooms : [roomSchema],
    location : {
        address : String,
        // Always store coordinates [ longitude (E/W), latitude (N/S) ]
        coordinates : {
            type : [Number],
            // Index Geospatial Coordinates: 
            // '2dindex': index for coordinates for a flat plain vs.
            // '2dsphere': index coordinates path mapped as a sphere 
            //  vs. 3d, which implies depth BELOW surface
            index : '2dsphere'
        }
    }
});

//-----COMPILE MODEL FROM SCHEMA. 

// 1st param: Name of model
// 2nd param: Name of schema
// 3rd param: Name of MongoDB collection. Optional. If not supplied Mongoose will use lowercase, pluralized version of model name. e.g., 'hotels'

mongoose.model('Hotel', hotelSchema)

