import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById (id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByUsername (username: User["username"]) {
  return prisma.user.findUnique({ where: { username } });
}

export async function createUser (username: User["username"], password: string) {
  return prisma.user.create({
    data: {
      username,
      hashedPassword: await bcrypt.hash(password, 10),
    },
  });
}

export async function deleteUserByEmail (username: User["username"]) {
  return prisma.user.delete({ where: { username } });
}

export async function verifyCredentials (userId: number, password: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    return undefined;
  }

  const isValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isValid) {
    return undefined;
  }

  const { hashedPassword, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function verifyLogin (username: User["username"], password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    user.hashedPassword
  );
  if (!isValid) {
    return null;
  }

  const { hashedPassword, ...userWithoutPassword } = user;

  return userWithoutPassword;
}
