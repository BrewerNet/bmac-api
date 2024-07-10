import { PrismaClient, Profile } from "@prisma/client";
import { HttpErrorMiddleware } from "../middlewares/HttpErrorMiddleware";

const prisma = new PrismaClient();

export async function createProfile(userId: number): Promise<Profile | null> {
  const createdTime = new Date();

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User does not exist");
  }

  const existingProfile = await prisma.profile.findFirst({
    where: {
      user_id: userId,
    },
  });

  if (existingProfile) {
    return null;
  }

  const newProfile = await prisma.profile.create({
    data: {
      resume: { info: "null" },
      avatar: "null",
      self_intro: "null",
      city: "null",
      country: "null",
      suburb: "null",
      geocode: "null",
      created_at: createdTime,
      updated_at: createdTime,
      user: {
        connect: { id: userId },
      },
    },
  });

  return newProfile;
}

export async function updateProfile(
  id: number,
  data: Partial<Profile>
): Promise<Profile | null> {
  const existingProfile = await prisma.profile.findFirst({
    where: { id: id },
  });
  if (!existingProfile) {
    console.log("Profile not found");
    throw new HttpErrorMiddleware("Profile not found", 404);
  }
  return await prisma.profile.update({
    where: { id: id },
    data: data,
  });
}
