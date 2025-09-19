import { z } from "zod";

// Basic PDU Schema - adjust as needed
export const PduSchema = z.object({
  pduId: z.number(),
  name: z.string(),
  // Add other PDU-specific fields here
});

// Example for a response schema
export const PduResponseSchema = PduSchema;

// Example for a request body schema
export const CreatePduSchema = PduSchema.omit({ pduId: true });
