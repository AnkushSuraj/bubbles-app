// db.js
import { Sequelize } from 'sequelize';
import config from './config.js';

const connection = new Sequelize(config.development);

// Test the connection
try {
    await connection.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error.message);
}

export const get_db = connection.config;

export default connection