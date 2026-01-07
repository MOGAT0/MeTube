import { pgTable, uuid, text,timestamp, uniqueIndex, integer } from "drizzle-orm/pg-core";

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
    likes : integer("likes").default(0).notNull(),
    views : integer("views").default(0).notNull(),
})