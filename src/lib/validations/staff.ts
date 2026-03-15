import { z } from "zod";

export const createStaffSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 harf bo'lishi kerak"),
  surname: z.string().min(2, "Familiya kamida 2 harf bo'lishi kerak"),
  email: z.string().email("Email noto'g'ri formatda"),
  job_position_public_id: z
    .string()
    .uuid("Lavozim tanlanishi shart"),
  password: z
    .string()
    .min(8, "Parol kamida 8 belgidan iborat bo'lishi kerak")
    .optional()
    .or(z.literal("")),
  profile_photo: z.instanceof(File).optional().nullable(),
});

// Update schema - password not required, photo is optional
export const updateStaffSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 harf bo'lishi kerak"),
  surname: z.string().min(2, "Familiya kamida 2 harf bo'lishi kerak"),
  job_position_public_id: z
    .string()
    .uuid("Lavozim tanlanishi shart"),
  profile_photo: z.instanceof(File).optional().nullable(),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
