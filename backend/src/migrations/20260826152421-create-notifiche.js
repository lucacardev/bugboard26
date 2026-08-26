'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifiche', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      utenteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'utenti', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      messaggio: { type: Sequelize.TEXT, allowNull: false },
      letta: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      issueId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'issues', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notifiche');
  },
};