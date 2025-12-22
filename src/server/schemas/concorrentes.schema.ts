import { z } from "zod";

export const schemaPaginatedConcorrenteResponse = z
  .object({
    status: z.coerce.number().optional(),
    message: z.string().optional(),
    success: z.boolean().optional(),
    data: z.object({
      page: z.coerce.number().optional(),
      size: z.coerce.number().optional(),
      totalItems: z.coerce.number().optional(),
      totalPages: z.coerce.number().optional(),
      items: z.array(z.unknown()).default([]),
    }),
  })
  .passthrough();

export type PaginatedConcorrenteResponse = z.infer<typeof schemaPaginatedConcorrenteResponse>;
