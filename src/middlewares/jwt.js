import jwt from 'jsonwebtoken';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'


// Generate JWT Token
const generateToken = (user_id, aws_cognito_access_token) => {
    return jwt.sign({ id: user_id, aws_cognito_access_token: aws_cognito_access_token }, process.env.JWT_SECRET_KEY, { expiresIn: '15d' });
};


// Generate MS_TOKEN
const generate_MS_Token = (phone) => {
    const tokenString = Date.now() + "_" + phone + "_" + "access_token";
    const md5Hash = crypto.createHash('md5').update(tokenString).digest('hex');
    const token = Buffer.from(md5Hash).toString('base64');
    return token;
};

const refreshToken = (user_id) => {
    return jwt.sign({ id: user_id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
};

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            const verifyToken = jwt.verify(token, process.env.JWT_Secret_Key)
            if (verifyToken) {
                return req.user = verifyToken
            }
        }

    } catch (error) {
        throw {
            message: "Invalid Token"
        }
    }

};

const generateHash = async(text) => {
    const hash = await bcrypt.hashSync(text, 10);
    return hash;
};

export {
    generateToken,
    generate_MS_Token,
    verifyToken,
    refreshToken,
    generateHash
};