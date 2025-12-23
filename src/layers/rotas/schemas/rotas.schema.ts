import { z } from "zod";

const numberLike = z.union([z.number(), z.string()]);

export const schemaRotaProgresso = z
  .object({
    total: z.coerce.number().optional(),
    concluidos: z.coerce.number().optional(),
    em_andamento: z.coerce.number().optional(),
    reagendados: z.coerce.number().optional(),
    pendentes: z.coerce.number().optional(),
    percentual_conclusao: z.coerce.number().optional(),
  })
  .passthrough();

export const schemaRota = z
  .object({
    id: z.coerce.number(),
    codigo: z.coerce.number().optional(),
    tipo: z.string().optional(),
    data_inicio: z.string().optional(),
    data_fim: z.string().optional(),
    usuario: z.string().optional(),
    usuario_created: z.string().optional(),
    id_usuario: z.coerce.number().optional(),
    id_usuario_created: z.coerce.number().optional(),
    status: z.string().optional(),
    observacao: z.string().optional(),
    progresso: schemaRotaProgresso.optional(),
  })
  .passthrough();

export const schemaRotaResponse = z
  .object({
    message: z.string().optional(),
    total: z.coerce.number().optional(),
    page: z.coerce.number().optional(),
    itens: z.coerce.number().optional(),
    total_pages: z.coerce.number().optional(),
    data: z.array(schemaRota).default([]),
  })
  .passthrough();

export const schemaRotaFilters = z
  .object({
    page: z.coerce.number().optional(),
    itens: z.coerce.number().optional(),
    status: z.string().optional(),
    data_inicio: z.string().optional(),
    data_fim: z.string().optional(),
  })
  .passthrough();

export const schemaRoteiroEndereco = z
  .object({
    latitude: numberLike,
    longitude: numberLike,
    rua: z.string().optional(),
    numero: z.string().optional(),
    cidade: z.string().optional(),
    bairro: z.string().optional(),
    uf: z.string().optional(),
    cep: z.string().optional(),
  })
  .passthrough();

export const schemaRoteiroStatus = z
  .object({
    id: z.coerce.number().optional(),
    id_roteiro: z.coerce.number().optional(),
    status: z.string().optional(),
    id_usuario: z.coerce.number().optional(),
    usuario: z.string().optional(),
    observacao: z.string().optional(),
    created_at: z.string().optional(),
  })
  .passthrough();

export const schemaRoteiro = z
  .object({
    id: z.coerce.number(),
    id_rota: z.coerce.number().optional(),
    id_checkin: z.coerce.number().optional(),
    nome: z.string().optional(),
    codigo: z.coerce.number().optional(),
    sequencia: z.coerce.number().optional(),
    status: z.string().optional(),
    observacao: z.string().optional(),
    endereco: schemaRoteiroEndereco.optional(),
    srm_status_roteiro: z.array(schemaRoteiroStatus).optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .passthrough();

export const schemaRoteiroResponse = z
  .object({
    message: z.string().optional(),
    total: z.coerce.number().optional(),
    page: z.coerce.number().optional(),
    itens: z.coerce.number().optional(),
    total_pages: z.coerce.number().optional(),
    data: z.array(schemaRoteiro).default([]),
  })
  .passthrough();

export const schemaRoteiroFilters = z
  .object({
    id_rota: z.coerce.number().optional(),
    id_usuario: z.coerce.number().optional(),
    page: z.coerce.number().optional(),
    itens: z.coerce.number().optional(),
  })
  .passthrough();

export const schemaCreateRoteiroPayload = z
  .object({
    nome: z.string(),
    id_rota: z.coerce.number(),
    codigo: z.coerce.number(),
    id_checkin: z.coerce.number().optional(),
    endereco: z
      .object({
        latitude: numberLike,
        longitude: numberLike,
        rua: z.string().optional(),
        numero: z.string().optional(),
        cidade: z.string().optional(),
        bairro: z.string().optional(),
        uf: z.string().optional(),
      })
      .passthrough(),
    observacao: z.string().optional(),
    sequencia: z.coerce.number().optional(),
    status: z.string().optional(),
  })
  .passthrough();

export type Rota = z.infer<typeof schemaRota>;
export type RotaResponse = z.infer<typeof schemaRotaResponse>;
export type Roteiro = z.infer<typeof schemaRoteiro>;
export type RoteiroResponse = z.infer<typeof schemaRoteiroResponse>;
