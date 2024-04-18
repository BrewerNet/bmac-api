const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("secret", 10);

  const userOne = await prisma.user.create({
    data: {
      email: "jd@example.com",
      username: "jd",
      firstName: "Jon",
      lastName: "Don",
      password: hashedPassword,
    },
  });

  const userTwo = await prisma.user.create({
    data: {
      email: "hp@example.com",
      username: "hp",
      firstName: "Harry",
      lastName: "Potter",
      middleName: "James",
      password: hashedPassword,
    },
  });

  console.log(`Created user ONE with id: ${userOne.id}`);
  console.log(`Created user TWO with id: ${userTwo.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
