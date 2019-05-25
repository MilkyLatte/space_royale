module.exports = (sequelize, type) => {
    return sequelize.define('Google_User', {
        id: {
            type: type.STRING,
            primaryKey: true,
            unique: true,
            allowNull: false
        },
        username: {
            type: type.STRING,
            allowNull: false
        },
        email: {
            type: type.STRING,
        }
    }, {
        timestamps: false
    });
}