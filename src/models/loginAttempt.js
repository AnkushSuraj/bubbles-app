'use strict';
import { Sequelize } from 'sequelize';
import get_db from '../config/db.js';
// import { Model } from 'sequelize';

const loginAttempt = get_db.define('login_attempts', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    bubbler_id: {
        type: Sequelize.STRING,
        allowNull: true
    },
    access_token: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    device_token: {
        type: Sequelize.STRING,
        allowNull: true
    },
    access_expiry: {
        type: Sequelize.STRING,
        allowNull: false
    },
    last_login_ip: {
        type: Sequelize.STRING,
        allowNull: true
    },
    user_agent: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    country: {
        type: Sequelize.STRING,
        allowNull: true
    },
    country_code: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    city: {
        type: Sequelize.STRING,
        allowNull: true
    },
    zip_code: {
        type: Sequelize.STRING,
        allowNull: true
    },
    latitude: {
        type: Sequelize.STRING,
        allowNull: true
    },
    longitude: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    created_at: {
        allowNull: false,
        type: Sequelize.DATE
    },
    updated_at: {
        allowNull: false,
        type: Sequelize.DATE
    }
});

export default loginAttempt;