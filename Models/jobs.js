const { DataTypes } = require('sequelize');

var sequelize=require("../Database/database");

const  jobs= sequelize.define('jobs', {
    applicantId:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    userName:{type:DataTypes.STRING,allowNull:false,} ,
    qualification:{type:DataTypes.STRING,allowNull:false,} ,
    email:{type:DataTypes.STRING,allowNull:false,},
    cnic:{type:DataTypes.STRING,allowNull:false,},
    phoneNumber:{type:DataTypes.STRING,allowNull:false,},
    status:{type:DataTypes.ENUM('accepted', 'rejected', 'pending'),allowNull:false,} ,
    cv:{type: DataTypes.STRING,allowNull:false},
    age:{type:DataTypes.INTEGER,allowNull:false},
    isDelete:{type:DataTypes.BOOLEAN,allowNull:false},
  },{
    tableName:"jobs",
    timestamps:true,
});
  
  module.exports = jobs;