/** @type {import('sequelize').ModelStatic<any>} */
// 👆 This comment is ONLY for editor auto-suggestions (IntelliSense).
// 👆 It is NOT required by Sequelize and has ZERO effect at runtime.
const Product = require('../models/product');
const Razorpay = require('razorpay');

const Cart = require('../models/cart');
const express = require('express');
const CartItem = require('../models/cart-items');
const Order=require('../models/order')
const fs=require('fs');
require('dotenv').config();
const path=require('path');

const ITEMS_PER_PAGE=1;

async function getIndex(req, res, next) {
  const page= +req.query.page || 1;
  
  ////BELOW ONE CAN BE USED FOR CROUSEL <> WERE NEED ONLY NEXT 1 item
  //Product.findAll({ offset: page-1, limit: ITEMS_PER_PAGE })
    let totalItems;
    Product.count().then(numProducts=>{
      totalItems=numProducts
      return  Product.findAll({
         offset: (page-1)*ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE 
        })
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        title: 'Shop',
        path: '/',
        isAuthenticated: req.session.isLoggedIn,
        //totalProducts:totalItems,
        currentPage:page,
        hasNextPage:ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage:page > 1,
        nextPage:page + 1,
        PreviousPage:page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch(err => console.log(err));
};


// async function getIndex(req, res, next) {
//   Product.findAll()
//     .then(products => {
//       res.render('shop/index', {
//         prods: products,
//         title: 'Shop',
//         path: '/',
//         isAuthenticated: req.session.isLoggedIn
//       });
//     })
//     .catch(err => console.log(err));
// };

async function getProducts(req, res, next) {
  Product.findAll()
    .then(products => {
      res.render('shop/productlist', {
        title: "All Products",
        prods: products,
        path: "/products",
        isAuthenticated: req.session.isLoggedIn
        // hasProductLength: products.length > 0,
      });
    })
    .catch(err => console.log(err));
};

function viewProductDetails(req, res, next) {
  const ProdId = req.params.productId;
  //  Product.findAll({where:{id:ProdId}})      //HERE COMMENTED CODE IS ANOTHER WAY TO RUN THE SAME CODE for Output
  Product.findByPk(ProdId).then(product =>
    res.render('shop/product-details', {
      path: '/products',
      title: 'product details',
      product: product,
      //product: product[0],
    })
  ).catch(err => console.log(err))
};

// async function getCart(req, res, next) {
//   res.render('shop/cart', {
//     path: '/cart',
//     title: 'Your Cart'
//   });
// };

// async function postCart(req, res, next) {
//   const ProdId=req.body.productId
//   console.log(ProdId)
//   Products.findById(ProdId,product =>
//     res.render('shop/cart', {
//       path: '/products',
//       title: 'product details',
//       product: product,
//     }),
//   // res.render('shop/cart', {
//   //   path: '/cart/',
//   //   title: 'Your Cart'
//   // })
// )};

//CARD GET POST

function getCart(req, res, next) {
  req.user.getCart()
    .then(cart => {
      return cart
        .getProducts()
        .then(products => {
          res.render('shop/cart', {
            path: '/cart',
            title: 'Your Cart',
            products: products,
            isAuthenticated: req.session.isLoggedIn,
            //csrfToken: req.csrfToken(), 
          });
        }).catch(err => console.log(err));
    }).catch(err => console.log(err))
};

// function postCart(req, res, next) {
//     const prodId = req.body.productId; // Get the product ID from the request
//     let fetchedCart; // To store the fetched cart
//     let newQuantity = 1; // Default quantity to be added (1)

//     // Get the user's cart
//     req.user.getCart()
//         .then(cart => {
//             fetchedCart = cart; // Store the cart in fetchedCart
//             return cart.getProducts({ where: { id: prodId } }); // Check if the product already exists in the cart
//         })
//         .then(products => {
//             let product;
//             if (products.length > 0) {
//                 product = products[0]; // Product exists in cart
//             }

//             // If the product exists in the cart, update the quantity
//             if (product) {
//                 const oldQuantity = product.cartItem.quantity;
//                 newQuantity = oldQuantity + 1; // Increment the quantity by 1
//                 return product;
//             }

//             // If the product doesn't exist in the cart, fetch it from the database
//             return Product.findByPk(prodId);
//         })
//         .then(product => {
//             if (!product) {
//                 return res.redirect('/cart'); // If the product doesn't exist, redirect to cart page
//             }

//             // Add the product to the cart or update the quantity if the product already exists in the cart
//             return fetchedCart.addProduct(product, {
//                 through: { quantity: newQuantity } // Add product or update quantity
//             });
//         })
//         .then(() => {
//             res.redirect('/cart'); // Redirect to cart after successful addition/update
//         })
//         .catch(err => {
//             console.log(err);
//             res.redirect('/cart'); // Redirect to cart on error
//         });
// }

function postCart(req, res, next) {
  const prodId = req.body.productId;
  let fetchCart; //Making available throughout all then block as global declare
  let newQuantity = 1; //Making available throughout all then block as global declare
  req.user.getCart()
    .then(cart => {
      fetchCart = cart;
      return cart.getProducts({ where: { id: prodId} });
    })
    .then(products => {
      let product;
      //FINDS PRODUCT ALREASY EXIST OR NOT below and If exict
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      //ELSE HERE BELOW IF NOT EXIST CREATE NEW AND ADD QTY AS 1
      return Product.findByPk(prodId);
    })
    .then(product => {
      return fetchCart.addProduct(product, {
        through: { quantity: newQuantity }
      });
    })
    // .then(()=>{
    //   return fetchCart.getProducts();
    // })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err))
};

// Cart.getCart(cart => {
//   Product.findAll(products => {
//     const cartProducts = cart.products.map(cartItem => {
//       const product = products.find(p => p.id.toString() === cartItem.id.toString());
//        if (!product) return; // skip missing products
//       return {
//         id: product.id,
//           title: product.Title || product.title,
//           price: parseFloat(product.price),
//           imageUrl: product.imageUrl,
//           qty: cartItem.qty
//       };
//     }) //.filter(Boolean); // 🔥 removes undefined + null TEMP FIX THAT DONE BY GPT LATER FOCUS ON THIS NOW WE FIX IN CART MODEL SO NO NEED
//     res.render('shop/cart', {
//       title: 'Your Cart',
//       cart: cartProducts,
//       totalPrice: cart.totalPrice.toFixed(2)
//     });
//   });
// });

function deleteCartProduct(req, res, next) {
  const ProdId = req.body.productId;
  req.user.getCart().then(cart => {
    return cart.getProducts({ where: { id: ProdId } });
  })
    .then(products => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(res.redirect('/cart'))
    .catch(err => console.log(err))
};

function postOrders(req, res, next) {
  let fetchCart;
  req.user
    .getCart()
    .then(cart => {
      fetchCart = cart;
      return cart.getProducts();
    })
    .then(
      products => {
        return req.user
          .createOrder()
          .then(order => {
            return order.addProducts(products.map(product => {
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
            );
          }).catch(err => console.log(err))
      }).then(result => {
        return fetchCart.setProducts(null);
      }).then(res.redirect('/checkout'))
    .catch(err => console.log(err));
};


//FOR INVOICE ORDERS
const PDFDoucment=require('pdfkit');

async function getInvoice(req, res, next) {
  const orderId=req.params.orderId
  Order.findByPk(orderId,{include:['products']}).then(order=>{
    if(!order){
      return next(new Error("No order founder."))
    }
    if(order.userId!==req.session.user.id){
      return next(new Error("Unauthorized"))
    }
  const invoiceName='invoice-'+orderId+'.pdf';
  const invoicePath=path.join('data','invoices',invoiceName);

  //PRELOADING DATA MEANS READ ALL FILE FIRST THEN PASS

  // fs.readFile(invoicePath,(err,data)=>{
  //   if(err){
  //     return next(err);
  //   }
  //   res.setHeader('Content-Type', 'application/pdf');
  //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"'); 
  //   //INSTEAD OF INLINE USE ATTACHMENT IF WANT TO DOWNLOAD PDF INSTEAD in above
  //   res.send(data)
  // })

  ////CREATING PDF DOC BY DATA
  const PdfDoc=new PDFDoucment()
  const {products}=order
  let totalPrice=0
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
  PdfDoc.pipe(fs.createWriteStream(invoicePath))
  PdfDoc.pipe(res)

  // Generate today's date dynamically
const currentDate = new Date();
const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;  // Format: dd/mm/yyyy

// Company name and address (customize as needed)
const companyName = 'EzyShop Inc.';
const companyAddress = '123 E-Shop Lane, City, Country';

// Set up the header with company info
PdfDoc
  .fontSize(16)
  .text(companyName, { align: 'left', continued:true })
    .text(`Date: ${formattedDate}`, { align: 'right' })
  .fontSize(10)
  .text(companyAddress, { align: 'left' })
  .moveDown(2);

// Add title and invoice date
PdfDoc
  .fontSize(26)
  .text('Invoice', { underline: true, align: 'center' })
  .fontSize(12)

// Add a line separator
PdfDoc.text('==============================', { align: 'center' }).moveDown(1);

// Add product details
products.forEach((prod) => {
  totalPrice += prod.orderItem.quantity * prod.price;
  PdfDoc
    .fontSize(14)
    .text(`${prod.Title} - ${prod.orderItem.quantity}x $${prod.price.toFixed(2)}`, { align: 'center' })
    .moveDown(0.5);
});

// Add a line separator for total
PdfDoc.text("------------------------------------------", { align: 'center' }).moveDown(1);

// Add the total price
PdfDoc
  .fontSize(14)
  .text(`Total Price: $${totalPrice.toFixed(2)}`, { align: 'center' })
  .moveDown(2);

// Footer (Optional)
PdfDoc
  .fontSize(10)
  .text('Thank you for shopping with us!', { align: 'center' })
  .moveDown(1)
  .text('For support, contact: support@ezyshop.com', { align: 'center' });

// End the document
PdfDoc.end();

console.log('Invoice PDF has been created successfully.');

  //STREAMING DATA ONE BY ONE IN CHUNKS TO RESPONSE (RES) BROWSER FILE (ON THE FLY)

  // const file=fs.createReadStream(invoicePath)
  //   res.setHeader('Content-Type', 'application/pdf');
  //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
  // file.pipe(res)
  })
  .catch(err=>{
    next(err)
  })
};

const razorpay = new Razorpay({
  key_id:  process.env.RAZOR_PAY_TEST_ID, // Replace with your Razorpay key
  key_secret: process.env.RAZOR_PAY_TEST_KEY_SECRET  // Replace with your Razorpay secret key
});

async function getCheckout  (req, res, next)  {
  let products;
  let totalAmount = 0;

  req.user.getCart()
    .then(cart => {
      return cart.getProducts();
    })
    .then(products => {
      totalAmount = products.reduce((total, product) => total + product.cartItem.quantity * product.price, 0);  // Calculate total amount in paise

      // Create Razorpay order
      const options = {
        amount: totalAmount * 100, // Amount in paise (Razorpay accepts amount in paise)
        currency: 'INR',
        receipt: 'receipt#' + Date.now(),
      };

      razorpay.orders.create(options, (err, order) => {
        if (err) {
          console.log("Error creating Razorpay order:", err);
          return res.status(500).json({ message: "Failed to create order" });
        }

        // Send Razorpay order ID and other details to the frontend
        res.render('shop/checkout', {
          path: '/cart/checkout',
          title: 'Checkout',
          //csrfToken: req.csrfToken(),
          isAuthenticated: req.session.isLoggedIn,
          products: products,
          totalSum: totalAmount,
          sessionId: order.id  // Send Razorpay order ID to the frontend
        });
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

async function getCheckoutSucess  (req, res, next)  {
  let fetchCart;
  
  req.user.getCart()
    .then(cart => {
      fetchCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      // Create an order object and add products to it
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products.map(i => {
          return { quantity: i.cartItem.quantity, product: { ...i.productId._doc } };
        })
      });

      return order.save();
    })
    .then(result => {
      return fetchCart.setProducts(null);
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

async function getOrders(req, res, next) {
  req.user.getOrders({ include: ['products'] })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        title: 'Your Orders',
        orders: orders,
        isAuthenticated: req.session.isLoggedIn
      });
    }).catch(err => console.log(err));
};


// async function getOrders  (req, res, next)  {
//   Order.find({ 'user.userId': req.user._id })
//     .then(orders => {
//       res.render('shop/orders', {
//         path: '/orders',
//         pageTitle: 'Your Orders',
//         orders: orders,
//         isAuthenticated: req.session.isLoggedIn
//       });
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

// async function getCheckout(req, res, next) {
//   res.render('shop/checkout', {
//     path: '/cart/checkout',
//     title: 'Checkout',
//     isAuthenticated: req.session.isLoggedIn
//   });
// };

module.exports = {
  getCart,
  postCart,
  getCheckout,
  viewProductDetails,
  getProducts,
  getIndex,
  getOrders,
  deleteCartProduct,
  postOrders,
  //getProduct
  getInvoice,
  getCheckoutSucess
}