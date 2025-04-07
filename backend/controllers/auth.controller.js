const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ValidationUtils = require("../utils/validation.utils");
const TokenUtils = require("../utils/token.utils");
const config = require('../config/config');
const UserModel = require('../models/user.model');

class AuthController {
    static async signUp(req, res) {
        try {
            const {error} = ValidationUtils.signupValidation(req.body);

            if (error) {
                return res.status(400).json({error: error.details[0].message});
            }

            let user = UserModel.findOne({email: req.body.email});
            if (user) {
                return res.status(400)
                    .json({error: true, message: "User with given email already exist"});
            }

            const salt = await bcrypt.genSalt(Number('example'));
            const hashPassword = await bcrypt.hash(req.body.password, salt);

            let id = 1;
            while (UserModel.findOne({id: id})) {
                id++;
            }

            user = {
                id: id,
                name: req.body.name,
                lastName: req.body.lastName,
                email: req.body.email,
                password: hashPassword,
                refreshToken: null
            };
            UserModel.create(user);

            res.status(201).json({
                user: {id: user.id, email: user.email, name: user.name, lastName: user.lastName},
                error: false,
                message: "Account created successfully"
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({error: true, message: "Internal Server Error"});
        }
    }

    static async login(req, res) {
        try {
            const {error} = ValidationUtils.loginValidation(req.body);

            if (error) {
                return res.status(400).json({error: error.details[0].message});
            }

            const user = UserModel.findOne({email: req.body.email});
            if (!user) {
                return res.status(401).json({error: true, message: "Invalid email or password"});
            }

            const verifiedPassword = await bcrypt.compare(
                req.body.password,
                user.password
            );
            if (!verifiedPassword) {
                return res.status(401).json({error: true, message: "Invalid email or password"});
            }

            const {accessToken, refreshToken} = await TokenUtils.generateTokens(user);

            res.status(200).json({
                error: false,
                accessToken,
                refreshToken,
                fullName: user.name + ' ' + user.lastName,
                userId: user.id,
                message: "Logged in successfully",
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({error: true, message: "Internal Server Error"});
        }
    }

    static async refresh(req, res) {
        const {error} = ValidationUtils.refreshTokenValidation(req.body);
        if (error) {
            return res.status(400).json({error: error.details[0].message});
        }

        try {
            const {tokenDetails} = await TokenUtils.verifyRefreshToken(req.body.refreshToken);
            const user = UserModel.findOne({email: tokenDetails.email});
            const {accessToken, refreshToken} = await TokenUtils.generateTokens(user);

            res.status(200).json({
                error: false,
                accessToken,
                refreshToken,
                message: "Tokens created successfully",
            });
        } catch (e) {
            return res.status(400).json(e);
        }
    }

    static async logout(req, res) {
        try {
            const {error} = ValidationUtils.refreshTokenValidation(req.body);
            if (error) {
                return res.status(400).json({error: error.details[0].message});
            }
            const user = UserModel.findOne({refreshToken: req.body.refreshToken});
            if (!user) {
                return res.status(200).json({error: false, message: "Logged Out Successfully"});
            }

            UserModel.clearToken(user.email);

            res.status(200).json({error: false, message: "Logged Out Successfully"});
        } catch (err) {
            console.log(err);
            res.status(500).json({error: true, message: "Internal Server Error"});
        }
    }

}

module.exports = AuthController;