import { z } from "zod";

export const updateStudentSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 harf bo'lishi kerak"),
  surname: z.string().min(2, "Familiya kamida 2 harf bo'lishi kerak"),
  middle_name: z.string().min(2, "Otasining ismi kamida 2 harf bo'lishi kerak"),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "To'g'ri sana formatini kiriting (YYYY-MM-DD)"),
  university_student_id: z.string().min(1, "Talaba ID talab qilinadi"),
  faculty_id: z.string().uuid("Fakultet tanlanishi shart"),
  degree_level_id: z.string().uuid("Ta'lim darajasi tanlanishi shart"),
  year_level_id: z.string().uuid("Kurs tanlanishi shart"),
  contact_phone_number: z.string().regex(/^\+?[0-9\s()-]+$/, "Telefon raqam noto'g'ri formatda"),
  profile_photo: z.instanceof(File).optional().nullable(),
});

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
