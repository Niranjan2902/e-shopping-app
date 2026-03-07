/** @type {import('sequelize').ModelStatic<any>} */
// 👆 This comment is ONLY for editor auto-suggestions (IntelliSense).
// 👆 It is NOT required by Sequelize and has ZERO effect at runtime.
const Product = require('../models/product');
const { validationResult } = require('express-validator');
//const { products } = require('../routes/admin');
const path=require('path')

const DeleteFile=require('../utils/file')

async function addProducts(req, res, next) {
    if(!req.session.isLoggedIn){
        return res.redirect('/login')
    }
    await res.render('admin/edit-product', {
        title: "Add-Product",
        path: "/admin/details",
        editing: false,
        productCSS: true,
        formCSS: true,
        activeAddProduct: true,
        isAuthenticated:req.session.isLoggedIn,
        errMessege: req.flash('error'),
        oldInput: { Title: '', imageUrl: '',price:'',description:''},
        ValidationErrors: []
    })
};

async function postProducts(req, res, next) {
    const [Title, imageUrl1, price, description] = [req.body.title, 
        //req.body.imageUrl,
        req.file, req.body.price, req.body.description]
    //const Title = req.body.details
    //const description = req.body.description

     const errors = validationResult(req)
            if (!imageUrl1) {
                 console.log(errors.array())
            return res.status(422).render('admin/edit-product', {
                path: '/admin/products',
                title: 'Add product',
                editing: false,
                activeAddProduct: true,
                isAuthenticated:req.session.isLoggedIn,
                errMessege:"INVALID FILE FORMAT",
                oldInput: {
                    Title: Title,
                    price:price,
                    description:description
                },
                ValidationErrors: errors.array()
            });
        };
    //const errors = validationResult(req)
        //KEEPING USER INPUT
        if (!errors.isEmpty()) {
            console.log(errors.array())
            return res.status(422).render('admin/edit-product', {
                path: '/admin/products',
                title: 'Add product',
                editing: false,
                activeAddProduct: true,
                isAuthenticated:req.session.isLoggedIn,
                errMessege: errors.array()[0].msg,
                oldInput: {
                    Title: Title,
                    // imageUrl: imageUrl,
                    price:price,
                    description:description
                },
                ValidationErrors: errors.array()
            })
        };

        const imageUrl=imageUrl1.path
    req.user.createProduct({
        //id:4,  UNCOMMENT IF YOU WANT TO TEST FOR INTERNAL SERVER ERR
        Title:Title,
        imageUrl:imageUrl,
        price:price,
        description:description,
        userId:req.user.id
        //.then(result=>res.redirect('/products')) //product should be here as nested then but temp commented
    })
    // Product.create({             //WE CAN ALSO ADD AS ABOVE AUTO CREATED FUNCTION LIKE CREATEPRODUCT
    //     Title:Title,
    //     imageUrl:imageUrl,
    //     price:price,
    // })
    .then(result=>{
        console.log(imageUrl)
        res.redirect('/products')
    })
    .catch(err=>{console.log("GOT ERR AT PRODUCTS!!!")
        //ERROR HANDLING USING RENDER 500 PAGE
        return res.status(500).redirect('/500')
    }) 
};


async function getProducts(req, res, next) {
   req.user.getProducts()
  .then(products => {
    res.render('admin/productlist', {
     title: "Admin Products",
      prods: products,
      path: "/products",
          isAuthenticated:req.session.isLoggedIn
      // hasProductLength: products.length > 0,
    });
  })
 .catch(err=>{console.log("GOT ERR AT PRODUCTS!!!")
            //ERROR HANDLING USING RENDER 500 PAGE
            return res.status(500).redirect('/500')
        }) ;
};

async function editProducts(req, res, next) {
    const editMode = req.query.edit;
    if(!editMode){
        return res.redirect("/admin/products")
    }
        const ProdId = req.params.productId;
        //req.user.getProducts({where:{id:ProdId}}) //CAN ALSO TRY RATHER Product.findByPk(ProdId)
        Product.findByPk(ProdId).then( product => {
            res.render('admin/edit-product', {
                title: "Edit Product",
                btnType: "Edit",
                path: "/admin/Product",
                editing: editMode,
                product:product,

                //CHANGE BELOW CODE AFTER SOME TIME
                 errMessege: req.flash('error'),
        oldInput: { Title: '', imageUrl: '',price:'',description:''},
        ValidationErrors: []
            });
        }).catch(err=>{console.log(err)})
};

async function postEditProduct(req, res, next) {
    const [ProdId,updatedTitle, updatedUrl1, updatedPrice, updatedDesc] = [req.body.productId,req.body.title, req.file, req.body.price, req.body.description]
    Product.findByPk(ProdId).then(product=>{
        //throw Error("DUMMY TEST ERR")
        product.Title=updatedTitle;
        if (updatedUrl1) {
            DeleteFile(product.imageUrl)
            product.imageUrl=updatedUrl1.path;
        }
        product.price=updatedPrice;
        product.description=updatedDesc;
        return product.save()
         .then(res.redirect('/products'))
    })
    .catch(err=>{console.log("Error occured here:",err)
            const error=new Error(err);
            return next(error);
        }) //TO TEST THIS ERR UNCOMMENT DUMMY TEST ERR
};

async function deleteProduct(req,res,next) {
     const ProdId = req.body.productId;
     //Product.findByPk(ProdId).then(product=>product.destroy())       //Another way to execute below code
    Product.findByPk(ProdId).then(product=>{
            if(!product){
                return next(new Error("PRODUCT NOT FOUND"))
            }
            DeleteFile(product.imageUrl)
            return Product.destroy({where:{id:ProdId}});
        }
    )
    .then(()=>{
    console.log("Product Delete Successfully!")
    res.redirect('/products')
}).catch(err=>console.log(err));
}

//FOR ASYNC REQ USING JSON
async function deleteProductJSON(req,res,next) {
     const ProdId = req.params.productId;
     //Product.findByPk(ProdId).then(product=>product.destroy())       //Another way to execute below code
    Product.findByPk(ProdId).then(product=>{
            if(!product){
                return next(new Error("PRODUCT NOT FOUND"))
            }
            DeleteFile(product.imageUrl)
            return Product.destroy({where:{id:ProdId}});
        }
    )
    .then(()=>{
    console.log("Product Delete Successfully!")
    res.status(200).json({message:"Success"})
}).catch(err=>
    res.status(500).json({message:"Failed to Delete the product"})
);
};

module.exports = {
    addProducts,
    postProducts,
    getProducts,
    editProducts,
    postEditProduct,
    deleteProduct,
    deleteProductJSON
}