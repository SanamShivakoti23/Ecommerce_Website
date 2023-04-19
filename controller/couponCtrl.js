const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMangodbid");

// create a coupon
const createCoupon = asyncHandler(async(req, res)=>{

    try{
        const createCoupon = await Coupon.create(req.body);
        res.json(createCoupon);
    }catch(error){
        throw new Error(error);
    }
});

// get all created coupon

const getallcoupon = asyncHandler(async(req, res)=>{
    try{
        const getallcoupon = await Coupon.find();
        res.json(getallcoupon);

    }catch(error){
        throw new Error(error);
    }
});

// update coupon

const updatecoupon = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    try{
        const updatecoupon = await Coupon.findByIdAndUpdate(
            id,
            req.body,
            {
                new:true,
            });
            res.json(updatecoupon);

    }catch(error){
        throw new Error(error);
    }
 
});

// delete coupon
const deletecoupon = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    try{
        const deletecoupon = await Coupon.findByIdAndDelete(id);
        res.json(deletecoupon);

    }catch(error){
        throw new Error(error);
    }
    
})


module.exports = {createCoupon, getallcoupon,updatecoupon, deletecoupon};