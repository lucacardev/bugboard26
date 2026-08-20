'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('etichette', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      testo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      colore: {
        type: Sequelize.STRING,
        allowNull: false,
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('etichette', ['progettoId', 'testo'], {
      unique: true,
      name: 'etichette_progetto_testo_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('etichette');
  },
};