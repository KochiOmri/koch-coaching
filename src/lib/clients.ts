import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getDb } from "./supabase/db";

export interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl?: string;
  sets?: number;
  reps?: number;
  notes?: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  duration: string;
  exercises: Exercise[];
  createdBy: string;
  assignedTo: string[];
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  createdAt: string;
  programs: string[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const CLIENTS_FILE = path.join(DATA_DIR, "clients.json");
const PROGRAMS_FILE = path.join(DATA_DIR, "programs.json");

function ensureFile(filePath: string): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
  } catch (error) {
    // In production (Vercel), filesystem is read-only, that's OK
    console.log("Filesystem is read-only, using Supabase");
  }
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// ── Clients ──

export async function getAllClients(): Promise<Client[]> {
  const db = await getDb();

  if (db) {
    // Use Supabase in production
    const { data, error } = await db.from("clients").select("*");
    if (error) {
      console.error("Error fetching clients from Supabase:", error);
      return [];
    }
    return (data as Client[]) || [];
  }

  // Fallback to filesystem in dev
  ensureFile(CLIENTS_FILE);
  try {
    return JSON.parse(fs.readFileSync(CLIENTS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export async function getClientById(id: string): Promise<Client | undefined> {
  const db = await getDb();

  if (db) {
    const { data, error } = await db.from("clients").select("*").eq("id", id).single();
    if (error) return undefined;
    return data as Client;
  }

  const clients = await getAllClients();
  return clients.find((c) => c.id === id);
}

export async function getClientByEmail(email: string): Promise<Client | undefined> {
  const db = await getDb();

  if (db) {
    const { data, error } = await db.from("clients").select("*").ilike("email", email).single();
    if (error) return undefined;
    return data as Client;
  }

  const clients = await getAllClients();
  return clients.find((c) => c.email.toLowerCase() === email.toLowerCase());
}

export async function createClient(data: { name: string; email: string; password: string; phone?: string }): Promise<Client> {
  const db = await getDb();

  const client: Client = {
    id: crypto.randomUUID(),
    name: data.name,
    email: data.email.toLowerCase(),
    password: hashPassword(data.password),
    phone: data.phone || "",
    createdAt: new Date().toISOString(),
    programs: [],
  };

  if (db) {
    // Use Supabase in production
    const existing = await getClientByEmail(data.email);
    if (existing) {
      throw new Error("A client with this email already exists");
    }

    const { data: inserted, error } = await db.from("clients").insert(client).select().single();
    if (error) {
      console.error("Error creating client in Supabase:", error);
      throw new Error("Failed to create client: " + error.message);
    }
    return inserted as Client;
  }

  // Fallback to filesystem in dev
  const clients = await getAllClients();
  if (clients.some((c) => c.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error("A client with this email already exists");
  }

  clients.push(client);
  try {
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
  } catch (error) {
    console.error("Error writing to filesystem:", error);
    throw new Error("Failed to create client - filesystem not writable");
  }
  return client;
}

export async function verifyClientPassword(email: string, password: string): Promise<Client | null> {
  const client = await getClientByEmail(email);
  if (!client) return null;
  if (client.password !== hashPassword(password)) return null;
  return client;
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
  const db = await getDb();

  if (db) {
    const { data, error } = await db.from("clients").update(updates).eq("id", id).select().single();
    if (error) {
      console.error("Error updating client in Supabase:", error);
      return null;
    }
    return data as Client;
  }

  const clients = await getAllClients();
  const idx = clients.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  clients[idx] = { ...clients[idx], ...updates };

  try {
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
  } catch {
    return null;
  }
  return clients[idx];
}

// ── Programs ──

export function getAllPrograms(): Program[] {
  ensureFile(PROGRAMS_FILE);
  return JSON.parse(fs.readFileSync(PROGRAMS_FILE, "utf-8"));
}

export function getProgramById(id: string): Program | undefined {
  return getAllPrograms().find((p) => p.id === id);
}

export function getClientPrograms(clientId: string): Program[] {
  return getAllPrograms().filter((p) => p.assignedTo.includes(clientId));
}

export async function createProgram(data: Omit<Program, "id" | "createdAt">): Promise<Program> {
  const programs = getAllPrograms();
  const program: Program = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  programs.push(program);

  try {
    fs.writeFileSync(PROGRAMS_FILE, JSON.stringify(programs, null, 2));
  } catch {
    // Filesystem may be read-only in production
  }

  // Also add program id to each assigned client's programs array
  if (data.assignedTo.length > 0) {
    const clients = await getAllClients();
    let changed = false;
    for (const client of clients) {
      if (data.assignedTo.includes(client.id) && !client.programs.includes(program.id)) {
        client.programs.push(program.id);
        changed = true;
      }
    }
    if (changed) {
      // Update clients if possible
      try {
        fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
      } catch {
        // Filesystem may be read-only in production
      }
    }
  }

  return program;
}

export async function updateProgram(id: string, updates: Partial<Program>): Promise<Program | null> {
  const programs = getAllPrograms();
  const idx = programs.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const oldAssigned = programs[idx].assignedTo;
  programs[idx] = { ...programs[idx], ...updates };

  try {
    fs.writeFileSync(PROGRAMS_FILE, JSON.stringify(programs, null, 2));
  } catch {
    // Filesystem may be read-only in production
  }

  // Sync client program arrays when assignedTo changes
  if (updates.assignedTo) {
    const clients = await getAllClients();
    let changed = false;
    for (const client of clients) {
      const wasAssigned = oldAssigned.includes(client.id);
      const isAssigned = updates.assignedTo.includes(client.id);
      if (!wasAssigned && isAssigned && !client.programs.includes(id)) {
        client.programs.push(id);
        changed = true;
      } else if (wasAssigned && !isAssigned) {
        client.programs = client.programs.filter((pid) => pid !== id);
        changed = true;
      }
    }
    if (changed) {
      try {
        fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
      } catch {
        // Filesystem may be read-only in production
      }
    }
  }

  return programs[idx];
}

export async function deleteProgram(id: string): Promise<boolean> {
  const programs = getAllPrograms();
  const filtered = programs.filter((p) => p.id !== id);
  if (filtered.length === programs.length) return false;

  try {
    fs.writeFileSync(PROGRAMS_FILE, JSON.stringify(filtered, null, 2));
  } catch {
    // Filesystem may be read-only in production
  }

  // Remove program from all clients
  const clients = await getAllClients();
  let changed = false;
  for (const client of clients) {
    if (client.programs.includes(id)) {
      client.programs = client.programs.filter((pid) => pid !== id);
      changed = true;
    }
  }
  if (changed) {
    try {
      fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
    } catch {
      // Filesystem may be read-only in production
    }
  }

  return true;
}
