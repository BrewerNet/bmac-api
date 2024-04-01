import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export async function createUser(email: string, name: string): Promise<User> {
  return await prisma.user.create({
    data: {
      email,
      name,
    },
  });
}

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
