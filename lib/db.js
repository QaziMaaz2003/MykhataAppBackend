// Prisma is already initialized in lib/prisma.js
// This module exists for backward compatibility
// Use 'import { prisma } from "./prisma.js"' in your endpoints instead

export const connectDB = async () => {
  // Prisma automatically handles connections
  // No explicit connection needed
  return true;
};
