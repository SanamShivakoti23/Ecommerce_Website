const express = require('express');
const {createCategory, updateCategory, deleteCategory, getacategory, getallcategory} = require('../controller/blogcategoryCtrl')
const {authMiddleware,isAdmin} = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, isAdmin,createCategory);
router.put('/:id', authMiddleware, isAdmin, updateCategory);
router.delete('/:id', authMiddleware, isAdmin, deleteCategory);
router.get('/:id', getacategory);
router.get('/', getallcategory);
module.exports = router;

