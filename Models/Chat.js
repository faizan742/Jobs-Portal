const { DataTypes } = require('sequelize');

var sequelize=require("../Database/database");

const  chatData= sequelize.define('chatData', {
    Id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    user:{type:DataTypes.STRING,allowNull:false,} ,
    message:{type:DataTypes.STRING,allowNull:false,} ,
      },{
    tableName:"chatData",
    timestamps:true,
});
  
  module.exports = chatData;