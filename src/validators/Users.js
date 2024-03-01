import Joi from 'joi';
import { RESPONSE_CODES } from "../config/constants.js";


export const add_user_schema = (req, res, next) => {
    const schema = Joi.object().keys({
        name: Joi.string().required().empty().min(3).max(50).messages({
            "string.base": `First name should be a type of 'text'`,
            "string.empty": `First name cannot be an empty`,
            "string.min": `First name should have a minimum length of 3`,
            "string.max": `First name should have a maximum length of 50`,
            "any.required": `First name required`
        }),
        username: Joi.string().required().empty().min(3).max(50).messages({
            "string.empty": `Username cannot be an empty`,
            "string.min": `Username should have a minimum length of 5`,
            "string.max": `Username should have a maximum length of 20`,
            "any.required": `Username required`
        }),
        email: Joi.string().required().empty().email().messages({
            "string.empty": `Email cannot be an empty`,
            "string.email": `Invalid email`,
            "string.unique": `Email already exists with us`,
            "any.required": `Email required`
        }),
        password: Joi.string().required().empty().min(5).max(20).messages({
            "string.empty": `Password cannot be an empty`,
            "string.min": `Password should have a minimum length of 5`,
            "string.max": `Password should have a maximum length of 20`,
            "any.required": `Password required`
        }),
        country_code: Joi.string().required().empty().messages({
            "string.empty": `Country code cannot be an empty`,
            "any.required": `Country code is required`
        }),
        phone: Joi.string().required().empty().min(10).max(15).messages({
            "string.empty": `Phone cannot be an empty`,
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

export const update_user_schema = (req, res, next) => {
    const schema = Joi.object().keys({
        user_id: Joi.number().integer().empty().required().messages({
            "string.empty": `User id cannot be an empty`,
            "any.required": `User id required`
        }),
        name: Joi.string().required().empty().min(3).max(50).messages({
            "string.base": `First name should be a type of 'text'`,
            "string.empty": `First name cannot be an empty`,
            "string.min": `First name should have a minimum length of 3`,
            "string.max": `First name should have a maximum length of 50`,
            "any.required": `First name required`
        }),
        username: Joi.string().required().empty().min(3).max(50).messages({
            "string.empty": `Username cannot be an empty`,
            "string.min": `Username should have a minimum length of 5`,
            "string.max": `Username should have a maximum length of 20`,
            "any.required": `Username required`
        }),
        email: Joi.string().required().empty().email().messages({
            "string.empty": `Email cannot be an empty`,
            "string.email": `Invalid email`,
            "string.unique": `Email already exists with us`,
            "any.required": `Email required`
        }),
        country_code: Joi.string().required().empty().messages({
            "string.empty": `Country code cannot be an empty`,
            "any.required": `Country code is required`
        }),
        phone: Joi.string().required().empty().min(10).max(15).messages({
            "string.empty": `Phone cannot be an empty`,
            "string.min": `Phone should have a minimum length of 10`,
            "string.max": `Phone should have a maximum length of 15`,
            "any.required": `Phone is required`
        }),
        profile_pic: Joi.string().required().empty().messages({
            "string.empty": `Profile pic cannot be an empty`,
            "any.required": `Profile pic required`
        }),
        father_name: Joi.string().required().empty().min(3).max(50).messages({
            "string.empty": `Father name cannot be an empty`,
            "string.min": `Father name should have a minimum length of 3`,
            "string.max": `Father name should have a maximum length of 50`,
            "any.required": `Father name required`
        }),
        mother_name: Joi.string().required().empty().min(3).max(50).messages({
            "string.empty": `Mother name cannot be an empty`,
            "string.min": `Mother name should have a minimum length of 3`,
            "string.max": `Mother name should have a maximum length of 50`,
            "any.required": `Mother name required`
        }),
        age: Joi.string().required().empty().messages({
            "string.empty": `Age cannot be an empty`,
            "any.required": `Age is required`
        }),
        gender: Joi.string().required().empty().messages({
            "string.empty": `Gender cannot be an empty`,
            "any.required": `Gender is required`
        }),
        blood_group: Joi.string().required().empty().messages({
            "string.empty": `Blood group cannot be an empty`,
            "any.required": `Blood group required`
        }),
        maritial_status: Joi.string().required().empty().messages({
            "string.empty": `Maritial status cannot be an empty`,
            "any.required": `Maritial status required`
        }),
        alternative_phone: Joi.string().required().empty().min(10).max(15).messages({
            "string.empty": `Alternative phone cannot be an empty`,
            "string.min": `Alternative phone should have a minimum length of 10`,
            "string.max": `Alternative phone should have a maximum length of 15`,
            "any.required": `Alternative phone required`
        }),
        address: Joi.string().required().empty().messages({
            "string.empty": `Address cannot be an empty`,
            "any.required": `Address required`
        }),
        address_2: Joi.string().required().messages(),
        city: Joi.string().required().empty().messages({
            "string.empty": `City cannot be an empty`,
            "any.required": `City required`
        }),
        state: Joi.string().required().empty().messages({
            "string.empty": `State cannot be an empty`,
            "any.required": `State required`
        }),
        postal_code: Joi.string().required().empty().messages({
            "string.empty": `Postal code cannot be an empty`,
            "any.required": `Postal code required`
        }),
        country: Joi.string().required().empty().messages({
            "string.empty": `Country cannot be an empty`,
            "any.required": `Country required`
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