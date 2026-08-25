'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('utenti', 'nome', 'username');
    await queryInterface.addColumn('utenti', 'ruolo', {
      type: Sequelize.ENUM('normale', 'amministratore'),
      allowNull: false,
      defaultValue: 'normale',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('utenti', 'ruolo');
    await queryInterface.renameColumn('utenti', 'username', 'nome');
  },
};