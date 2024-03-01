'use strict';
import { Sequelize } from 'sequelize';
import get_db from '../config/db.js';
// import { Model } from 'sequelize';

const user = get_db.define('user', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    social_id: {
        type: Sequelize.STRING,
        allowNull: true
    },
    referrer_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
    },
    first_name: {
        type: Sequelize.STRING,
        allowNull: true
    },
    last_name: {
        type: Sequelize.STRING,
        allowNull: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true
    },
    email_otp: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    email_otp_expiry_time: {
        type: Sequelize.STRING,
        defaultValue: 0
    },
    email_verified: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true
    },
    country_code: {
        type: Sequelize.STRING,
        allowNull: true
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: true
    },
    phone_verification_token: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    otp_expiry_time: {
        type: Sequelize.STRING,
        defaultValue: 0
    },
    phone_verified: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    dob: {
        type: Sequelize.DATE,
        allowNull: true,
    },
    referral_code: {
        type: Sequelize.STRING,
        allowNull: true
    },
    signup_type: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    google_id: {
        type: Sequelize.STRING,
        allowNull: true
    },
    facebook_id: {
        type: Sequelize.STRING,
        allowNull: true
    },
    apple_id: {
        type: Sequelize.STRING,
        allowNull: true
    },
    linkedin_id: {
        type: Sequelize.STRING,
        allowNull: true
    },
    stripe_account_id: {
        type: Sequelize.STRING,
        allowNull: true
    },
    stripe_account_response: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    notifications: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    app_settings: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    blocked_reason: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    flags: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0
    },
    status: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    created_at: {
        allowNull: false,
        type: Sequelize.DATE
    },
    updated_at: {
        allowNull: false,
        type: Sequelize.DATE
    },
    deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
    },
});

export default user;