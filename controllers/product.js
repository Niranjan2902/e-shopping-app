// const Products = require('../models/product');
// //const { products } = require('../routes/admin');
// //const products=[];
// //exports.products=products;

// async function addProducts(req, res, next) {
//     //res.sendFile(path.join(rootDir, '.', 'views', 'index.html'));
//     await res.render('admin/addproduct', {
//         title: "Add-Product",
//         path: "/admin/details",
//         productCSS: true,
//         formCSS: true,
//         activeAddProduct: true,
//     })
// };

// async function getProducts(req, res, next) {
//     //console.log(req.body)
//     const Title = req.body.details
//     const description = req.body.description
//     const product = new Products(Title, description)
//     product.save();
//     // products.push({ Title: req.body.details, description: req.body.description })
//     console.log('received in middleware 2');
//     await res.redirect('/products')
// };

// async function listProducts(req, res, next) {
//     //console.log(AdminData.products);
//     Products.fetchAll(products =>
//         res.render('shop/index2', {
//             title: "Products-data",
//             prods: products,
//             path: "/products",
//             hasProductLength: products.length > 0,
//             activeShop: true,
//             activeCSS: true,
//         })
//     )
// };


// module.exports = {
//     addProducts,
//     getProducts,
//     listProducts
// }