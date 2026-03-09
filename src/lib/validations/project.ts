import { z } from 'zod'

export const createProjectSchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  year: z.string().max(20, 'Year must be 20 characters or less').optional(),
  venue: z.string().max(200, 'Venue must be 200 characters or less').optional(),
  organization: z.string().max(200, 'Organization must be 200 characters or less').optional(),
  location: z.string().max(200, 'Location must be 200 characters or less').optional(),
  role: z.string().max(200, 'Role must be 200 characters or less').optional(),
  description: z.string().max(5000, 'Description must be 5000 characters or less').optional(),
  isFeatured: z.boolean().optional(),
  featuredImageId: z.string().optional(),
})

export const updateProjectSchema = z.object({
  categoryId: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less').optional(),
  year: z.string().max(20, 'Year must be 20 characters or less').nullable().optional(),
  venue: z.string().max(200, 'Venue must be 200 characters or less').nullable().optional(),
  organization: z.string().max(200, 'Organization must be 200 characters or less').nullable().optional(),
  location: z.string().max(200, 'Location must be 200 characters or less').nullable().optional(),
  role: z.string().max(200, 'Role must be 200 characters or less').nullable().optional(),
  description: z.string().max(5000, 'Description must be 5000 characters or less').nullable().optional(),
  draftContent: z.string().nullable().optional(),
  publishedContent: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  featuredImageId: z.string().nullable().optional(),
})

export const reorderProjectsSchema = z.object({
  projectIds: z.array(z.string()).min(1, 'At least one project ID is required'),
})

export const addProjectImagesSchema = z.object({
  assetIds: z.array(z.string()).min(1, 'At least one asset ID is required'),
})

export const reorderProjectImagesSchema = z.object({
  assetIds: z.array(z.string()).min(1, 'At least one asset ID is required'),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type ReorderProjectsInput = z.infer<typeof reorderProjectsSchema>
export type AddProjectImagesInput = z.infer<typeof addProjectImagesSchema>
export type ReorderProjectImagesInput = z.infer<typeof reorderProjectImagesSchema>
