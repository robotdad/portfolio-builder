import { z } from 'zod'

export const createCategorySchema = z.object({
  portfolioId: z.string().min(1, 'Portfolio ID is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  featuredImageId: z.string().optional(),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less').optional(),
  description: z.string().max(500, 'Description must be 500 characters or less').nullable().optional(),
  order: z.number().int().min(0).optional(),
  featuredImageId: z.string().nullable().optional(),
})

export const reorderCategoriesSchema = z.object({
  categoryIds: z.array(z.string()).min(1, 'At least one category ID is required'),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>
