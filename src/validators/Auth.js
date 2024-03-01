import Joi from 'joi';
import { RESPONSE_CODES } from "../config/constants.js";

export const email_required_schema = (req, res, next) => {
    const schema = Joi.object().keys({
        email: Joi.string().required().email().messages({
            "string.email": `Invalid email`,
            "any.required": `Email required`
        })
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
            status: 0,
            statusCode: RESPONSE_CODES.BAD_REQUEST,
            message: error.details[0].message
        })
    }
    next();
};

export const phone_required_schema = (req, res, next) => {
    const schema = Joi.object().keys({
        country_code: Joi.string().required().messages({
            "any.required": `Country code is required`
        }),
        phone: Joi.string().required().min(10).max(15).messages({
            "string.min": `Phone should have a minimum length of 10`,
            "string.max": `Phone should have a maximum length of 15`,
            "any.required": `Phone is required`
        })
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
            status: 0,
            statusCode: RESPONSE_CODES.BAD_REQUEST,
            message: error.details[0].message
        })
    }
    next();
};

export const sign_up_user_schema = (req, res, next) => {
    const schema = Joi.object().keys({

        signup_type: Joi.number().optional().valid(0, 1, 2, 3, 4).messages({
            "string.base": `Signup type should be a type of number`
        }),
        social_id: Joi.when('signup_type', {
            is: Joi.array().items(Joi.number().valid(1, 2, 3, 4)).single(),
            then: Joi.string().required(),
            otherwise: Joi.forbidden()
        }),

        first_name: Joi.string().required().messages({
            "string.base": `First name should be a type of string`,
            "any.required": `First name required`
        }),
        last_name: Joi.string().required().messages({
            "string.base": `Last name should be a type of string`,
            "any.required": `Last name required`
        }),
        email: Joi.string().required().email().messages({
            "string.email": `Invalid email`,
            "string.unique": `Email already exists with us`,
            "any.required": `Email required`
        }),
        password: Joi.when('signup_type', {
            is: 0,
            then: Joi.string().required().min(10).messages({
                "string.min": `Password should have a minimum length of 10`
            }),
            otherwise: Joi.optional()
        }),
        country_code: Joi.string().required().messages({
            "any.required": `Country code is required`
        }),
        phone: Joi.string().required().min(10).max(15).messages({
            "string.min": `Phone should have a minimum length of 10`,
            "string.max": `Phone should have a maximum length of 15`,
            "any.required": `Phone is required`
        }),
        role: Joi.string().required(),

    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
            status: 0,
            statusCode: RESPONSE_CODES.BAD_REQUEST,
            message: error.details[0].message
        })
    }
    next();
};

export const social_verification_schema = (req, res, next) => {
    const schema = Joi.object().keys({
        signup_type: Joi.number().optional().valid(1, 2, 3, 4).messages({
            "string.base": `Signup type should be a type of number`
        }),
        social_id: Joi.string().required().messages({
            "string.base": `Social id should be a type of string`,
            "any.required": `Social id is required`
        }),
        device_token: Joi.string().required(),
        device_type: Joi.number().optional().valid(1, 2).messages({
            "string.base": `Device type should be a type of number`
        }),
        latitude: Joi.number().required().messages({
            "string.base": `Latitude should be a type of number`
        }),
        longitude: Joi.number().required().messages({
            "string.base": `Longitude should be a type of number`
        }),
        country: Joi.string().required(),
        city: Joi.string().required(),
        country_code: Joi.number().required().messages({
            "string.base": `Country code should be a type of number`
        }),
        zip_code: Joi.number().required().messages({
            "string.base": `Zip code should be a type of number`
        })

    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
            status: 0,
            statusCode: RESPONSE_CODES.BAD_REQUEST,
            message: error.details[0].message
        })
    }
    next();
};

export const social_signup_schema = (req, res, next) => {
    const schema = Joi.object().keys({
        social_id: Joi.string().required().messages({
            "string.base": `Social id should be a type of string`,
            "any.required": `Social id is required`
        }),
        social_type: Joi.number().required().valid(1, 2, 3, 4).messages({
            "string.base": `Signup type should be a type of number`,
            "any.required": `Signup type is required`
        }),
        first_name: Joi.string().required().min(3).max(50).messages({
            "string.base": `First name should be a type of string`,
            "string.min": `First name should have a minimum length of 3`,
            "string.max": `First name should have a maximum length of 50`,
            "any.required": `First name required`
        }),
        last_name: Joi.string().required().min(3).max(50).messages({
            "string.base": `Last name should be a type of string`,
            "string.min": `Last name should have a minimum length of 3`,
            "string.max": `Last name should have a maximum length of 50`,
            "any.required": `Last name required`
        }),
        email: Joi.string().required().email().messages({
            "string.email": `Invalid email`,
            "string.unique": `Email already exists with us`,
            "any.required": `Email required`
        }),
        country_code: Joi.string().required().messages({
            "any.required": `Country code is required`
        }),
        phone: Joi.string().required().min(10).max(15).messages({
            "string.min": `Phone should have a minimum length of 10`,
            "string.max": `Phone should have a maximum length of 15`,
            "any.required": `Phone is required`
        })
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
            status: 0,
            statusCode: RESPONSE_CODES.BAD_REQUEST,
            message: error.details[0].message
        })
    }

    next();
};

