import { pgTable, uuid, text,timestamp, uniqueIndex, integer, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users",{
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").unique().notNull(),
    name: text("name").notNull(),
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)]);

export const videos = pgTable("videos",{
    id: uuid("id").primaryKey().defaultRandom(),
    vid_url : text("vid_url").notNull(),
    title : text("title").default(""),
    desc : text ("desc").default(""),
    thumbnail : text ("thumbnail").default(""),
    likes : integer("likes").default(0).notNull(),
    views : integer("views").default(0).notNull(),
})

export const videoReactions = pgTable("video_reactions", {
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    
    // CHANGED: Use UUID and reference the videos table
    videoId: uuid("video_id").references(() => videos.id, { onDelete: "cascade" }).notNull(),
    
    type: text("type").$type<"like" | "dislike">().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.userId, t.videoId] }),
}));

// Relations
export const userRelations = relations(users, ({ many }) => ({
    reactions: many(videoReactions),
    views: many(videoViews),
    playlists: many(playlists),
}));

export const videoRelations = relations(videos, ({ many }) => ({
    reactions: many(videoReactions),
    views: many(videoViews),
}));

export const videoReactionRelations = relations(videoReactions, ({ one }) => ({
    user: one(users, { fields: [videoReactions.userId], references: [users.id] }),
    video: one(videos, { fields: [videoReactions.videoId], references: [videos.id] }),
}));


// Watch History Table
export const videoViews = pgTable("video_views", {
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    videoId: uuid("video_id").references(() => videos.id, { onDelete: "cascade" }).notNull(),
    viewedAt: timestamp("viewed_at").defaultNow().notNull(),
}, (t) => ({
    // Composite PK: Unique per User + Video
    pk: primaryKey({ columns: [t.userId, t.videoId] }), 
}));

export const videoViewRelations = relations(videoViews, ({ one }) => ({
    user: one(users, { fields: [videoViews.userId], references: [users.id] }),
    video: one(videos, { fields: [videoViews.videoId], references: [videos.id] }),
}));


// 1. Playlists Table (e.g., "Watch Later", "Music", "Coding Tutorials")
export const playlists = pgTable("playlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Playlist Videos (Join Table)
export const playlistVideos = pgTable("playlist_videos", {
  playlistId: uuid("playlist_id").references(() => playlists.id, { onDelete: "cascade" }).notNull(),
  videoId: uuid("video_id").references(() => videos.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.playlistId, t.videoId] }), // Prevent duplicates in same playlist
}));

// 3. Relations
export const playlistRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, { fields: [playlists.userId], references: [users.id] }),
  videos: many(playlistVideos),
}));

export const playlistVideoRelations = relations(playlistVideos, ({ one }) => ({
  playlist: one(playlists, { fields: [playlistVideos.playlistId], references: [playlists.id] }),
  video: one(videos, { fields: [playlistVideos.videoId], references: [videos.id] }),
}));

