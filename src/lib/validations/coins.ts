import { z } from "zod";

export const createCoinRuleSchema = z.object({
  name: z.string().min(2, "Qoida nomi kamida 2ta harf bo'lishi kerak"),
  description: z.string().min(5, "Izoh kamida 5ta harf bo'lishi kerak"),
  coin_amount: z.coerce.number().refine((val) => val !== 0, "Coin miqdori 0 bo'lishi mumkin emas"),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional().default("ACTIVE"),
});

export type CreateCoinRuleInput = z.infer<typeof createCoinRuleSchema>;

export const updateCoinRuleSchema = z.object({
  name: z.string().min(2, "Qoida nomi kamida 2ta harf bo'lishi kerak"),
  description: z.string().min(5, "Izoh kamida 5ta harf bo'lishi kerak"),
  coin_amount: z.coerce.number().refine((val) => val !== 0, "Coin miqdori 0 bo'lishi mumkin emas"),
});

export type UpdateCoinRuleInput = z.infer<typeof updateCoinRuleSchema>;
