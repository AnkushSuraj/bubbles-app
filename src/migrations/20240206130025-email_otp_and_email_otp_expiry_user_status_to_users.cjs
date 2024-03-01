'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'phone_verified', {
      type: Sequelize.INTEGER,
      allowNull: true,
      default: 0
    });
    await queryInterface.addColumn('users', 'email_otp', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'email_otp_expiry_time', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'email_verified', {
      type: Sequelize.INTEGER,
      allowNull: true,
      default: 0
    });
    await queryInterface.addColumn('users', 'status', {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        isIn: [['0', '1']]
      }
    });
    
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('phone_verified', 'email_otp', 'email_otp_expiry_time', 'email_verified', 'status');
  }
};
