//SINGLE CART TABLE DIFF CART FOR DIFF USER SO FOR THAT ONLY HERE IS ID AND NO OTHER
const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const OrderItem = sequelize.define('orderItem', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  quantity: Sequelize.INTEGER
});

module.exports = OrderItem;