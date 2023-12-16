const { Sequelize } = require( 'sequelize' );

const sequelize = new Sequelize('JobsDataBase', 'root', '', {
  host: 'localhost',
  dialect: 'mysql', 
})

module.exports = sequelize;
