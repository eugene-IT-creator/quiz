const jwt = require("jsonwebtoken");
const config = require('../config/config');
const UserModel = require('../models/user.model');

class TokenUtils {
    static async generateTokens(user) {
        try {
            const payload = {id: user.id, email: user.email};

            const accessToken = jwt.sign(
                payload,
                config.secret,
                {expiresIn: "1m"}
            );
            const refreshToken = jwt.sign(
                payload,
                config.secret,
                {expiresIn: "30d"}
            );

            if (user.refreshToken) {
                UserModel.clearToken(user.email);
            }

            UserModel.setToken(user.email, refreshToken);

            return Promise.resolve({accessToken, refreshToken});
        } catch (err) {
            return Promise.reject(err);
        }
    }

    static verifyRefreshToken(refreshToken) {
        return new Promise((resolve, reject) => {
            const user = UserModel.findOne({refreshToken: refreshToken});
            if (!user) {
                return reject({error: true, message: "Invalid refresh token"});
            }

            jwt.verify(refreshToken, config.secret, (err, tokenDetails) => {
                if (err)
                    return reject({error: true, message: "Invalid refresh token"});
                resolve({
                    tokenDetails,
                    error: false,
                    message: "Valid refresh token",
                });
            });
        });
    }
}

module.exports = TokenUtils;