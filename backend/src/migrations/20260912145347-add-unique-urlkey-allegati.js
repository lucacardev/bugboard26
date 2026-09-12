'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint('allegati', {
      fields: ['urlKey'],
      type: 'unique',
      name: 'allegati_urlkey_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('allegati', 'allegati_urlkey_unique');
  },
};
