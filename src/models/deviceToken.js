'use strict';
import { Sequelize } from 'sequelize';
import get_db from '../config/db.js';
// import { Model } from 'sequelize';

const deviceToken = get_db.define('device_tokens', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
    },
    device_token_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: true
    },
    bubbler_id: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    token: {
        type: Sequelize.TEXT,
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

export default deviceToken;