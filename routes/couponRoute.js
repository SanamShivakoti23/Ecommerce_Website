const express = require("express");
const { createCoupon, getallcoupon, updatecoupon, deletecoupon } = require("../controller/couponCtrl");
const {authMiddleware, isAdmin} = require("../middlewares/authMiddleware")
const router = express.Router();

router.post("/", authMiddleware, isAdmin,createCoupon);
router.get("/", authMiddleware, isAdmin, getallcoupon); 
router.put("/:id", authMiddleware, isAdmin, updatecoupon);
router.delete("/:id", authMiddleware, isAdmin, deletecoupon);

module.exports = router;