const Blog = require("../models/blogModel");
const user = require("../models/usermodel");
const asyncHandler = require("express-async-handler");
const validateMangoDbId = require("../utils/validateMangodbid");
const fs = require("fs");
const cloudinaryUploadImg = require("../utils/cloudinary");

//create Blog
const createBlog =  asyncHandler(async(req, res)=> {
    try{
        const newBlog = await Blog.create(req.body);
        res.json(newBlog);

    }catch(error){
        throw new Error(error);
    }
});


// update Blog
const updateBlog =  asyncHandler(async(req, res)=> {

    const {id} = req.params;
    validateMangoDbId(id);
    try{
        const changeBlog = await Blog.findByIdAndUpdate(id,req.body,
            {
                new:true,
            });
        res.json(changeBlog);

    }catch(error){
        throw new Error(error);
    }
});

/**
 * View Blogs
 * numbers of view blogs count
 * get a blog by "id"
 */
const getBlog = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    validateMangoDbId(id);
    try{
        const getBlog = await Blog.findById(id).populate("Likes").populate("dislikes"); //to see the details of likes and dislikes user "populate() is used"
        const updateViews = await Blog.findByIdAndUpdate(
            id,
            {
                $inc:{numViews:1},
            },
            {new:true}
        );
        res.json(getBlog);

    }catch(error){
        throw new Error(error);
    }

});

// get all blogs
const getblogs = asyncHandler(async(req,res)=>{
    try{
        const getblogs = await Blog.find();
        res.json(getblogs);

    }catch(error){
        throw new Error(error);
    }
})


//delete a blog
const deleteblog = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    validateMangoDbId(id);
    try{
        const deleteblog = await Blog.findByIdAndDelete(id);
        res.json(deleteblog);

    }catch(error){
        throw new Error(error);
    }
});

// likes functionality
const likeblog = asyncHandler(async(req,res)=>{
    const {blogId} = req.body;  //if request pass from the json format than req.body if request is passed from url than req.params
    validateMangoDbId(blogId);

    // find the blog which you want to be liked
    const blog = await Blog.findById(blogId);

    // find the login user
    const loginUserId = req?.user?._id;
    

    // find if the user has liked the blog
    const isliked = blog?.isliked;

    // find if the user has disliked the blog
    const alreadyDisliked =  blog?.dislikes?.find(
        (userId) => userId?.toString() === loginUserId?.toString()
    );

    if(alreadyDisliked){
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: {dislikes: loginUserId},
                isDisliked:false,
            },
            {new:true}
        );
        res.json(blog);
    }

    if(isliked){
        
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: {Likes: loginUserId},
                isliked: false,

            },
            {new:true}
        );
        res.json(blog);
    }
    else{
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: {Likes: loginUserId},
                isliked: true,
            },
            {new: true}
        );
        res.json(blog);
    }


});



//dislikes functionality

const dislikeblog = asyncHandler(async(req,res)=>{
    const {blogId} = req.body;  //if request pass from the json format than req.body if request is passed from url than req.params
    validateMangoDbId(blogId);

    // find the blog which you want to be liked
    const blog = await Blog.findById(blogId);

    // find the login user
    const loginUserId = req?.user?._id;
    

    // find if the user has liked the blog
    const isDisliked = blog?.isDisliked;

    // find if the user has disliked the blog
    const alreadyliked =  blog?.Likes?.find(
        (userId) => userId?.toString() === loginUserId?.toString()
    );

    if(alreadyliked){
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: {Likes: loginUserId},
                isliked:false,
            },
            {new:true}
        );
        res.json(blog);
    }

    if(isDisliked){
        
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: {dislikes: loginUserId},
                isDisliked: false,

            },
            {new:true}
        );
        res.json(blog);
    }
    else{
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: {dislikes: loginUserId},
                isDisliked: true,
            },
            {new: true}
        );
        res.json(blog);
    }


});

// upload blog images

const uploadImages = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongodbId(id);
    try{
        const uploader = (path)=> cloudinaryUploadImg(path, "images");
        const urls = [];
        const files = req.files;
        for(const file of files){
            const {path} = files;
            const newpath = await uploader(path);
            urls.push(newpath);
            fs.unlinkSync(path);
        }

        const findProduct = await Blog.findByIdAndUpdate(
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
    createBlog,
    updateBlog,
    getBlog,
    getblogs,
    deleteblog,
    likeblog,
    dislikeblog,
    uploadImages
};