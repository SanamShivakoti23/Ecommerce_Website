const Product = require("../models/productmodel");
const asyncHandler = require("express-async-handler");
const User = require("../models/usermodel");
const slugify = require("slugify");  //Is used for remove the space 
const validateMongodbId = require("../utils/validateMangodbid");
const fs =require("fs");
const cloudinaryUploadImg = require("../utils/cloudinary");

//create a product
const createProduct = asyncHandler(async(req,res)=>{

    try{
        if(req.body.title){
            req.body.slug = slugify(req.body.title);
        }

        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    }catch (error){
        throw new Error(error);
    }
});

// find a product
const getaproduct = asyncHandler(async(req,res)=>{

    const {id} = req.params;
    validateMongodbId(id);
    try{
        const findProduct = await Product.findById(id);
        res.json(findProduct);

    }catch (error){
        throw new Error(error);
    }
});

//get all products

const getallproduct = asyncHandler(async(req,res)=>{

    try{

        // filtering product

        // const findallproduct = await Product.find(req.query); //for filtering using "req.query" , And query to search in "localhost:5000/api/product/all-products?brand=Apple&color=white"
        // const findallproduct = await Product.find(req.query);
        
        //fiterion product main method
        const querObj = {...req.query};
        const excludeFields = ["page","sort","limit","fields"];
        excludeFields.forEach((el) => delete querObj[el]);
        let queryStr = JSON.stringify(querObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        let query = Product.find(JSON.parse(queryStr));

        // Sorting 
        if(req.query.sort){
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        }else{
            query = query.sort("-crearedAt");
        }

        //limiting the fields
        if(req.query.fields){
            const fields = req.query.fields.split(",").join(" ");
           
            query = query.select(fields);
            
        }else{
            query = query.select("-__v");
        }

        //paginations
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);

        if(req.query.page){
            const productCount = await Product.countDocuments();
            if(skip >= productCount) throw new Error("This Page does not exists");
        }

        const product = await query;
        res.json(product);
    }catch(error){
        throw new Error(error);
    }
});

//updatel a product
const updateaproduct = asyncHandler(async(req,res)=>{

    const {id} = req.params;
    validateMongodbId(id);
    try{
        if(req.body.title){
            req.body.slug = slugify(req.body.title);
        }

        const productUpdate = await Product.findOneAndUpdate(id , req.body,{
            new : true,
            });
        res.json(productUpdate);

    }catch(error){
        throw new Error(error);
    }
});


// delete a product
const deleteaproduct = asyncHandler(async(req,res)=>{

    const {id} = req.params;
    validateMongodbId(id);
    try{

        const deleteproduct = await Product.findByIdAndDelete(id);
        res.json(deleteproduct);
    }catch(error){
        throw new Error(error);
    }
});


// wishlist functionality

const addtowhishlist = asyncHandler(async(req, res)=>{
    const {_id} = req.user;
    const {prodId} = req.body;

    try{
        const user = await User.findById(_id);
        const alreadyadded = user.wishlist.find((id)=>id.toString() === prodId);
        if(alreadyadded){

        const user = await User.findByIdAndUpdate(
            _id,
            {
                $pull:{wishlist: prodId},
            },
            {
                new: true,
            }
        );
        res.json(user);
        }else{

            const user = await User.findByIdAndUpdate(
                _id,
                {
                    $push:{wishlist: prodId},
                },
                {
                    new: true,
                }
            );
                res.json(user);
        }

    }catch(error){
        throw new Error(error);
    }
});

// rating functionality for product
const rating = asyncHandler(async(req,res) =>{

    const {_id} = req.user;
    const {star, prodId, comment} = req.body;
    try{
        const product = await Product.findById(prodId);
        let alreadyRated = product.ratings.find(
            (userId) => userId.postedby.toString() === _id.toString()
        );
        if(alreadyRated){
            const updateRating = await Product.updateOne(
                {
                    ratings: {$elemMatch : alreadyRated},
                },
                {
                    $set: {"ratings.$.star": star, "ratings.$.comment": comment},
                },
                {
                    new: true,
                }
            );
            // res.json(updateRating);
        }else{
            const rateProduct = await Product.findByIdAndUpdate(
                prodId,
                {
                    $push:{
                        ratings:{
                            star: star,
                            comment: comment,
                            postedby: _id,
                        },
                    },
                },
                {
                    new : true,
                }
            );
            // res.json(rateProduct);
        }

        // for total rating functionality
        const getallratings = await Product.findById(prodId);
        let totalRating = getallratings.ratings.length;
        let ratingsum = getallratings.ratings
        .map((item) => item.star)
        .reduce((prev, curr) => prev + curr, 0);

        let actualRating = Math.round(ratingsum / totalRating);
        let finalproduct = await Product.findByIdAndUpdate(
            prodId,
            {
                totalrating: actualRating,
            },
            { new: true}
        );
        res.json(finalproduct);

    }catch(error){
        throw new Error(error);
    }

});

// upload product images

const uploadImages = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongodbId(id);
   
    try{
        const uploader = (path)=> cloudinaryUploadImg(path, "images");
        const urls = [];
        const files = req.files;
        for(const file of files){
            const {path} = file;
            const newpath = await uploader(path);
            console.log(newpath);
            urls.push(newpath);
            fs.unlinkSync(path);
        }

        const findProduct = await Product.findByIdAndUpdate(
            id,
            {
                images: urls.map((file) =>{
                    return file;
                }),
            },
            {
                new:true,
            }
        );
        res.json(findProduct);

    }catch(error){
        throw new Error(error);
    }
});


module.exports = {
    createProduct,
    getaproduct,
    getallproduct,
    updateaproduct,
    deleteaproduct,
    addtowhishlist,
    rating,
    uploadImages
};