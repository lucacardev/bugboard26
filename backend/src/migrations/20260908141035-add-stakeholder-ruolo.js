'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Postgres non permette di aggiungere un valore a un tipo ENUM tramite
    // l'API standard di Sequelize (addColumn/changeColumn ricreerebbe il tipo
    // perdendo i dati esistenti): serve un ALTER TYPE diretto.
    // Nota: ALTER TYPE ... ADD VALUE non può essere eseguito nella stessa
    // transazione di un utilizzo successivo del nuovo valore, ma può essere
    // eseguito da solo, come qui.
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_utenti_ruolo" ADD VALUE IF NOT EXISTS 'stakeholder';`
    );
  },

  async down(queryInterface, Sequelize) {
    // Postgres non supporta la rimozione di un valore da un ENUM esistente.
    // Un rollback completo richiederebbe ricreare il tipo da zero (operazione
    // distruttiva sui dati); non implementato deliberatamente.
    throw new Error(
      'Rollback non supportato: Postgres non permette di rimuovere un valore da un ENUM esistente.'
    );
  },
};