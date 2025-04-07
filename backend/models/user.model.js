const TAFFY = require('taffy');
const users = TAFFY(require('../data/users.json'));

class UserModel {
    static findOne(params) {
        return users(params).first();
    }

    static create(data) {
        return users.insert(data);
    }

    static clearToken(email) {
        return users({email: email}).update({refreshToken: null});
    }

    static setToken(email, token) {
        return users({email: email}).update({refreshToken: token});
    }
}

module.exports = UserModel;