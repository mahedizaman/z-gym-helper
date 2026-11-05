import { z } from 'zod';

export const AnnouncementTypeEnum = z.enum([
  'info',
  'update',
  'warning',
  'celebration',
  'alert',
  'feature',
]);

export type AnnouncementType = z.infer<typeof AnnouncementTypeEnum>;

/**
 * Client form submission schema.
 * Note: authorEmail and authorId are STRICTLY derived on the server from the admin session.
 * The client may write in only one language (Bangla or English) or both.
 */
export const CreateAnnouncementInputSchema = z
  .object({
    title: z.string().trim().max(100).optional().default(''),
    titleBn: z.string().trim().max(100).optional().default(''),
    content: z.string().trim().max(1000).optional().default(''),
    contentBn: z.string().trim().max(1000).optional().default(''),
    type: AnnouncementTypeEnum.default('info'),
    expiresAt: z.string().datetime().optional().nullable(),
  })
  .refine(
    (data) =>
      Boolean((data.title && data.title.length >= 2) || (data.titleBn && data.titleBn.length >= 2)),
    {
      message: 'Title is required in at least one language (Bangla or English)',
      path: ['titleBn'],
    }
  )
  .refine(
    (data) =>
      Boolean(
        (data.content && data.content.length >= 2) || (data.contentBn && data.contentBn.length >= 2)
      ),
    {
      message: 'Content is required in at least one language (Bangla or English)',
      path: ['contentBn'],
    }
  );

export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementInputSchema>;

/**
 * Server-side validated announcement payload with guaranteed fallback strings and session author.
 */
export interface ValidatedAnnouncementPayload {
  title: string;
  titleEn: string;
  titleBn: string;
  content: string;
  contentEn: string;
  bodyEn: string;
  contentBn: string;
  bodyBn: string;
  type: AnnouncementType;
  authorEmail: string;
  authorId?: string;
  expiresAt?: Date | null;
}
