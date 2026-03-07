//SINGLE CART TABLE DIFF CART FOR DIFF USER SO FOR THAT ONLY HERE IS ID AND NO OTHER
const Sequelize = require('sequelize')
const sequelize = require('../utils/database');

const Cart = sequelize.define('cart', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  }
});

module.exports = Cart;