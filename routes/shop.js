const express=require('express');
const router=express.Router();
const path=require('path');
const isAuth=require('../middleware/is-auth')

const { getProducts, getCart, getCheckout, viewProductDetails,getIndex, 
    getOrders, getProduct, postCart, deleteCartProduct, postOrders,getInvoice,
getCheckoutSucess } = require('../controllers/shop');

router.get('/',getIndex)

router.get('/products',getProducts)

//router.get('/products/delete')

router.get('/products/:productId',viewProductDetails)

router.get('/cart',isAuth,getCart);

router.post('/cart',isAuth,postCart);

router.get('/checkout',isAuth,getCheckout);

router.get('/checkout/success',isAuth,getCheckoutSucess);
router.get('/checkout/cancel',isAuth,getCheckout);

router.post('/create-order',isAuth,postOrders);

router.get('/orders',isAuth,getOrders);

router.get('/orders/:orderId',isAuth,getInvoice);

router.post('/delete-cart-item',isAuth,deleteCartProduct);

module.exports=router;

// const express=require('express');
// const router=express.Router();
// const path=require('path')
// const AdminData=require('./admin')

// router.get('/products',(req,res,next)=>{
//     console.log(AdminData.products);
//     const products=AdminData.products
//     //res.sendFile(path.join(__dirname,'../','/views','index2.html'));
//     res.render('index2',{
//         title:"Products-data",
//         prods:products,
//         path:"/products",
//         hasProductLength:products.length>0,
//         activeShop:true,
//         activeCSS:true,
//     })
// })

// module.exports=router;