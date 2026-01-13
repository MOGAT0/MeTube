import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { playlists, playlistVideos, videos } from "@/db/schema";
import { eq, and, desc,sql } from "drizzle-orm";
import { db } from "@/db";
import { TRPCError } from "@trpc/server";

export const playlistRouter = createTRPCRouter({
  // 1. Get all playlists for the current user (and check if videoId is in them)
  getPlaylistsForUser: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userPlaylists = await db
        .select()
        .from(playlists)
        .where(eq(playlists.userId, ctx.user.id));

      // For each playlist, check if the video is already in it
      const results = await Promise.all(userPlaylists.map(async (pl) => {
        const [exists] = await db
          .select()
          .from(playlistVideos)
          .where(and(
            eq(playlistVideos.playlistId, pl.id),
            eq(playlistVideos.videoId, input.videoId)
          ));
        return { ...pl, containsVideo: !!exists };
      }));

      return results;
    }),

  // 2. Create a new playlist
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [newPlaylist] = await db.insert(playlists).values({
        userId: ctx.user.id,
        name: input.name,
      }).returning();
      return newPlaylist;
    }),

  // 3. Toggle video in playlist (Add/Remove)
  toggleVideo: protectedProcedure
    .input(z.object({ playlistId: z.string().uuid(), videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Security check: ensure playlist belongs to user
      const [playlist] = await db
        .select()
        .from(playlists)
        .where(and(
            eq(playlists.id, input.playlistId),
            eq(playlists.userId, ctx.user.id)
        ));

      if (!playlist) throw new Error("Playlist not found");

      const [existing] = await db
        .select()
        .from(playlistVideos)
        .where(and(
          eq(playlistVideos.playlistId, input.playlistId),
          eq(playlistVideos.videoId, input.videoId)
        ));

      if (existing) {
        await db.delete(playlistVideos)
          .where(and(
            eq(playlistVideos.playlistId, input.playlistId),
            eq(playlistVideos.videoId, input.videoId)
          ));
        return { status: "removed" };
      } else {
        await db.insert(playlistVideos).values({
          playlistId: input.playlistId,
          videoId: input.videoId,
        });
        return { status: "added" };
      }
    }),

// 1. Get All Playlists (For Library Page)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Fetch playlists with a count of videos inside
    const data = await db
      .select({
        id: playlists.id,
        name: playlists.name,
        updatedAt: playlists.updatedAt,
        videoCount: sql<number>`count(${playlistVideos.videoId})`.mapWith(Number), // SQL aggregation
      })
      .from(playlists)
      .leftJoin(playlistVideos, eq(playlists.id, playlistVideos.playlistId))
      .where(eq(playlists.userId, ctx.user.id))
      .groupBy(playlists.id)
      .orderBy(desc(playlists.updatedAt));

    return data;
  }),

  // 2. Get Single Playlist Details (For "When Clicked")
  getDetails: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // a. Get Playlist Info
      const [playlist] = await db
        .select()
        .from(playlists)
        .where(and(
          eq(playlists.id, input.id),
          eq(playlists.userId, ctx.user.id)
        ));

      if (!playlist) throw new TRPCError({ code: "NOT_FOUND" });

      // b. Get Videos in that Playlist
      const videosInPlaylist = await db
        .select({
          video: videos,
          addedAt: playlistVideos.createdAt
        })
        .from(playlistVideos)
        .innerJoin(videos, eq(playlistVideos.videoId, videos.id))
        .where(eq(playlistVideos.playlistId, input.id))
        .orderBy(desc(playlistVideos.createdAt)); // Newest added first

      return { 
        playlist, 
        videos: videosInPlaylist.map(v => ({ ...v.video, addedAt: v.addedAt })) 
      };
    }),


});