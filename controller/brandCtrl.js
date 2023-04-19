const brand = require('../models/brandModel');
const asyncHandler = require('express-async-handler');
const validateMongodbId = require("../utils/validateMangodbid");


// for creating the product brand
const createbrand = asyncHandler(async(req, res)=>{
    try{

        const newbrand = await brand.create(req.body);
        res.json(newbrand);

    }catch(error){
        throw new Error(error);
    }
});

// for updating the product brand

const updatebrand = asyncHandler(async(req, res)=>{

    const {id} = req.params;
    validateMongodbId(id);
    try{

        const updatebrand = await brand.findByIdAndUpdate(id, req.body,
            {
                new:true,
            });
        res.json(updatebrand);

    }catch(error){
        throw new Error(error);
    }
});

// for deleting the brand
const deletebrand = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongodbId(id);
    try{
        const deletebrand = await brand.findByIdAndDelete(id);
        res.json(deletebrand);

    }catch(error){
        throw new Error(error);
    }
});

// find a brand by id
const getabrand = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongodbId(id);
    try{

        const getabrand = await brand.findById(id);
        res.json(getabrand);

    }catch(error){
        throw new Error(error);
    }
});

// getting all categories
const getallbrand = asyncHandler(async(req, res)=>{
    try{
        const getallbrand = await brand.find();
        res.json(getallbrand);
    }catch(error){
        throw new Error(error);
    }
});


module.exports = {createbrand, 
    updatebrand, 
    deletebrand, 
    getabrand,
    getallbrand
};