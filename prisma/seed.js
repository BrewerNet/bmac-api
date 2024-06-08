const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const password = "password";
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userOne = await prisma.user.create({
    data: {
      email: "jd@example.com",
      username: "jd",
      first_name: "Jon",
      last_name: "Don",
      mobile_number: "0412345678",
      password: hashedPassword,
    },
  });

  const userTwo = await prisma.user.create({
    data: {
      email: "hp@example.com",
      username: "hp",
      first_name: "Harry",
      last_name: "Potter",
      middle_name: "James",
      mobile_number: "0412345679",
      password: hashedPassword,
    },
  });

  const userThree = await prisma.user.create({
    data: {
      email: "is0.jh25@gmail.com",
      username: "is0xjh25",
      first_name: "Jim",
      last_name: "Hsiao",
      middle_name: "",
      mobile_number: "0415863535",
      password: hashedPassword,
      active: true,
    },
  });

  console.log(`Created user ONE with id: ${userOne.id}`);
  console.log(`Created user TWO with id: ${userTwo.id}`);
  console.log(`Created user THREE with id: ${userThree.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
