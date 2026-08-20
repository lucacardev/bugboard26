'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('issue_etichette', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      etichettaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'etichette',
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

    await queryInterface.addIndex('issue_etichette', ['issueId', 'etichettaId'], {
      unique: true,
      name: 'issue_etichette_issue_etichetta_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('issue_etichette');
  },
};