import 'dotenv/config';
import pkg from 'aws-sdk';
import { RESPONSE_CODES, USER_STATUS, SOCIAL_TYPES } from "../config/constants.js";
import user from '../models/user.js';

const { CognitoIdentityServiceProvider } = pkg;

const cognitoData = {
    region: process.env.AWS_COGNITO_REGION,
    accessKeyId: process.env.AWS_COGNITO_ACCESSKEYID,
    secretAccessKey: process.env.AWS_COGNITO_SECRETACCESSKEYID,
}

const poolData = {
    UserPoolId: process.env.AWS_COGNITO_USERPOOLID,
    ClientId: process.env.AWS_COGNITO_CLIENTID
};

const cognitoClient = new CognitoIdentityServiceProvider(cognitoData);

const getUser = async (payload) => {
    try {
        let response = {};
        const getUserParams = {
            UserPoolId: poolData.UserPoolId,
            Filter: `email="${payload.email}"`
        };
        const getUser = await cognitoClient.listUsers(getUserParams).promise();
        if (getUser.Users.length) {
            response = {
                success: true,
                status: 1,
                statusCode: RESPONSE_CODES.ALREADY_EXIST,
                message: "The email address you entered is already associated with an account."
            };
        } else {
            response = {
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.NOT_FOUND,
                message: "The email address you entered is not registered with us!!."
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

const signUpUser = async (payload) => {
    try {
        let response = {};
        let phoneNumber = `+${payload.country_code}${payload.phone}`;
        const params = {
            ClientId: poolData.ClientId,
            Username: payload.email,
            Password: payload.password,
            UserAttributes: [
                { Name: 'email', Value: payload.email },
                { Name: 'phone_number', Value: phoneNumber },
                { Name: 'custom:first_name', Value: payload.first_name },
                { Name: 'custom:last_name', Value: payload.last_name },
                { Name: 'custom:role', Value: payload.role },
            ],
        };

        if (payload.signup_type == SOCIAL_TYPES.GOOGLE) {
            params.UserAttributes.push({ Name: 'custom:google_id', Value: `${payload.social_id}` });
        } else if (payload.signup_type == SOCIAL_TYPES.FACEBOOK) {
            params.UserAttributes.push({ Name: 'custom:facebook_id', Value: `${payload.social_id}` });
        } else if (payload.signup_type == SOCIAL_TYPES.APPLE) {
            params.UserAttributes.push({ Name: 'custom:apple_id', Value: `${payload.social_id}` });
        }
        const data = await cognitoClient.signUp(params).promise()
        response = {
            success: true,
            status: 1,
            statusCode: RESPONSE_CODES.POST,
            message: "User created in AWS Cognitio Successfully and OTP sent on your registered email!!.",
            data: {
                user_id: data.UserSub
            }
        };
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

const confirmUserAccount = async (payload) => {
    try {
        const params = {
            ClientId: poolData.ClientId,
            ConfirmationCode: `${payload.otp}`,
            Username: payload.email
        };
        await cognitoClient.confirmSignUp(params).promise()
        let response = {
            success: true,
            status: 1,
            statusCode: RESPONSE_CODES.POST,
            message: 'Account verified successfully, now you can login with registered email!!'
        };
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

const loginUserAccount = async (payload) => {
    try {
        let email = payload.email;
        let password = payload.password;
        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: poolData.ClientId,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
            },
        };
        const data = await cognitoClient.initiateAuth(params).promise();
        let response = {
            success: true,
            status: 1,
            statusCode: RESPONSE_CODES.POST,
            message: 'Login successfully!!',
            access_token: data.AuthenticationResult.AccessToken
        };
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


const resendOTP = async (payload) => {
    try {
        let email = payload.email;
        const resendParams = {
            ClientId: poolData.ClientId,
            Username: email,
        }
        await cognitoClient.resendConfirmationCode(resendParams).promise();
        let response = {
            success: true,
            status: 1,
            statusCode: RESPONSE_CODES.POST,
            message: "OTP resend on your registered email!!",
        };
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


async function checkSocialIdExistsOnCognito(customAttributeName, customAttributeValue) {
    try {
        const params = {
            UserPoolId: poolData.UserPoolId,
            Filter: `custom:${customAttributeName} = "${customAttributeValue}"`,
            Limit: 1 // Limiting to 1 as we expect only one user with this attribute value
        };

        const data = await cognitoClient.listUsers(params).promise();
        if (data.Users.length === 1) {
            return data.Users[0];
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        throw error;
    }
}

const new_checkSocialIdExistsOnCognito = async (payload) => {
    try {

        let getUserParams, response = {};

        const getUser = await cognitoClient.listUsers(getUserParams).promise();
        console.log(getUser);
        return false;
        if (getUser.Users.length) {
            response = {
                success: true,
                status: 1,
                statusCode: RESPONSE_CODES.ALREADY_EXIST,
                message: "The email address you entered is already associated with an account."
            };
        } else {
            response = {
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.NOT_FOUND,
                message: "The email address you entered is not registered with us!!."
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

const getUserBySocialId = async (payload) => {
    try {
        let response = {};
        const getUserParams = {
            UserPoolId: poolData.UserPoolId,
            Filter: `username="${payload.social_id}"`
        };
        const getUser = await cognitoClient.listUsers(getUserParams).promise();
        if (getUser.Users.length) {
            let userAttributesObject = {};
            const userAttributes = getUser?.Users[0]?.Attributes;
            userAttributes.forEach(attribute => {
                userAttributesObject[attribute.Name] = attribute.Value;
              });
            response = {
                success: true,
                status: 1,
                statusCode: RESPONSE_CODES.ALREADY_EXIST,
                message: "User details.",
                data:  userAttributesObject
            };
        } else {
            response = {
                success: false,
                status: 0,
                statusCode: RESPONSE_CODES.NOT_FOUND,
                message: "No data found!!"
            };
        }
        return response;
    } catch (error) {
        console.log("error------------",error)
        return {
            success: false,
            status: 0,
            statusCode: RESPONSE_CODES.ERROR,
            message: error.message
        };
    }
}

const updateUser = async (payload) => {
    try {
        let response = {};
        let phoneNumber = `+${payload.country_code}${payload.phone}`;
        const updateParams = {
            UserPoolId: poolData.UserPoolId,
            Username: payload.social_id,
            UserAttributes: [
                // { Name: 'email', Value: payload.email },
                { Name: 'phone_number', Value: phoneNumber },
                { Name: 'custom:first_name', Value: payload.first_name },
                { Name: 'custom:last_name', Value: payload.last_name },
                { Name: 'custom:role', Value: payload.role },
            ],
        };

        await cognitoClient.adminUpdateUserAttributes(updateParams).promise();

        response = {
            success: true,
            status: 1,
            statusCode: RESPONSE_CODES.POST,
            message: "User created in AWS Cognitio Successfully and OTP sent on your registered email!!.",
            data: {
                user_id: payload.user_id
            }
        };
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
    getUser,
    checkSocialIdExistsOnCognito,
    signUpUser,
    confirmUserAccount,
    loginUserAccount,
    resendOTP,
    getUserBySocialId,
    updateUser
};