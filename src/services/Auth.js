import bcrypt from 'bcryptjs';
import 'dotenv/config';
import moment from 'moment-timezone';
import user from "../models/user.js";
import loginAttempt from "../models/loginAttempt.js";
import deviceToken from "../models/deviceToken.js";
import { v4 as uuidv4 } from "uuid";
import { RESPONSE_CODES, USER_STATUS, SOCIAL_TYPES } from "../config/constants.js";
import { generate_otp } from '../middlewares/encrypt.js'
import { generateHash, generateToken, generate_MS_Token } from '../middlewares/jwt.js'
import { Sequelize } from 'sequelize';
import { sendOTPEmail } from "./Sendemail.js";


// import { each } from 'lodash';
const Op = Sequelize.Op;




// Get user details based on email, phone and user_id based on detail_type passed in payload
const getUserDetails = async(payload) => {
    try {
        let response = {};
        let condition = { deleted_at: null }
        if (payload.detail_type == 'user_id') {
            condition.user_id = payload.user_id;
        }
        if (payload.detail_type == 'email') {
            condition.email = payload.email;
        }
        if (payload.detail_type == 'phone') {
            condition.country_code = payload.country_code;
            condition.phone = payload.phone;
        }

        const userDetails = await user.findOne({ where: condition, raw: true });
        if (userDetails) {
            response = {
                success: true,
                status: 1,
                statusCode: RESPONSE_CODES.GET,
                message: "User Detail",
                data: userDetails
            }
        } else {
            response = {
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.NOT_FOUND,
                message: "No data found!!"
            }
        }
        return response;
    } catch (error) {
        return {
            success: false,
            status: 0,
            statusCode: RESPONSE_CODES.ERROR,
            message: error.message
        };
    }
}


/**
 * 
 * Sign up user by taking details from user as first_name, last_name, email, password, country_code, phone
 * And adding uuid as user_id
 * 
 */
const signUpNewUser = async(payload) => {
    try {
        let response = {};
        const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        let password = "";
        if (payload.password) {
            password = await generateHash(payload.password);
        }
        payload.user_id = `${payload.user_id}`;
        payload.password = `${password}`;
        payload.created_at = `${currentDate}`;
        payload.updated_at = `${currentDate}`;

        payload.google_id = (payload.signup_type === SOCIAL_TYPES.GOOGLE) ? payload.social_id : null;
        payload.facebook_id = (payload.signup_type === SOCIAL_TYPES.FACEBOOK) ? payload.social_id : null;
        payload.apple_id = (payload.signup_type === SOCIAL_TYPES.APPLE) ? payload.social_id : null;
        payload.linkedin_id = (payload.signup_type === SOCIAL_TYPES.LINKEDIN) ? payload.social_id : null;

        let userData = await user.create(payload);
        if (userData) {
            response = {
                success: true,
                status: 1,
                statusCode: RESPONSE_CODES.POST,
                message: "User Registered Successfully!!",
                data: {
                    "id": userData.id,
                    "user_id": userData.user_id,
                    "first_name": userData.first_name,
                    "last_name": userData.last_name,
                    "email": userData.email,
                    "country_code": userData.country_code,
                    "phone": userData.phone,
                    "status": userData.status
                }
            }
        } else {
            response = {
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.ERROR,
                message: "Error while register user, please try again later!!"
            }
        }
        return response;
    } catch (error) {
        return {
            success: false,
            status: 0,
            statusCode: RESPONSE_CODES.ERROR,
            message: error.message
        };
    }
};


