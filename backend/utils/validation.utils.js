// Проверка данных, которые приходят в запросах
const Joi = require("@hapi/joi");

class ValidationUtils {
    static signupValidation (data)  {
        const schema = Joi.object({
            name: Joi.string().min(3).required(),
            lastName: Joi.string().min(3).required(),
            email: Joi.string().min(6).required().email(),
            password: Joi.string().min(6).required(),
        });
        return schema.validate(data);
    }

    static loginValidation (data) {
        const schema = Joi.object({
            email: Joi.string().min(6).required().email(),
            password: Joi.string().min(6).required(),
        });
        return schema.validate(data);
    }

    static refreshTokenValidation (data) {
        const schema = Joi.object({
            refreshToken: Joi.string().required().label("Refresh Token"),
        });
        return schema.validate(data);
    }
}

module.exports = ValidationUtils;