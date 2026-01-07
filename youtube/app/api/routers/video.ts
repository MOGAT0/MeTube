import { z } from "zod"; // For input validation
import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/trpc/init";
import { videos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db"

export const videoRouter = createTRPCRouter({
  getAll: baseProcedure.query(async ({ ctx }) => {
    return await db.select().from(videos);
  }),

  // Fetch a single video by ID
  getById: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [video] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, input.id))
        .limit(1);
      
      return video || null;
    }),
});