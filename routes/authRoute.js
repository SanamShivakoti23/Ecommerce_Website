const express = require("express");
const {createUser,loginUserCtrl,getalluser,getauser,deleteauser,updatedUser,blockUser,unblockUser,logout,updatePassword,ForgotPasswordToken,resetPassword, loginAdminCtrl, getWhishlist, saveAddress, userCart, getUserCart, emptyCart, applyCoupon, createOrder, getOrders, updateOrderStatus} = require("../controller/userCtrl");
const {addtowhishlist} = require("../controller/productCtrl");
const router = express.Router();
const {authMiddleware,isAdmin} = require("../middlewares/authMiddleware");
const {handleRefreshToken} = require("../controller/userCtrl");
const cartModel = require("../models/cartModel");

/*
    we have to arrange all the router according to the method like "post",
    "get", "put", "delete"
*/
router.post("/register", createUser);
router.post("/forgot-password-token", ForgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.post("/admin-login", loginAdminCtrl);  //***Adim control login */
router.post("/login", loginUserCtrl);
router.post("/cart", authMiddleware, userCart); //**create user cart */
router.post("/cart/apply-coupon", authMiddleware, applyCoupon); //** for Apply Coupon */
router.post("/cart/create-order", authMiddleware, createOrder); //** for create order */

router.get("/get-order", authMiddleware, getOrders); //** get orders */
router.get("/cart", authMiddleware, getUserCart); //**get user cart */
router.get("/wishlist", authMiddleware, getWhishlist); //****get wishlist */
router.get("/all-users", getalluser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/:id",authMiddleware,isAdmin, getauser);  //middleware is used for checking the token as well as checking the role as admin
// for update the password route

router.put("/wishlist", authMiddleware, addtowhishlist); // add wishlist
router.put("/address/:id", authMiddleware , isAdmin,saveAddress); //**Save Address */
router.put("/password", authMiddleware, updatePassword);
router.put("/edit-user", authMiddleware, updatedUser); //middleware is used for chceking the token
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);

router.put("/update-order/:id", authMiddleware, isAdmin, updateOrderStatus); //** update orders  */
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);
router.delete("/empty-cart", authMiddleware, emptyCart); //**for empty cart */
router.delete("/:id", deleteauser);

module.exports = router;