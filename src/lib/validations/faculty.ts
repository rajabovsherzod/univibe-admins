import { z } from "zod";

export const CreateFacultySchema = z.object({
  name: z.string().min(2, { message: "Fakultet nomi eng kamida 2 ta harfdan iborat bo'lishi kerak." }),
});

export type CreateFacultyInput = z.infer<typeof CreateFacultySchema>;

export const UpdateFacultySchema = z.object({
  name: z.string().min(2, { message: "Fakultet nomi eng kamida 2 ta harfdan iborat bo'lishi kerak." }),
});

export type UpdateFacultyInput = z.infer<typeof UpdateFacultySchema>;
