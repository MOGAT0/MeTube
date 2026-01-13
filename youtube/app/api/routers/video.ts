import { z } from "zod";
import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/trpc/init";
import { videoReactions, videos, users,videoViews } from "@/db/schema";
import { eq, and, count, desc, or, ilike } from "drizzle-orm";
import { db } from "@/db";

export const videoRouter = createTRPCRouter({
  getAll: baseProcedure.query(async ({ ctx }) => {
    return await db.select().from(videos);
  }),

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
  
  getLikeStatus: baseProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {

      const [likes] = await db
        .select({ value: count() })
        .from(videoReactions)
        .where(and(
          eq(videoReactions.videoId, input.videoId),
          eq(videoReactions.type, "like")
        ));

      let viewerReaction = null;
      if (ctx.clerkUserId) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, ctx.clerkUserId));

        if (user) {
          const [reaction] = await db
            .select()
            .from(videoReactions)
            .where(and(
               eq(videoReactions.videoId, input.videoId),
               eq(videoReactions.userId, user.id)
            ));
          viewerReaction = reaction?.type;
        }
      }

      return {
        likeCount: likes?.value || 0,
        viewerReaction: viewerReaction as "like" | "dislike" | null
      };
    }),

  toggleLike: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id; 

      const [existing] = await db
        .select()
        .from(videoReactions)
        .where(and(
          eq(videoReactions.videoId, input.videoId),
          eq(videoReactions.userId, userId)
        ));

      if (existing) {
        if (existing.type === "like") {
          await db.delete(videoReactions)
            .where(and(
              eq(videoReactions.userId, userId),
              eq(videoReactions.videoId, input.videoId)
            ));
          return { status: "removed" };
        } else {
          await db.update(videoReactions)
            .set({ type: "like" })
            .where(and(
              eq(videoReactions.userId, userId),
              eq(videoReactions.videoId, input.videoId)
            ));
          return { status: "updated" };
        }
      } else {
        await db.insert(videoReactions).values({
          userId,
          videoId: input.videoId,
          type: "like",
        });
        return { status: "created" };
      }
    }),

  getLiked:protectedProcedure.query(async ({ ctx }) => {
    const data = await db
      .select({
        video: videos, // Return the full video object
        likedAt: videoReactions.createdAt,
      })
      .from(videoReactions)
      .innerJoin(videos, eq(videoReactions.videoId, videos.id)) // Join tables
      .where(and(
        eq(videoReactions.userId, ctx.user.id), // Filter by User
        eq(videoReactions.type, "like")         // Filter by 'like' type
      ))
      .orderBy(desc(videoReactions.createdAt)); // Newest likes first

    // Flatten the result to just return the video data
    return data.map((item) => ({
      ...item.video,
      likedAt: item.likedAt,
    }));
  }),

logView: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await db.insert(videoViews)
        .values({
          userId: ctx.user.id,
          videoId: input.videoId,
          viewedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [videoViews.userId, videoViews.videoId], // If PK exists...
          set: { viewedAt: new Date() }, // ...update the timestamp
        });
    }),

  // NEW: Fetch watch history
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const data = await db
      .select({
        video: videos,
        viewedAt: videoViews.viewedAt,
      })
      .from(videoViews)
      .innerJoin(videos, eq(videoViews.videoId, videos.id)) // Join tables
      .where(eq(videoViews.userId, ctx.user.id))            // Filter by current user
      .orderBy(desc(videoViews.viewedAt));                  // Most recent first

    // Flatten result
    return data.map((item) => ({
      ...item.video,
      viewedAt: item.viewedAt,
    }));
  }),

search: baseProcedure
    .input(z.object({ 
        q: z.string().min(1),
        limit: z.number().min(1).max(100).default(50)
    }))
    .query(async ({ input }) => {
      // Perform case-insensitive search on Title AND Description
      const results = await db
        .select()
        .from(videos)
        .where(
            or(
                ilike(videos.title, `%${input.q}%`),
                ilike(videos.desc, `%${input.q}%`)
            )
        )
        .orderBy(desc(videos.id)) // Optional: order by newest
        .limit(input.limit);

      return results;
    }),  

  updateMetadata: baseProcedure
    .input(z.object({ 
      id: z.string().uuid(), 
      title: z.string().optional(), 
      desc: z.string().optional(),
      thumbnail: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const updateData: Record<string, string> = {};

      if (input.title) updateData.title = input.title;
      if (input.desc) updateData.desc = input.desc;
      if (input.thumbnail) updateData.thumbnail = input.thumbnail;

      if (Object.keys(updateData).length > 0) {
        await db.update(videos)
          .set(updateData)
          .where(eq(videos.id, input.id));
      }
    }),

});