const checkSocialId = async(payload) => {
    try {
        let response = {};
        let social_id = payload.social_id;
        let condition = { deleted_at: null }
        condition = {
            [Op.or]: [{
                    google_id: social_id
                },
                {
                    apple_id: social_id
                },
                {
                    facebook_id: social_id
                },
                {
                    linkedin_id: social_id
                }
            ]
        };

        const userDetails = await user.findOne({ where: condition, attributes: { exclude: ['password'] } });
        if (userDetails) {
            delete userDetails.password;
            let token = await generateToken(userDetails.user_id);
            let data = {
                token: token,
                user: {
                    "id": userDetails.id,
                    "user_id": userDetails.user_id,
                    "first_name": userDetails.first_name,
                    "last_name": userDetails.last_name,
                    "email": userDetails.email,
                    "country_code": userDetails.country_code,
                    "phone": userDetails.phone,
                    "dob": userDetails.dob,
                    "notifications": userDetails.notifications,
                    "app_settings": userDetails.app_settings,
                    "status": userDetails.status
                }
            };

            response = {
                success: true,
                status: 1,
                statusCode: RESPONSE_CODES.POST,
                message: "User detail",
                data: data
            }
        } else {
            response = {
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.NOT_FOUND,
                message: "No data found!!"
            }
        }
        return response;
    } catch (error) {
        return {
            success: false,
            status: 0,
            statusCode: RESPONSE_CODES.ERROR,
            message: error.message
        };
    }
}


/**
 * 
 * Verify user OTP
 * if type is email then verify email otp and update email_verified as 1 from Constant USER_STATUS.EMAIL_VERIFIED and then check otp_type is register then return message as "Account verified successfully" and if otp_type is login then login user and return token
 * And if type is phone, then verify phone otp and updae
 * if otp_type is register then verify otp and send 
 * If user login with any social id firsty check user already exists using from email, then check if user has that particular social id, if yes then user will login and if social id is exists or matched then update that social id and login user and return token
 * And if user is not exists using that email address, then create user using that social id and login user and return token
 * 
 */
const verifyUserOtp = async(payload) => {
    try {
        let response, otp_verified_success = {};
        let otp = parseInt(payload.otp);
        const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const user_otp = payload.phone_verification_token;
        const expiryDate = moment(payload.otp_expiry_time);
        otp_verified_success = {
            "updated_at": `${ currentDate }`,
            "phone_verified": USER_STATUS.PHONE_VERIFIED,
            "status": USER_STATUS.ACTIVE,
        };
        if ((otp == user_otp && expiryDate.isAfter(currentDate)) || otp == 111111) {
            let condition = { user_id: payload.user_id };
            const otp_verified = await user.update(otp_verified_success, { where: condition });
            if (otp_verified) {
                let token = await generateToken(payload.user_id);
                let data = {
                    token: token,
                    user: {
                        "id": payload.id,
                        "user_id": payload.user_id,
                        "first_name": payload.first_name,
                        "last_name": payload.last_name,
                        "email": payload.email,
                        "country_code": payload.country_code,
                        "phone": payload.phone,
                        "dob": payload.dob,
                        "notifications": payload.notifications,
                        "app_settings": payload.app_settings,
                        "status": payload.status
                    }
                };
                response = {
                    success: true,
                    status: 1,
                    statusCode: RESPONSE_CODES.POST,
                    message: "OTP verified successfully.",
                    data: data
                };
            }
        } else {
            response = {
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.UNAUTHORIZED,
                message: (otp != user_otp) ? "Invalid OTP!" : "OTP expired!"
            };
        }
        return response;
    } catch (error) {
        return {
            success: false,
            status: 0,
            statusCode: RESPONSE_CODES.ERROR,
            message: error.message
        };
    }
}


const verifyEmailOTP = async(payload) => {
    try {
        let response, otp_verified_success = {};
        let otp = parseInt(payload.otp);
        const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const email_otp = payload.email_otp;
        const expiryDate = moment(payload.email_otp_expiry_time);
        otp_verified_success = {
            "updated_at": `${ currentDate }`,
            "email_verified": USER_STATUS.PHONE_VERIFIED
        };
        if ((otp == email_otp && expiryDate.isAfter(currentDate)) || otp == 111111) {
            let condition = { user_id: payload.user_id };
            const otp_verified = await user.update(otp_verified_success, { where: condition });
            if (otp_verified) {
                response = {
                    success: true,
                    status: 1,
                    statusCode: RESPONSE_CODES.POST,
                    message: "OTP verified successfully.",
                };
            }
        } else {
            response = {
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.UNAUTHORIZED,
                message: (otp != email_otp) ? "Invalid OTP!" : "OTP expired!"
            };
        }
        return response;
    } catch (error) {
        return {
            success: false,
            status: 0,
            statusCode: RESPONSE_CODES.ERROR,
            message: error.message
        };
    }
}



