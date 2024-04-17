const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("secret", 10);

  const user = await prisma.user.create({
    data: {
      email: "johndoe@example.com",
      username: "johndoe",
      name: "John Doe",
      password: hashedPassword,
    },
  });

  console.log(`Created user with id: ${user.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
