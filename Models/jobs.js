const { DataTypes } = require('sequelize');

var sequelize=require("../Database/database");

const  jobs= sequelize.define('jobs', {
    applicantId:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    userName:{type:DataTypes.STRING,allowNull:false,} ,
    qualification:{type:DataTypes.STRING,allowNull:false,} ,
    email:{type:DataTypes.STRING,allowNull:false,},
    cnic:{type:DataTypes.STRING,allowNull:false,},
    phoneNumber:{type:DataTypes.STRING,allowNull:false,},
    address:{type:DataTypes.STRING},
    status:{type:DataTypes.ENUM('accepted', 'rejected', 'pending'),allowNull:false,defaultValue:'pending'} ,
    cv:{type: DataTypes.STRING,allowNull:false},
    age:{type:DataTypes.INTEGER,allowNull:false},
    isDelete:{type:DataTypes.BOOLEAN,allowNull:false,defaultValue:false},
  },{
    tableName:"jobs",
    timestamps:true,
});
  
  module.exports = jobs;