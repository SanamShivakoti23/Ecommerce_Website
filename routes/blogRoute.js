const express = require("express");
const {createBlog,updateBlog,getBlog,getblogs,deleteblog,likeblog,dislikeblog, uploadImages} = require("../controller/blogCtrl");
const {authMiddleware,isAdmin} = require("../middlewares/authMiddleware");
const { uploadPhoto, blogImgResize } = require("../middlewares/uploadImages");
const router  = express.Router();


router.post('/',authMiddleware,isAdmin,createBlog);
router.put("/upload/:id", authMiddleware, isAdmin,
        uploadPhoto.array("images", 2),
        blogImgResize,
        uploadImages
);
router.put('/likes',authMiddleware,likeblog);
router.put('/dislikes',authMiddleware,dislikeblog);
router.put('/update-blog/:id',authMiddleware,isAdmin,updateBlog);

router.get('/get-blog/:id', getBlog);
router.get('/blogs', getblogs);
router.delete('/delete-blog/:id',authMiddleware,isAdmin,deleteblog);

module.exports = router;