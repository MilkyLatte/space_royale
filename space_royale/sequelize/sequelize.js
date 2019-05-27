// Followed tutorial from https://itnext.io/implementing-json-web-tokens-passport-js-in-a-javascript-application-with-react-b86b1f313436

const Sequelize = require('sequelize');
const UserModel = require('../client/src/components/models/users');

const sequelizeSqlite = new Sequelize('database', 'username', 'password',{
    dialect: 'sqlite',
    storage: './Database/game_database'
});

const UserSqlite = UserModel(sequelizeSqlite, Sequelize);

sequelizeSqlite.sync().then(() => {
    console.log('Users db and user table have been created with sqlite')
});

module.exports = UserSqlite;