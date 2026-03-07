const express = require('express');
//const path = require('path');
const router = express.Router();
const isAuth=require('../middleware/is-auth')
const expValidator=require('express-validator')
const {check,body}=require('express-validator')
//SINGLE SOURCE GET DIRECTORY
//const rootDir = require("../utils/path");

const { addProducts, postProducts,getProducts,postEditProduct,editProducts,deleteProduct,deleteProductJSON } = require('../controllers/admin');
// /admin/add-product => GET
router.get('/details',isAuth,addProducts);

// /admin/add-product => POST
router.post('/details', [
        body('title').isAlphanumeric().isLength({min:3,max:120}).trim(),
        //body('imageUrl').isURL().withMessage('Enter a valid image Url'),
        check('description').isLength({min:10})
    ],postProducts);

// /admin/get all products => GET
router.get('/products',isAuth,getProducts);

//DELETE
router.post('/delete-product',deleteProduct)

//DELETE PRODUCT USING CLIENT SIDE JSON DATA
router.delete('/product/:productId',isAuth,deleteProductJSON)

router.get('/editproduct/:productId',isAuth,editProducts)

router.post('/editproduct',
    [
        body('title').isAlphanumeric().isLength({min:3,max:120}).trim(),
        //body('imageUrl').isURL().withMessage('Enter a valid image Url'),
        check('description').isLength({min:15})
    ],postEditProduct)
module.exports = router

// const express = require('express');
// const path = require('path');
// const router = express.Router();

// //SINGLE SOURCE GET DIRECTORY
// const rootDir = require("../utils/path")

// //FOR TEMP STORAGE
// const products=[];

// router.get('/details', (req, res, next) => {
//     //res.sendFile(path.join(rootDir, '.', 'views', 'index.html'));
//     res.render('index',{
//         title:"Add-Product",
//         path:"/admin/details",
//         productCSS:true,
//         formCSS:true,
//         activeAddProduct:true,
//     })
// });

// router.post('/details', (req, res, next) => {
//     console.log(req.body)
//     products.push({Title:req.body.details,description:req.body.description})
//     console.log('received in middleware 2');
//     res.redirect('/products')
// });

// exports.routes = router
// exports.products=products