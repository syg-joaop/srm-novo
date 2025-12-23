import { z } from "zod";

export const schemaProspectoItem = z
  .object({
    codpros: z.union([z.string(), z.number()]).optional(),
    prospecto: z.string().optional(),
    fanta: z.string().optional(),
    status: z.string().optional(),
    cidade: z.string().optional(),
    uf: z.string().optional(),
    celular: z.string().optional(),
    tel3: z.string().optional(),
    data: z.string().optional(),
    fone: z.string().optional(),
    email: z.string().optional(),
    ende: z.string().optional(),
    categoria: z.string().optional(),
    oco2: z.string().optional(),
    tf: z.string().optional(),
    comp: z.string().optional(),
    ultima_interacao: z.string().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    latlong: z.boolean().optional(),
  })
  .passthrough();

export const schemaProspectoResponse = z
  .object({
    status: z.coerce.number().optional(),
    message: z.string().optional(),
    success: z.boolean().optional(),
    data: z.object({
      page: z.coerce.number().optional(),
      size: z.coerce.number().optional(),
      totalItems: z.coerce.number().optional(),
      totalPages: z.coerce.number().optional(),
      items: z.array(schemaProspectoItem).default([]),
    }),
  })
  .passthrough();

export type ProspectoResponse = z.infer<typeof schemaProspectoResponse>;
