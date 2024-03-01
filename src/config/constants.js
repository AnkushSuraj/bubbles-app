export const RESPONSE_CODES = {
    GET: 200,
    PUT: 204,
    POST: 201,
    DELETE: 204,
    NOT_FOUND: 404,
    ERROR: 500,
    UNAUTHORIZED: 401,
    BAD_REQUEST: 400,
    ALREADY_EXIST: 409,
    FORBIDDEN: 403,
    INVALID_ACCOUNT_STATUS: 402
};

export const Collection = {
    adminTableName: 'Admin',
}


export const USER_STATUS = {
    INACTIVE: 0,
    ACTIVE: 1,
    EMAIL_VERIFIED: 1,
    PHONE_VERIFIED: 1,
};


export const SOCIAL_TYPES = {
    GOOGLE: 1,
    FACEBOOK: 2,
    APPLE: 3,
    LINKEDIN: 4,
};