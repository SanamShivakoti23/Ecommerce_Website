const User = require("../models/usermodel");
const Cart = require("../models/cartModel");
const Product = require("../models/productmodel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqid = require('uniqid');
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongodbId = require("../utils/validateMangodbid");
const { generaterefreshToken } = require("../config/refreshtoken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const SendEmail = require("./emailCtrl");
const createUser = asyncHandler(async (req, res) => {

    const email = req.body.email;
    const findUser = await User.findOne({ email: email });

    if (!findUser) {
        // create a new user
        const newuser = await User.create(req.body);
        res.json(newuser);
    } else {
        // display message "user is already exists"
        throw new Error('User Already Exists');
    }
});

// auth for login User
const loginUserCtrl = asyncHandler(async (req, res) => {

    const { email, password } = req.body;
    const findUser = await User.findOne({ email: email });
    // check if user exists or not
    if (findUser && (await findUser.isPasswordMatched(password))) {
        // for refresh token
        const refreshToken = await generaterefreshToken(findUser?.id);
        const updateuser = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken: refreshToken,
            },
            {
                new: true
            }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });

        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    } else {
        throw new Error("Invalid Credentials");
    }

});

// *****************************************************************************************************************************
// auth for Admin
const loginAdminCtrl = asyncHandler(async (req, res) => {

    const { email, password } = req.body;
    const findAdmin = await User.findOne({ email: email });
    if(findAdmin.role !== "admin") throw new Error("Not Authorized");
    // check if user exists or not
    if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
        // for refresh token
        const refreshToken = await generaterefreshToken(findAdmin?.id);
        const updateuser = await User.findByIdAndUpdate(
            findAdmin.id,
            {
                refreshToken: refreshToken,
            },
            {
                new: true
            }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });

        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id),
        });
    } else {
        throw new Error("Invalid Credentials");
    }

});


// *****************************************************************************************************************************

// Handle a refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {

    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error("No Refresh token present in db or not matched");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {

        if (err || user.id !== decoded.id) {
            throw new Error("There is something went wrong with refresh token");
        }

        const accessToken = generateToken(user?._id);
        res.json({ accessToken });
    })
});


// for logout user

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204); //forbidden
    }

    await User.findOneAndUpdate(refreshToken, {
        refreshToken: "",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
    });
    res.sendStatus(204); //forbidden

});


// get all users
const getalluser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers)
    } catch (error) {
        throw new Error(error);
    }
}
);

// get a user
const getauser = asyncHandler(async (req, res) => {

    const { id } = req.params;
    validateMongodbId(id);
    try {
        const getaUser = await User.findById(id);
        res.json({
            getaUser,
        });
    } catch (error) {
        throw new Error(error);
    }
}
);

// ***************************************************************************************************
const saveAddress = asyncHandler(async(req, res)=>{
    const {_id} = req.user;
    validateMongodbId(_id);
    try{
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                address: req?.body?.address,
            },
            {
                new: true,
            }
        );
        res.json(updatedUser)
    }catch(error){
        throw new Error(error);
    }
});

// ***************************************************************************************************

// delete a user
const deleteauser = asyncHandler(async (req, res) => {

    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deleteaUser = await User.findByIdAndDelete(id);
        res.json({
            deleteaUser,
        });
    } catch (error) {
        throw new Error(error);
    }
}
);

// update a user

const updatedUser = asyncHandler(async (req, res) => {
    // const {id} = req.params;   ***one method to update a user ,for this we have to simply type "id"
    const { _id } = req.user;  //second method to update a user, for this we have to give "_id"
    validateMongodbId(_id);
    try {

        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                firstname: req?.body?.firstname,
                lastname: req?.body?.lastname,
                email: req?.body?.email,
                mobile: req?.body?.mobile,
                password: req?.body?.password,
            },
            {
                new: true,
            }
        );
        res.json(updatedUser);
    } catch (error) {
        throw new Error(error);
    }

});

//block a user
const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {

        const blockusr = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: true,
            },
            {
                new: true,
            });
        res.json(blockusr);
    } catch (error) {
        throw new Error(error);
    }
});

//unblock a user
const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {

        const unblockusr = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: false,
            },
            {
                new: true,
            });

        res.json({
            message: "User Unblock",
        });
    } catch (error) {
        throw new Error(error);
    }
});

// For change password 
const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongodbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    } else {
        res.json(user);
    }

});

// To create token of forget password and send via email
const ForgotPasswordToken = asyncHandler(async (req, res) => {

    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) throw new Error("User not found with this email");
    
    try {

        const token = await user.createPasswordResetToken();
        console.log(token);
        await user.save();
        const resetURL = `Hi, Please follow this link to reset your password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'> click here </a>`;

        const data = {
            to:email,
            text:"Hey User",
            subject:"Forget Password Link",
            html:resetURL,

        };

        SendEmail(data);
        res.json(token);
    } catch {

        throw new Error(error);
    }
});

// After sending the link via email with token, to update the password 
const resetPassword = asyncHandler(async(req,res)=>{
    const {password} = req.body;
    const {token} = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken:hashedToken,
        passwordResetExpires:{$gt: Date.now()},
    });

    if(!user) throw new Error("Token Expired, please try again later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
});


