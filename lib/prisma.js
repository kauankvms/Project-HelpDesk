const { PrismaClient } = require("@prisma/client");

// Cria uma única instância do PrismaClient para toda a aplicação
const prisma = new PrismaClient();

module.exports = prisma;
