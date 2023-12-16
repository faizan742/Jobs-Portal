const { DataTypes } = require('sequelize');

var sequelize=require("../Database/database");

const Log = sequelize.define('logs', {
    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    method:{type:DataTypes.STRING} ,
    status:{type:DataTypes.BIGINT} ,
    userName:{type:DataTypes.STRING},
    email:{type:DataTypes.STRING},
    path:{type:DataTypes.STRING} ,
    userAgent:{type:DataTypes.STRING} 
  },{
    tableName:"logs",
    timestamps:true,
});
  
  module.exports = Log;