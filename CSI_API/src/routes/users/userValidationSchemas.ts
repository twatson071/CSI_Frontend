import { z } from "zod";

// Basic User Schema - adjust as needed
export const UserSchema = z.object({
  userId: z.number(),
  name: z.string(), // Changed from username
  email: z.string().email(),
  roleId: z.number().optional(), // Added roleId
  // passwordHash should generally not be sent in responses
});

// Example for a response schema
export const UserResponseSchema = UserSchema;

// Example for a request body schema
export const CreateUserSchema = z.object({
  name: z.string(), // Changed from username
  email: z.string().email(),
  passwordHash: z.string(), // Added passwordHash
  roleId: z.number().optional(), // Added roleId
});

export const UpdateUserSchema = CreateUserSchema.partial(); // Schema for updates
