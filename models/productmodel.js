const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim: true,
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
    },
    description:{
        type:String,
        required:true,
        
    },
    price:{
        type:Number,
        required:true,
    },
    Category:{
        // type: mongoose.Schema.Types.ObjectId, 
        // ref: "category",

        type:String,
        required:true,
    },
    brand:{
        type:String,
        // enum:["Apple","Samsung","Lenovo"],
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
    },
    sold:{
        type:Number,
        default:0,
        // Select:false, for not showing field
    },
    images:[],
    color:{
        type:String,
        // enum:["Black","Brown","Red"],
        required:true,
    },
    ratings:[{
        star:Number,
        comment: String,
        postedby:{type:mongoose.Schema.Types.ObjectId, 
        ref:"User"},
    },
    ],
    totalrating:{
        type: String,
        default: 0,
    },
},
{
    timestamps:true
}
);

//Export the model
module.exports = mongoose.model('Product', productSchema);