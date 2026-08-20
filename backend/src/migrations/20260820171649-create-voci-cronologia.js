'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('voci_cronologia', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      descrizione: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      issueId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'issues',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      autoreId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'utenti',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('voci_cronologia');
  },
};