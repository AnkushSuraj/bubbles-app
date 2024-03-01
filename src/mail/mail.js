import nodemailer from "nodemailer";

// create reusable transporter object using the default SMTP transport
const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

const SENDMAIL = async(mailDetails, callback) => {
    try {
        const info = await transport.sendMail(mailDetails)
        callback(info);
    } catch (error) {
        console.log(error);
    }
};

export default SENDMAIL