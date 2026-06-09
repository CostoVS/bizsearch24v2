import fs from 'fs';
import path from 'path';
import { db, initDb } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

// Define structural backup file
const FILE_PATH = path.join(process.cwd(), 'users-db.json');

export interface ServerUser {
  id: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'USER';
  plan: 'FREE' | 'PREMIUM';
  secretKey: string;
  hasSetup2FA: boolean;
  createdAt?: string;
}

// Initial Admin User Template
const DEFAULT_ADMIN: ServerUser = {
  id: 'admin-1',
  email: 'nicholauscostochetty@gmail.com',
  password: 'Nic6604211989!?',
  role: 'ADMIN',
  plan: 'PREMIUM',
  secretKey: 'BS24KPGQY567ABCD',
  hasSetup2FA: false,
};

// Direct File Operations (Fallback DB)
function readUsersBackup(): ServerUser[] {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify([DEFAULT_ADMIN], null, 2), 'utf-8');
      return [DEFAULT_ADMIN];
    }
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Ensure admin exists in list
    if (!parsed.some((u: ServerUser) => u.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase())) {
      parsed.push(DEFAULT_ADMIN);
      fs.writeFileSync(FILE_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch (error) {
    console.error('Failed to read users JSON backup, returning default:', error);
    return [DEFAULT_ADMIN];
  }
}

function writeUsersBackup(usersList: ServerUser[]) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(usersList, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write users JSON backup:', error);
  }
}

// Unified Service API
export async function getUsersList(): Promise<ServerUser[]> {
  // 1. Try DB first
  try {
    const dClient = initDb();
    if (dClient) {
      const dbUsers = await dClient.select().from(users);
      if (dbUsers && dbUsers.length > 0) {
        // Map Drizzle output to ServerUser list
        const list: ServerUser[] = dbUsers.map((u) => ({
          id: String(u.id),
          email: u.email,
          password: u.password || '',
          role: (u.role as 'ADMIN' | 'USER') || 'USER',
          plan: (u.plan as 'FREE' | 'PREMIUM') || 'FREE',
          secretKey: u.secretKey || 'BS24KPGQY567ABCD',
          hasSetup2FA: u.hasSetup2FA || false,
        }));
        
        // Keep file backup aligned with DB
        writeUsersBackup(list);
        return list;
      }
    }
  } catch (err) {
    console.warn('Database select failed or offline, falling back to server JSON file:', err);
  }

  // 2. Fallback to file system
  return readUsersBackup();
}

export async function saveUser(newUser: ServerUser): Promise<boolean> {
  // First update backup file
  const fileUsers = readUsersBackup();
  const existingIndex = fileUsers.findIndex((u) => u.email.toLowerCase() === newUser.email.toLowerCase());
  
  if (existingIndex !== -1) {
    fileUsers[existingIndex] = { ...fileUsers[existingIndex], ...newUser };
  } else {
    fileUsers.push(newUser);
  }
  writeUsersBackup(fileUsers);

  // Sync to database if available
  try {
    const dClient = initDb();
    if (dClient) {
      // Check if user exists in database
      const existingDb = await dClient.select().from(users).where(eq(users.email, newUser.email));
      if (existingDb && existingDb.length > 0) {
        await dClient.update(users).set({
          password: newUser.password,
          role: newUser.role,
          plan: newUser.plan,
          secretKey: newUser.secretKey,
          hasSetup2FA: newUser.hasSetup2FA,
        }).where(eq(users.email, newUser.email));
      } else {
        await dClient.insert(users).values({
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          plan: newUser.plan,
          secretKey: newUser.secretKey,
          hasSetup2FA: newUser.hasSetup2FA,
        });
      }
      return true;
    }
  } catch (dbErr) {
    console.error('Failed to sync saved user on PostgreSQL, file backup is safe:', dbErr);
  }

  return true;
}

export async function getUserByEmail(email: string): Promise<ServerUser | null> {
  const usersList = await getUsersList();
  const lowerEmail = email.trim().toLowerCase();
  const user = usersList.find((u) => u.email.toLowerCase() === lowerEmail);
  return user || null;
}
