import { z } from "zod";

export const createCoinRuleSchema = z.object({
  name: z.string().min(2, "Qoida nomi kamida 2ta harf bo'lishi kerak"),
  description: z.string().min(5, "Izoh kamida 5ta harf bo'lishi kerak"),
  coin_amount: z.coerce.number().min(1, "Coin miqdori kamida 1 bo'lishi kerak"),
  allowed_job_position_public_ids: z
    .array(z.string())
    .min(1, "Kamida bitta lavozim tanlanishi shart"),
});

export type CreateCoinRuleInput = z.infer<typeof createCoinRuleSchema>;

export const updateCoinRuleSchema = z.object({
  name: z.string().min(2, "Qoida nomi kamida 2ta harf bo'lishi kerak"),
  description: z.string().min(5, "Izoh kamida 5ta harf bo'lishi kerak"),
  allowed_job_position_public_ids: z
    .array(z.string())
    .min(1, "Kamida bitta lavozim tanlanishi shart"),
});

export type UpdateCoinRuleInput = z.infer<typeof updateCoinRuleSchema>;
