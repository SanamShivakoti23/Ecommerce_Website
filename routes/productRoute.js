const express = require("express");
const {createProduct, getaproduct, getallproduct, updateaproduct, deleteaproduct, addtowhishlist, rating, uploadImages} = require("../controller/productCtrl");
const {isAdmin, authMiddleware} = require("../middlewares/authMiddleware");
const { uploadPhoto, productImageResize } = require("../middlewares/uploadImages");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProduct);

router.get("/all-products", getallproduct);
router.get("/:id", authMiddleware, isAdmin, getaproduct);

router.put("/wishlist", authMiddleware, addtowhishlist);
router.put("/rating", authMiddleware, rating);
router.put("/:id", authMiddleware, isAdmin, updateaproduct);
router.put("/upload/:id",authMiddleware, isAdmin,
     uploadPhoto.array("images", 10),
     productImageResize,
     uploadImages
);

router.delete("/:id", authMiddleware, isAdmin, deleteaproduct);
module.exports = router;