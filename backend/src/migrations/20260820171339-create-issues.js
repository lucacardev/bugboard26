'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('issues', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tipo: {
        type: Sequelize.ENUM('bug', 'question', 'documentation', 'feature'),
        allowNull: false,
      },
      titolo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      descrizione: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      stato: {
        type: Sequelize.ENUM('todo', 'in_progress', 'done'),
        allowNull: false,
        defaultValue: 'todo',
      },
      priorita: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dataInizio: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      dataScadenza: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      progettoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'progetti',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      segnalatoreId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'utenti',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      assegnatarioId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'utenti',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.dropTable('issues');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_issues_tipo";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_issues_stato";');
  },
};