// **************************************************************************************************************************************
// get all Whishlist
const getWhishlist = asyncHandler(async(req, res)=>{
    const {_id} = req.user;
    
    try{
        const findUser = await User.findById(_id).populate("wishlist");
        res.json(findUser);

    }catch(error){
         throw new Error(error);
    }
});
// *****************************************************************************************************************************

// create new cart
const userCart =  asyncHandler(async(req, res)=>{
    const {cart}= req.body;
    const {_id} = req.user;
    validateMongodbId(_id);

    try{
        products = [];
        const user = await User.findById(_id);
        // check if user already have product in cart

        const alreadyExistCart = await Cart.findOne({
            orderby: user._id
        });
        if (alreadyExistCart){
            alreadyExistCart.remove();
        }

        for(let i =0; i < cart.length; i++){
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getprice = await Product.findById(cart[i]._id).select("price").exec();
            object.price = getprice.price;
            products.push(object);
        }

        let cartTotal = 0;
        for(let i=0; i < products.length; i++){
            cartTotal = cartTotal + products[i].price * products[i].count;
        }

        let newcart = await new Cart({
            products,
            cartTotal,
            orderby: user?._id,
        }).save();

        res.json(newcart);


    }catch(error){
        throw new Error(error);
    }

});

// get cart

const getUserCart = asyncHandler(async(req, res)=>{
    const {_id} = req.user;
    validateMongodbId(_id);
    try{
        const cart = await Cart.findOne({orderby:_id}).populate("products.product");
        res.json(cart);

    }catch(error){
        throw new Error(error);
    }
});

// Empty Cart funcationality
const emptyCart = asyncHandler(async(req, res)=>{
    const {_id} = req.user;
    validateMongodbId(_id);
    try{
        const user = await User.findOne({_id});
        const cart = await Cart.findOneAndRemove({orderby: user._id});
        res.json(cart);
    }catch(error){
        throw new Error(error);
    }
});


// apply Coupon

const applyCoupon = asyncHandler(async(req, res)=>{
    const {coupon} = req.body;
    const {_id} = req.user;
    validateMongodbId(_id);
    const validCoupon = await Coupon.findOne({name: coupon});
    if(validCoupon === null){
        throw new Error(error);
    }

    const user  = await User.findOne({_id});
    let {cartTotal} = await Cart.findOne({orderby: user._id}).populate("products.product");
    
    let totalAfterDiscount = (
        cartTotal - (cartTotal * validCoupon.discount)/100).toFixed(2);
        await Cart.findOneAndUpdate(
            {orderby: user._id},
            {totalAfterDiscount},
            {new: true}
        );
    
    res.json(totalAfterDiscount);
});


// *************************************************************************************************************

// *******************  Order functionality **************************

const createOrder = asyncHandler(async(req, res)=>{
    const {COD , CouponApplied} = req.body;
    const {_id} = req.user;
    validateMongodbId(_id);
    try{
        if(!COD) throw new Error("Create cash order failed");
        const user = await User.findById(_id);
        let userCart = await Cart.findOne({orderby: user._id});

        let finalAmount = 0;
        if(CouponApplied && userCart.totalAfterDiscount){
            finalAmount = userCart.totalAfterDiscount;
        }else{
            finalAmount = userCart.cartTotal;
        }

        let newOrder = await new Order({
            products: userCart.product,
            paymentIntent:{
                id: uniqid(),
                method: "COD",
                amount: finalAmount,
                status:"Cash on Delivery",
                created: Date.now(),
                currency: "USD",
            },
            orderby: user._id,
            orderStatus: "Cash on Delivery",
        }).save();
         
        
        
        let update = userCart.products.map((item)=> {
            return{
                updateOne:{
                    filter:{_id: item.product._id},
                    update:{$inc: {quantity: -item.count, sold: +item.count}},
                },
            };
        });

        

    const updated = await Product.bulkWrite(update, {});
    res.json({
        message:"Success"
    });
    
    }catch(error){
        throw new Error(error);
    }
});


// get All orders

const getOrders = asyncHandler(async(req, res)=>{
    const {_id} = req.user;
    validateMongodbId(_id);
    try{

         const userorders = await Order.findOne({orderby:_id}).populate("products.product").exec();
         res.json(userorders);
    }catch(error){
        throw new Error(error);
    }
});


// update orders
const updateOrderStatus = asyncHandler(async(req, res)=>{
    const {status} = req.body;
    const {_id} = req.user;
    const {id} = req.params;
    validateMongodbId(id);
    try{
        const updateOrderStatus = await Order.findByIdAndUpdate(
            id,
            {
                orderStatus: status,
                paymentIntent: {
                    status: status,
                },
            },
            {
                new: true
            }
        );

        res.json(updateOrderStatus);

    }catch (error){
        throw new Error(error);
    }
});



module.exports = {
    createUser,
    loginUserCtrl,
    loginAdminCtrl,       //*******************
    getalluser,
    getauser,
    deleteauser,
    updatedUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    ForgotPasswordToken,
    resetPassword,
    // **************************************************
    getWhishlist,         
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    updateOrderStatus,
    saveAddress       

};



