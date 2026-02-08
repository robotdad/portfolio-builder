import { z } from 'zod'

export const TAG_TYPES = ['employer', 'production', 'technique', 'year', 'role', 'material'] as const
export type TagType = typeof TAG_TYPES[number]

export const createTagSchema = z.object({
  portfolioId: z.string().min(1, 'Portfolio ID is required'),
  type: z.string().min(1, 'Tag type is required').refine(
    (val) => (TAG_TYPES as readonly string[]).includes(val),
    { message: `Tag type must be one of: ${TAG_TYPES.join(', ')}` }
  ),
  value: z.string().min(1, 'Tag value is required').max(100, 'Tag value must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').nullable().optional(),
})

export const updateTagSchema = z.object({
  value: z.string().min(1, 'Tag value is required').max(100, 'Tag value must be 100 characters or less').optional(),
  description: z.string().max(500, 'Description must be 500 characters or less').nullable().optional(),
})

export const setProjectTagsSchema = z.object({
  tagIds: z.array(z.string()),
})

export type CreateTagInput = z.infer<typeof createTagSchema>
export type UpdateTagInput = z.infer<typeof updateTagSchema>
export type SetProjectTagsInput = z.infer<typeof setProjectTagsSchema>