export const verify_otp = (req, res, next) => {
    const schema = Joi.object().keys({
        device_token: Joi.string().required(),
        device_type: Joi.number().optional().valid(1, 2).messages({
            "string.base": `Device type should be a type of number`
        }),
        email: Joi.string().required().email().messages({
            "string.email": `Invalid email`,
            "any.required": `Email required`
        }),
        user_id: Joi.when('email', {
            is: Joi.exist(),
            then: Joi.string().optional(),
            otherwise: Joi.required()
        }),
        phone: Joi.when('email', {
            is: Joi.exist(),
            then: Joi.string().optional(),
            otherwise: Joi.string().required().min(10).max(15).messages({
                "string.min": `Phone should have a minimum length of 10`,
                "string.max": `Phone should have a maximum length of 15`,
                "any.required": `Phone is required`
            })
        }),

        otp: Joi.string().required().messages({
            "any.required": `Otp is required`
        }),

        latitude: Joi.number().required().messages({
            "string.base": `Latitude should be a type of number`
        }),
        longitude: Joi.number().required().messages({
            "string.base": `Longitude should be a type of number`
        }),
        country: Joi.string().required(),
        city: Joi.string().required(),
        country_code: Joi.number().required().messages({
            "string.base": `Country code should be a type of number`
        }),
        zip_code: Joi.number().required().messages({
            "string.base": `Zip code should be a type of number`
        })
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
            status: 0,
            statusCode: RESPONSE_CODES.BAD_REQUEST,
            message: error.details[0].message
        })
    }
    next();
};

export const verify_email_otp = (req, res, next) => {
    const schema = Joi.object().keys({
        email: Joi.string().required().email().messages({
            "string.email": `Invalid email`,
            "any.required": `Email required`
        }),
        otp: Joi.number().required().messages({
            "any.required": `Otp is required`
        }),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
            status: 0,
            statusCode: RESPONSE_CODES.BAD_REQUEST,
            message: error.details[0].message
        })
    }
    next();
};

export const login_schema = (req, res, next) => {
    const schema = Joi.object().keys({
        device_token: Joi.string().required(),
        device_type: Joi.number().optional().valid(1, 2).messages({
            "string.base": `Device type should be a type of number`
        }),
        email: Joi.string().required().email().messages({
            "string.email": `Invalid email`,
            "any.required": `Email required`
        }),
        password: Joi.string().required().messages({
            "any.required": `Password required`
        }),
        latitude: Joi.number().required().messages({
            "string.base": `Latitude should be a type of number`
        }),
        longitude: Joi.number().required().messages({
            "string.base": `Longitude should be a type of number`
        }),
        country: Joi.string().required(),
        city: Joi.string().required(),
        country_code: Joi.number().required().messages({
            "string.base": `Country code should be a type of number`
        }),
        zip_code: Joi.number().required().messages({
            "string.base": `Zip code should be a type of number`
        })
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
            status: 0,
            statusCode: RESPONSE_CODES.BAD_REQUEST,
            message: error.details[0].message
        })
    }

    next();
};

export const resend_otp = (req, res, next) => {
    const schema = Joi.object().keys({
        // type: Joi.string().required().valid(0, 1).messages({
        //     "any.required": `Type is required`
        // }),
        email: Joi.string().required(),
        // email: Joi.when('type', {
        //     is: 0,
        //     then: Joi.string().required(),
        //     otherwise: Joi.forbidden()
        // }),
        // country_code: Joi.when('type', {
        //     is: 1,
        //     then: Joi.string().required(),
        //     otherwise: Joi.forbidden()
        // }),
        // phone: Joi.when('type', {
        //     is: 1,
        //     then: Joi.string().required(),
        //     otherwise: Joi.forbidden()
        // }),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
            status: 0,
            statusCode: RESPONSE_CODES.BAD_REQUEST,
            message: error.details[0].message
        })
    }
    next();
}

export const forgot_password = (req, res, next) => {
    const schema = Joi.object().keys({
        email: Joi.string().required().email().messages({
            "string.email": `Invalid email`,
            "any.required": `Email required`
        })
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
            status: 0,
            statusCode: RESPONSE_CODES.BAD_REQUEST,
            message: error.details[0].message
        })
    }
    next();
};

export const reset_password = (req, res, next) => {
    const schema = Joi.object().keys({
        email: Joi.string().required().email().messages({
            "string.email": `Invalid email`,
            "any.required": `Email required`
        }),
        password: Joi.string().required().min(5).max(20).messages({
            "string.min": `Password should have a minimum length of 5`,
            "string.max": `Password should have a maximum length of 20`,
            "any.required": `Password required`
        }),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
            status: 0,
            statusCode: RESPONSE_CODES.BAD_REQUEST,
            message: error.details[0].message
        })
    }
    next();
}

export const confirm_login_schema = (req, res, next) => {
    const schema = Joi.object().keys({
        email: Joi.string().required().email().messages({
            "string.email": `Invalid email`,
            "any.required": `Email required`
        }),
        user_id: Joi.string().required().messages({
            "any.required": `Iser id required`
        }),
        otp: Joi.string().required().messages({
            "any.required": `Otp is required`
        })
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
            status: 0,
            statusCode: RESPONSE_CODES.BAD_REQUEST,
            message: error.details[0].message
        })
    }
    next();
};