'use strict';

const { faker } = require('@faker-js/faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const vinyls = Array.from({ length: 50 }).map(() => ({
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      artist: faker.person.fullName(),
      description: faker.lorem.paragraph(),
      price: faker.commerce.price(10, 100, 2),
      image: faker.image.url(),
      createdAt: new Date(),  
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('vinyls', vinyls, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('vinyls', null, {});
  },
};
