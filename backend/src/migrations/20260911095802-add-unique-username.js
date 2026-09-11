'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('utenti', {
      fields: ['username'],
      type: 'unique',
      name: 'utenti_username_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('utenti', 'utenti_username_unique');
  },
};