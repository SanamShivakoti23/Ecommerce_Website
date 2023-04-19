const Category = require('../models/prodcategoryModel');
const asyncHandler = require('express-async-handler');
const validateMongodbId = require("../utils/validateMangodbid");


// for creating the product category
const createCategory = asyncHandler(async(req, res)=>{
    try{

        const newcategory = await Category.create(req.body);
        res.json(newcategory);

    }catch(error){
        throw new Error(error);
    }
});

// for updating the product category

const updateCategory = asyncHandler(async(req, res)=>{

    const {id} = req.params;
    validateMongodbId(id);
    try{

        const updateCategory = await Category.findByIdAndUpdate(id, req.body,
            {
                new:true,
            });
        res.json(updateCategory);

    }catch(error){
        throw new Error(error);
    }
});

// for deleting the category
const deleteCategory = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongodbId(id);
    try{
        const deleteCategory = await Category.findByIdAndDelete(id);
        res.json(deleteCategory);

    }catch(error){
        throw new Error(error);
    }
});

// find a category by id
const getacategory = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongodbId(id);
    try{

        const getacategory = await Category.findById(id);
        res.json(getacategory);

    }catch(error){
        throw new Error(error);
    }
});

// getting all categories
const getallcategory = asyncHandler(async(req, res)=>{
    try{
        const getallcategory = await Category.find();
        res.json(getallcategory);
    }catch(error){
        throw new Error(error);
    }
});


module.exports = {createCategory, 
    updateCategory, 
    deleteCategory, 
    getacategory,
    getallcategory
};