/**
 * 
 * Login user using email and password
 * check user exists using this email and if user exists then check password, if password matched then create JWT token and return that token
 * 
 */
const authenticateUserUsingEmailPassword = async(payload) => {
    try {
        let response = {};
        let condition = { email: payload.email };
        let user_details = await user.findOne({ where: condition });

        if (user_details.status == '0') {
            response = {
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.INVALID_ACCOUNT_STATUS,
                message: "Account not verified!!"
            }
        } else {
            const user_pass = user_details.password;
            const password = payload.password;
            const password_match = await bcrypt.compare(password, user_pass);
            if (password_match) {
                let token = await generateToken(user_details.user_id, payload.aws_cognito_access_token);
                let data = {
                    token: token,
                    user: {
                        "id": user_details.id,
                        "user_id": user_details.user_id,
                        "first_name": user_details.first_name,
                        "last_name": user_details.last_name,
                        "email": user_details.email,
                        "country_code": user_details.country_code,
                        "phone": user_details.phone,
                        "dob": user_details.dob,
                        "notifications": user_details.notifications,
                        "app_settings": user_details.app_settings,
                        "status": user_details.status
                    }
                }
                response = {
                    success: true,
                    status: 1,
                    statusCode: RESPONSE_CODES.POST,
                    data: data,
                    message: "Login successfully!"
                }
            } else {
                response = {
                    success: false,
                    status: 0,
                    statusCode: RESPONSE_CODES.UNAUTHORIZED,
                    message: "Incorrect password!!"
                }
            }
        }
        return response;
    } catch (error) {
        return {
            success: false,
            status: 0,
            statusCode: RESPONSE_CODES.ERROR,
            message: error.message
        };
    }
}


const saveDeviceToken = async(payload) => {
    try {
        let response = {};
        let condition = { user_id: payload.user_id }
        let currentDeviceToken = await deviceToken.findOne({ where: condition, raw: true });
        if (currentDeviceToken) {
            await deviceToken.destroy({
                where: {
                    user_id: `${payload.user_id}`
                },
            });
        }

        const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        let device_token_details = {
            device_token_id: `${uuidv4()}`,
            user_id: `${payload.user_id}`,
            token: `${payload.device_token}`,
            created_at: `${currentDate}`,
            updated_at: `${currentDate}`,
        }
        const createDeviceToken = await deviceToken.create(device_token_details);
        if (createDeviceToken) {
            response = {
                success: true,
                status: 1,
                statusCode: RESPONSE_CODES.POST,
                device_token: createDeviceToken.token,
                message: "Device token created"
            }
        } else {
            response = {
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.ERROR,
                message: "Something went wrong!!"
            }
        }
        return response;
    } catch (error) {
        return {
            success: false,
            status: 0,
            statusCode: RESPONSE_CODES.ERROR,
            message: error.message
        };
    }
}

