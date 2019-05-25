const Sequelize = require('sequelize');
const UserModel = require('../client/src/components/models/googleUsers');

const sequelizeSqlite = new Sequelize('database', 'username', 'password',{
    dialect: 'sqlite',
    storage: './Database/game_database'
});

const UserSqlite = UserModel(sequelizeSqlite, Sequelize);

sequelizeSqlite.sync().then(() => {
    console.log('Users db and user table have been created with sqlite')
});

module.exports = UserSqlite;