import { z } from "zod";

export const CreateYearLevelSchema = z.object({
  name: z.string().min(2, { message: "Kurs nomi eng kamida 2 ta harfdan iborat bo'lishi kerak." }),
  year_number: z.coerce.number().min(1, { message: "Kurs raqami eng kamida 1 bo'lishi kerak." }),
});

export type CreateYearLevelInput = z.infer<typeof CreateYearLevelSchema>;

export const UpdateYearLevelSchema = z.object({
  name: z.string().min(2, { message: "Kurs nomi eng kamida 2 ta harfdan iborat bo'lishi kerak." }),
  year_number: z.coerce.number().min(1, { message: "Kurs raqami eng kamida 1 bo'lishi kerak." }),
});

export type UpdateYearLevelInput = z.infer<typeof UpdateYearLevelSchema>;
