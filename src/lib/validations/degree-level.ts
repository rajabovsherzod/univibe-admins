import * as z from "zod";

export const CreateDegreeLevelSchema = z.object({
  name: z.string().min(2, { message: "Nomi eng kamida 2 ta harfdan iborat bo'lishi kerak." }),
});

export const UpdateDegreeLevelSchema = z.object({
  name: z.string().min(2, { message: "Nomi eng kamida 2 ta harfdan iborat bo'lishi kerak." }),
});

export type CreateDegreeLevelInput = z.infer<typeof CreateDegreeLevelSchema>;
export type UpdateDegreeLevelInput = z.infer<typeof UpdateDegreeLevelSchema>;
