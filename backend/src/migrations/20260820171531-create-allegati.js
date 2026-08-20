'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('allegati', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      urlKey: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nomeFile: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tipoMime: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dimensione: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('allegati');
  },
};