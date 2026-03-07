//OLD ONE WHILE WORKING ONLY WITH MYSQL2

// const mysql=require('mysql2')

// const pool=mysql.createPool({
//     host:'localhost',
//     user:'root',
//     database:'eshop_app',
//     password:'Nir@sql731'
// })

// module.exports=pool.promise();


const Sequelize=require('sequelize');

const sequelize=new Sequelize(process.env.DB_NAME || 'eshop_app',
    'root',
    process.env.password,
    {
        dialect:'mysql',
        host:'localhost'
    });

module.exports=sequelize;