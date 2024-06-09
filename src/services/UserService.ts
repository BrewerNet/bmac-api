import { PrismaClient, User } from "@prisma/client";
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

export async function getUserById(id: number): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id },
  });
}

export async function getAllUsers(): Promise<User[]> {
  const allUsers = await prisma.user.findMany();
  return allUsers;
}

export async function updateUser(
  id: number,
  newData: Partial<User>
): Promise<User | null> {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    console.log("User not found, cannot update.");
    return null;
  }

  if (newData.password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newData.password, salt);
    newData.password = hashedPassword;
  }

  return await prisma.user.update({
    where: { id },
    data: newData,
  });
}

export async function deleteUser(id: number): Promise<User | null> {
  return await prisma.user.delete({
    where: { id },
  });
}
