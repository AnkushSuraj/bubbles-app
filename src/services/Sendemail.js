import SENDMAIL from "../mail/mail.js";
import HTML_TEMPLATE from "../mail/mail-template.js";

//Fetch  user detail
const sendOTPEmail = async(payload) => {
    try {
        const name = payload.name;
        const otp = payload.otp;
        const options = {
            from: "TESTING <info@yopmail.com>", // sender address
            to: payload.email, // receiver email
            subject: "Account verification", // Subject line
            text: name,
            html: HTML_TEMPLATE(name, otp),
        }
        SENDMAIL(options, (info) => {
            console.log("Email sent successfully");
            console.log("MESSAGE ID: ", info.messageId);
        });
        return true;
    } catch (error) {
        return {
            status: 0,
            statusCode: 500,
            message: error.message
        };
    }
};

export {
    sendOTPEmail
}