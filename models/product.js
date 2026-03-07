
// // const fs = require('fs')
// // const fpath = require('../utils/path')
// // const Cart = require('./cart')

// module.exports = class Products {
//     constructor(id, t, img, p, d) {
//         this.id = id;
//         this.Title = t;
//         this.imageUrl = img;
//         this.price = p;
//         this.description = d
//     }
//     save() {
//         return db.execute(`INSERT INTO products(Title,imageUrl,price,description)
//             values(?,?,?,?)`,[this.Title,this.imageUrl,this.price,this.description])
//     };

//     static deleteById(id) {
//         return db.execute('DELETE from products WHERE id=?',[id])
//     };

//     static fetchAll(cb) {
//         return db.execute('select * from products')
//     };
//     static findById(id) {
//         return db.execute('SELECT * from products WHERE id=?',[id])
//     }
// }

// /**
//  * @typedef {import('sequelize').Sequelize} Sequelize
//  * @typedef {import('sequelize').Model} Model
//  */

const Sequelize=require('sequelize')
const sequelize =require('../utils/database')

const Product=sequelize.define('product',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    Title: Sequelize.STRING,
    price:{
        type:Sequelize.DOUBLE,
        allowNull:false,
    },
    imageUrl:{
        type:Sequelize.STRING,
        allowNull:false,
    },
    description:{
        type:Sequelize.STRING,
        allowNull:false
    }
});
module.exports=Product;