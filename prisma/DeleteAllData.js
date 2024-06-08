const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Add the names of all your models here
  const deletePromises = [
    prisma.message.deleteMany(),
    prisma.chat.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.post.deleteMany(),
    prisma.availableTime.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.userHashTag.deleteMany(),
    prisma.hashTag.deleteMany(),
    prisma.user.deleteMany(),
  ];

  await Promise.all(deletePromises);

  console.log("All data deleted");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