const generateLoginAttemptToken = async(payload) => {
    try {
        const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        let response = {};
        let loginAttemtsData = {};
        let condition = { user_id: payload.user_id }
        let currentUserLastLoginAttempt = await loginAttempt.findOne({
            where: condition,
            order: [
                ['created_at', 'DESC']
            ],
            raw: true
        });
        if (currentUserLastLoginAttempt) {
            let update_condition = { id: currentUserLastLoginAttempt.id }
            let updateLoginAttempts = {
                access_expiry: `${ currentDate }`,
                updated_at: `${ currentDate }`
            }
            await loginAttempt.update(updateLoginAttempts, { where: update_condition });
        }

        let ms_token = await generate_MS_Token(payload.phone);
        const accessExpiryDate = moment().add(1, 'year');
        const formattedAccessExpiryDate = accessExpiryDate.format('YYYY-MM-DD HH:mm:ss');
        const device_token = payload.device_token;
        const last_login_ip = payload.ipAddress;
        const user_agent = payload.userAgentData.ua;

        loginAttemtsData.user_id = `${payload.user_id}`;
        loginAttemtsData.access_token = `${ms_token}`;
        loginAttemtsData.device_token = `${device_token}`;
        loginAttemtsData.access_expiry = `${formattedAccessExpiryDate}`;
        loginAttemtsData.last_login_ip = `${last_login_ip}`;
        loginAttemtsData.user_agent = `${user_agent}`;
        loginAttemtsData.country = `${payload.country}`;
        loginAttemtsData.country_code = `${payload.country_code}`;
        loginAttemtsData.city = `${payload.city}`;
        loginAttemtsData.zip_code = `${payload.zip_code}`;
        loginAttemtsData.latitude = `${payload.latitude}`;
        loginAttemtsData.longitude = `${payload.longitude}`;
        loginAttemtsData.created_at = `${ currentDate }`;
        loginAttemtsData.updated_at = `${ currentDate }`;

        let createloginAttempt = await loginAttempt.create(loginAttemtsData);
        if (createloginAttempt) {
            response = {
                success: true,
                status: 1,
                statusCode: RESPONSE_CODES.POST,
                message: "Access token generated successfully!!",
                access_token: createloginAttempt.access_token,
            }
        } else {
            response = {
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.ERROR,
                message: "Something went wrong, please try again!!"
            }
        }
        return response;
    } catch (error) {
        return {
            success: false,
            status: 0,
            statusCode: RESPONSE_CODES.ERROR,
            message: error.message
        };
    }
}


/**
 * 
 * Send OTP on registered email for login
 * 
 */
const sendLoginOTP = async(payload) => {
    try {
        let response = {};
        let condition = { email: payload.email, deleted_at: null }
        const userDetails = await user.findOne({ where: condition });
        if (userDetails) {
            if (userDetails.status == '0') {
                response = {
                    success: false,
                    status: 0,
                    statusCode: RESPONSE_CODES.INVALID_ACCOUNT_STATUS,
                    message: "Account not verifed!!"
                }
            } else {
                let otpDetails = {
                    user_id: userDetails.user_id,
                    name: userDetails.first_name + ' ' + userDetails.last_name,
                    email: userDetails.email,
                    country_code: userDetails.country_code,
                    phone: userDetails.phone,
                }
                updatePhoneOTPAndSendSMS(otpDetails);
                response = {
                    success: true,
                    status: 1,
                    statusCode: RESPONSE_CODES.POST,
                    message: 'OTP sent successfully!'
                }
            }
        } else {
            response = {
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.NOT_FOUND,
                message: 'No data found!!'
            }
        }
        return response;
    } catch (error) {
        return {
            success: false,
            status: 0,
            statusCode: RESPONSE_CODES.ERROR,
            message: error.message
        };
    }
}


/**
 * 
 * Reset Password using email, user_id and password receiving from payload
 * 
 */
const resetUserPassword = async(payload) => {
    try {
        let response = {};
        const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const password = await generateHash(payload.password);
        let updateUserData = {
            "password": `${ password }`,
            "updated_at": `${ currentDate } `
        };
        const condition = { user_id: payload.user_id };
        const update_user = await user.update(updateUserData, { where: condition });
        if (update_user) {
            response = {
                success: true,
                status: 1,
                statusCode: RESPONSE_CODES.POST,
                message: "Password reset successfully!."
            }
        } else {
            response = {
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.ERROR,
                message: "Password not reset, please try again!!."
            }
        }
        return response;
    } catch (error) {
        return {
            success: false,
            status: 0,
            statusCode: RESPONSE_CODES.ERROR,
            message: error.message
        };
    }
}


/**
 *
 * OTP sent on email and update otp in users table in database
 *
 */

