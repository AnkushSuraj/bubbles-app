'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'google_id', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('users', 'facebook_id', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('users', 'apple_id', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('users', 'linkedin_id', {
            type: Sequelize.STRING,
            allowNull: true
        });
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'signup_type');
        await queryInterface.removeColumn('users', 'social_id');
    }
};