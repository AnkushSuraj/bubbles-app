import { RESPONSE_CODES, USER_STATUS, SOCIAL_TYPES } from "../../config/constants.js";
import useragent from 'ua-parser-js';
import { getUserDetails, signUpNewUser, checkSocialId, authenticateUserUsingEmailPassword, saveDeviceToken, generateLoginAttemptToken, getUserDataFromEmail, verifyEmailOTP, updateOTPAndSendEmail, resetUserPassword, sendLoginOTP, updateUserStatus } from "../../services/Auth.js";
import { getUser, signUpUser, confirmUserAccount, loginUserAccount, resendOTP, checkSocialIdExistsOnCognito, getUserBySocialId, updateUser } from "../../services/Cognito.js";

import { response } from "express";

const authController = {

    // Check emil already exists
    email_exists: async (req, res) => {
        try {
            const body = req.body;
            let response = await getUser(body);
            return res.status(response.statusCode).json(response);
            // let response = {};
            // const data = req.body;
            // data.detail_type = "email";
            // const user_exists = await getUserDetails(data);
            // response = user_exists;
            // if (user_exists.success) {
            //     delete user_exists.data;
            //     user_exists.statusCode = RESPONSE_CODES.POST;
            //     user_exists.message = "Email already exists with us, please try with different email!";
            // }
            // return res.status(response.statusCode).json(response);
        } catch (error) {
            return res.status(RESPONSE_CODES.ERROR).json({
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.ERROR,
                message: error
            });
        }
    },

    // check phone already exists
    phone_exists: async (req, res) => {
        try {
            let response = {};
            const data = req.body;
            data.detail_type = "phone";
            const user_exists = await getUserDetails(data);
            response = user_exists;
            if (user_exists.success) {
                user_exists.statusCode = RESPONSE_CODES.POST;
                delete user_exists.data;
                user_exists.message = "Phone already exists with us, please try with different phone!";
            }
            return res.status(response.statusCode).json(response);
        } catch (error) {
            return res.status(RESPONSE_CODES.ERROR).json({
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.ERROR,
                message: error
            });
        }
    },

    //Register User
    signUp: async (req, res) => {
        try {
            const body = req.body;
            let response = {};
            // response = await getUser(body);
            // if (!response.success) {
                // response = await signUpUser(body);
            //     if (response.success) {
            //         body.user_id = response.data.user_id;
            //         const registerUser = await signUpNewUser(body);
            //         if (registerUser.success) {
            //             registerUser.message = "User register successfully, To login your account, please verify your account with otp sent on your registered email!!";
            //         }
            //         response = registerUser;
            //     }
            // }

            if (body.social_id) {
                const userSocialInfo = await getUserBySocialId(body);
                if(userSocialInfo.status){

                    body.user_id = userSocialInfo.data.sub;
                    response = await updateUser(body);
                    // const registerUser = await signUpNewUser(body);
                    // if (registerUser.success) {
                    //     registerUser.message = "User register successfully, To login your account, please verify your account with otp sent on your registered email!!";
                    // }
                    // response = registerUser;
                }

            }

            return res.status(response.statusCode).json(response);
        } catch (error) {
            return res.status(RESPONSE_CODES.ERROR).json({
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.ERROR,
                message: error
            });
        }
    },

    // Confirm User On Cognito
    confirmUser: async (req, res) => {
        try {
            const body = req.body;
            let response = await getUser(body);
            if (response.success) {
                response = await confirmUserAccount(body);
                if (response.success) {
                    response = await updateUserStatus(body);
                }
            }
            return res.status(response.statusCode).json(response);

        } catch (error) {
            return res.status(RESPONSE_CODES.ERROR).json({
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.ERROR,
                message: error
            });

        }
    },

    // Get Admin User Details
    login: async (req, res) => {
        try {
            const body = req.body;
            let response = await getUser(body);
            if (response.success) {
                response = await loginUserAccount(body);
                if (response.success) {
                    body.access_token = response.access_token;
                    response = await getUserDataFromEmail(body);
                    if (response.success) {
                        body.ipAddress = req.connection.remoteAddress;
                        const save_device_token = await saveDeviceToken({ ...body, ...response.data.user });
                        if (!save_device_token.success) {
                            return res.status(save_device_token.statusCode).json(save_device_token);
                        }
                        body.device_token = save_device_token.device_token;
                        body.userAgentData = useragent(JSON.parse(JSON.stringify(req.get('user-agent'))));

                        const ms_token = await generateLoginAttemptToken({ ...body, ...response.data.user });

                        if (!ms_token.success) {
                            return res.status(ms_token.statusCode).json(ms_token);
                        }
                        response.data.ms_token = ms_token.access_token;
                        req.session.token = response.data.token;
                        req.session.ms_token = ms_token.access_token;
                    }
                }
            }
            return res.status(response.statusCode).json(response);

        } catch (error) {
            return res.status(RESPONSE_CODES.ERROR).json({
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.ERROR,
                message: error
            });
        }
    },

    resendOTP: async (req, res) => {
        try {
            const body = req.body;
            let response = await getUser(body);
            if (response.success) {
                response = await resendOTP(body);
            }
            return res.status(response.statusCode).json(response);
        } catch (error) {
            return res.status(RESPONSE_CODES.ERROR).json({
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.ERROR,
                message: error
            });
        }
    },

    social_verification: async (req, res) => {
        try {
            const data = req.body;
            let custom_attribute_name, custom_attribute_value;
            if (data.signup_type == SOCIAL_TYPES.GOOGLE) {
                custom_attribute_name = 'google_id';
            } else if (data.signup_type == SOCIAL_TYPES.FACEBOOK) {
                custom_attribute_name = 'facebook_id';
            } else if (data.signup_type == SOCIAL_TYPES.APPLE) {
                custom_attribute_name = 'apple_id';
            }
            custom_attribute_value = data.social_id;
            let response = await checkSocialIdExistsOnCognito(custom_attribute_name, custom_attribute_value);
            console.log(response);
            return false;

            let userAgent = JSON.parse(JSON.stringify(req.get('user-agent')));
            let userAgentData = useragent(userAgent);
            const ipAddress = req.connection.remoteAddress;

            // const data = req.body;
            // let response = await checkSocialId(data);
            // if (response.success) {
            //     data.ipAddress = ipAddress;
            //     const save_device_token = await saveDeviceToken({...data, ...response.data.user });
            //     console.log(save_device_token);
            //     if (!save_device_token.success) {
            //         return res.status(save_device_token.statusCode).json(save_device_token);
            //     }
            //     const device_token = save_device_token.device_token;
            //     data.device_token = device_token;
            //     data.userAgent = userAgentData;
            //     const ms_token = await generateLoginAttemptToken({...data, ...response.data.user });
            //     if (!ms_token.success) {
            //         return res.status(ms_token.statusCode).json(ms_token);
            //     }
            //     response.data.ms_token = ms_token.access_token;
            //     req.session.token = response.data.token;
            //     req.session.ms_token = ms_token.access_token;
            // }

            return res.status(response.statusCode).json(response);
        } catch (error) {
            return res.status(RESPONSE_CODES.ERROR).json({
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.ERROR,
                message: error
            });
        }
    },

    // Get Admin User Details
    login_with_otp: async (req, res) => {
        try {
            const data = req.body;
            const response = await sendLoginOTP(data);
            return res.status(response.statusCode).json(response);
        } catch (error) {
            return res.status(RESPONSE_CODES.ERROR).json({
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.ERROR,
                message: error
            });
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const data = req.body;
            data.detail_type = "email";
            let response = await getUserDetails(data);
            if (response.success) {
                let otpDetails = {
                    user_id: response.data.user_id,
                    name: response.data.first_name + ' ' + response.data.last_name,
                    email: response.data.email
                };
                const email_otp = await updateOTPAndSendEmail(otpDetails);
                if (!email_otp.success) {
                    response = email_otp;
                } else {
                    response = {
                        success: true,
                        status: 1,
                        statusCode: RESPONSE_CODES.POST,
                        message: "OTP sent on your registered email for forgot your password!"
                    }
                }
            }
            return res.status(response.statusCode).json(response);
        } catch (error) {
            return res.status(RESPONSE_CODES.ERROR).json({
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.ERROR,
                message: error
            });
        }
    },

    verifyEmailOTP: async (req, res) => {
        try {
            const data = req.body;
            data.detail_type = "email";
            let response = await getUserDetails(data);
            if (response.success) {
                const verifyEmail = await verifyEmailOTP({ ...data, ...response.data });
                response = verifyEmail;
            }
            return res.status(response.statusCode).json(response);
        } catch (error) {
            return res.status(RESPONSE_CODES.ERROR).json({
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.ERROR,
                message: error
            });
        }
    },

    resetPassword: async (req, res) => {
        try {
            let response = {};
            const data = req.body;
            data.detail_type = "email";
            let userExists = await getUserDetails(data);
            if (userExists.success) {
                data.user_id = userExists.data.user_id;
                response = await resetUserPassword(data);
            } else {
                response = userExists;
            }
            return res.status(response.statusCode).json(response);
        } catch (error) {
            return res.status(RESPONSE_CODES.ERROR).json({
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.ERROR,
                message: error
            });
        }
    },

}

export default authController;