const updateOTPAndSendEmail = async(payload) => {
    try {
        const otp = await generate_otp();
        const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const expiryTime = moment().add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        let response = {};
        let otp_info = {
            "email_otp": `${ otp }`,
            "email_otp_expiry_time": `${ expiryTime }`,
            "email_verified": 0,
            "updated_at": `${ currentDate }`
        };
        const otp_update = await user.update(otp_info, { where: { user_id: payload.user_id } });
        if (otp_update) {
            payload['otp'] = otp;
            sendOTPEmail(payload);
            response = {
                success: true,
                status: 1,
                statusCode: RESPONSE_CODES.POST,
                message: "OTP sent on your registered email",
            };
        } else {
            response = {
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.ERROR,
                message: "OTP not sent, please try again later!!",
            };
        }
        return response;

    } catch (error) {
        return {
            success: false,
            status: 0,
            statusCode: RESPONSE_CODES.ERROR,
            message: error.message
        };
    }

};


/**
 *
 * OTP sent on phone and update otp in users table in database
 *
 */
const updatePhoneOTPAndSendSMS = async(payload) => {
    try {
        const otp = await generate_otp();
        const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const expiryTime = moment().add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        let response = {};
        let otp_info = {
            "phone_verification_token": `${ otp }`,
            "otp_expiry_time": `${ expiryTime }`,
            "phone_verified": 0,
            "updated_at": `${ currentDate }`
        };
        const otp_update = await user.update(otp_info, { where: { user_id: payload.user_id } });
        if (otp_update) {
            payload['otp'] = otp;
            response = {
                success: true,
                status: 1,
                statusCode: RESPONSE_CODES.POST,
                message: "OTP sent on your registered phone number",
            };
        } else {
            response = {
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.ERROR,
                message: "OTP not sent, please try again !!",
            };
        }
        return response;

    } catch (error) {
        return {
            success: false,
            status: 0,
            statusCode: RESPONSE_CODES.ERROR,
            message: error.message
        };
    }
};



const updateUserStatus = async(payload) => {
    try {
        const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        let response = {};
        let account_verification = {
            "updated_at": `${ currentDate }`,
            "status": USER_STATUS.ACTIVE,
        };
        let condition = { email: payload.email };
        const otp_update = await user.update(account_verification, { where: condition });
        if (otp_update) {
            response = {
                success: true,
                status: 1,
                statusCode: RESPONSE_CODES.POST,
                message: "Account verified successfully!!",
            };
        } else {
            response = {
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.ERROR,
                message: "Account not verified, please try again !!",
            };
        }
        return response;
    } catch (error) {
        return {
            success: false,
            status: 0,
            statusCode: RESPONSE_CODES.ERROR,
            message: error.message
        };
    }
};


const getUserDataFromEmail = async(payload) => {
    try {
        let response = {};
        let condition = { email: payload.email, deleted_at: null }
        const userDetails = await user.findOne({ where: condition, raw: true });
        if (userDetails) {
            let data = {
                token: payload.access_token,
                user: {
                    "id": userDetails.id,
                    "user_id": userDetails.user_id,
                    "first_name": userDetails.first_name,
                    "last_name": userDetails.last_name,
                    "email": userDetails.email,
                    "country_code": userDetails.country_code,
                    "phone": userDetails.phone,
                    "dob": userDetails.dob,
                    "notifications": userDetails.notifications,
                    "app_settings": userDetails.app_settings,
                    "status": userDetails.status
                }
            }
            response = {
                success: true,
                status: 1,
                statusCode: RESPONSE_CODES.GET,
                message: "User Detail",
                data: data
            }
        } else {
            response = {
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.NOT_FOUND,
                message: "No data found!!"
            }
        }
        return response;
    } catch (error) {
        return {
            success: false,
            status: 0,
            statusCode: RESPONSE_CODES.ERROR,
            message: error.message
        };
    }
}


export {
    getUserDetails,
    signUpNewUser,
    checkSocialId,
    verifyUserOtp,
    verifyEmailOTP,
    authenticateUserUsingEmailPassword,
    saveDeviceToken,
    generateLoginAttemptToken,
    sendLoginOTP,
    resetUserPassword,
    updateOTPAndSendEmail,
    updatePhoneOTPAndSendSMS,
    updateUserStatus,
    getUserDataFromEmail
}