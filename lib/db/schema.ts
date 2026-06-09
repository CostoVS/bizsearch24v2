import { pgTable, serial, text, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: varchar('role', { length: 50 }).notNull().default('USER'), // 'ADMIN' or 'USER'
  plan: varchar('plan', { length: 50 }).notNull().default('FREE'), // 'FREE' or 'PREMIUM'
  passwordHash: varchar('password_hash', { length: 255 }), // Included for completeness, use bcrypt/argon2
  lastLoginIp: varchar('last_login_ip', { length: 45 }),
  deviceInfo: text('device_info'),
  location: varchar('location', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const ads = pgTable('ads', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  province: varchar('province', { length: 100 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(), // City/Town/Suburb
  description: text('description').notNull(),
  isPremium: boolean('is_premium').default(false), // Premium users' ads
  isSponsor: boolean('is_sponsor').default(false), // Sponsored ads (top)
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  ads: many(ads),
}));

export const adsRelations = relations(ads, ({ one }) => ({
  user: one(users, {
    fields: [ads.userId],
    references: [users.id],
  }),
}));
