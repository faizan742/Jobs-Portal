const { DataTypes } = require('sequelize');

var sequelize=require("../Database/database");

const  users= sequelize.define('users', {
    userId:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    firstName:{type:DataTypes.STRING,allowNull:false} ,
    lastName:{type:DataTypes.STRING,allowNull:false} ,
    email:{type:DataTypes.STRING,unique:true},
    password:{type:DataTypes.STRING,allowNull:true},
    rememberToken:{type:DataTypes.STRING,allowNull:true},
    isAdmin:{type:DataTypes.BOOLEAN,defaultValue:false,allowNull:false} ,
    isVerified:{type: DataTypes.BOOLEAN,defaultValue:false,allowNull:false,},
    emailTime:{type:DataTypes.STRING}
  },{
    tableName:"users",
    timestamps:true,
});
  

  module.exports = users;