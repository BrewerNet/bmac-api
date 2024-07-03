const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const password = "password";
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "jd@example.com",
        username: "jd",
        first_name: "Jon",
        last_name: "Don",
        mobile_number: "0412345678",
        password: hashedPassword,
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "hp@example.com",
        username: "hp",
        first_name: "Harry",
        last_name: "Potter",
        middle_name: "James",
        mobile_number: "0412345679",
        password: hashedPassword,
        active: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "lj@example.com",
        username: "lj",
        first_name: "Lara",
        last_name: "Jones",
        mobile_number: "0412345680",
        password: hashedPassword,
        active: true,
      },
    }),
  ]);

  console.log("Created users");

  // Create Hashtags
  const hashtags = await Promise.all([
    prisma.hashTag.create({
      data: {
        name: "technology",
      },
    }),
    prisma.hashTag.create({
      data: {
        name: "innovation",
      },
    }),
    prisma.hashTag.create({
      data: {
        name: "science",
      },
    }),
  ]);

  console.log("Created hashtags");

  // Link Users and Hashtags
  await prisma.$transaction([
    prisma.user.update({
      where: { id: users[0].id },
      data: {
        hashtags: { connect: [{ id: hashtags[0].id }, { id: hashtags[1].id }] },
      },
    }),
    prisma.user.update({
      where: { id: users[1].id },
      data: {
        hashtags: { connect: [{ id: hashtags[0].id }, { id: hashtags[2].id }] },
      },
    }),
    prisma.user.update({
      where: { id: users[2].id },
      data: {
        hashtags: { connect: [{ id: hashtags[1].id }, { id: hashtags[2].id }] },
      },
    }),
  ]);

  console.log("Linked users with hashtags");

  // Create Profiles
  const profiles = await Promise.all([
    prisma.profile.create({
      data: {
        user_id: users[0].id,
        self_intro: "Hello, I'm Jon.",
        city: "Melbourne",
        country: "Australia",
      },
    }),
    prisma.profile.create({
      data: {
        user_id: users[1].id,
        self_intro: "Hello, I'm Harry.",
        city: "Melbourne",
        country: "Australia",
      },
    }),
    prisma.profile.create({
      data: {
        user_id: users[2].id,
        self_intro: "Hello, I'm Lara.",
        city: "Sydney",
        country: "Australia",
      },
    }),
  ]);

  console.log("Created profiles");

  // Create Available Times
  const availableTimes = await Promise.all([
    prisma.availableTime.create({
      data: {
        profile_id: profiles[0].id,
        start_time: new Date("2024-07-01T09:00:00Z"),
        end_time: new Date("2024-07-01T17:00:00Z"),
      },
    }),
    prisma.availableTime.create({
      data: {
        profile_id: profiles[1].id,
        start_time: new Date("2024-07-02T09:00:00Z"),
        end_time: new Date("2024-07-02T17:00:00Z"),
      },
    }),
    prisma.availableTime.create({
      data: {
        profile_id: profiles[2].id,
        start_time: new Date("2024-07-03T09:00:00Z"),
        end_time: new Date("2024-07-03T17:00:00Z"),
      },
    }),
  ]);

  console.log("Created available times");

  // Create Posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        user_id: users[0].id,
        content: {
          text: "This is my first post!",
        },
      },
    }),
    prisma.post.create({
      data: {
        user_id: users[1].id,
        content: {
          text: "Hello world!",
        },
      },
    }),
    prisma.post.create({
      data: {
        user_id: users[2].id,
        content: {
          text: "Loving the new features!",
        },
      },
    }),
  ]);

  console.log("Created posts");

  // Create Comments
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        user_id: users[1].id,
        post_id: posts[0].id,
        content: {
          text: "Great post!",
        },
      },
    }),
    prisma.comment.create({
      data: {
        user_id: users[0].id,
        post_id: posts[1].id,
        content: {
          text: "Thanks for sharing!",
        },
      },
    }),
    prisma.comment.create({
      data: {
        user_id: users[2].id,
        post_id: posts[0].id,
        content: {
          text: "Interesting!",
        },
      },
    }),
  ]);

  console.log("Created comments");

  // Create Chats
  const chats = await Promise.all([
    prisma.chat.create({
      data: {
        users: {
          connect: [{ id: users[0].id }, { id: users[1].id }],
        },
      },
    }),
    prisma.chat.create({
      data: {
        users: {
          connect: [{ id: users[1].id }, { id: users[2].id }],
        },
      },
    }),
    prisma.chat.create({
      data: {
        users: {
          connect: [{ id: users[0].id }, { id: users[2].id }],
        },
      },
    }),
  ]);

  console.log("Created chats");

  // Create Messages
  await prisma.message.createMany({
    data: [
      {
        chat_id: chats[0].id,
        sender_id: users[0].id,
        content: {
          text: "Hello Harry!",
        },
      },
      {
        chat_id: chats[0].id,
        sender_id: users[1].id,
        content: {
          text: "Hi Jon!",
        },
      },
      {
        chat_id: chats[1].id,
        sender_id: users[1].id,
        content: {
          text: "Hello Lara!",
        },
      },
      {
        chat_id: chats[1].id,
        sender_id: users[2].id,
        content: {
          text: "Hi Harry!",
        },
      },
      {
        chat_id: chats[2].id,
        sender_id: users[0].id,
        content: {
          text: "Hello Lara!",
        },
      },
      {
        chat_id: chats[2].id,
        sender_id: users[2].id,
        content: {
          text: "Hi Jon!",
        },
      },
    ],
  });

  console.log("Created messages");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
