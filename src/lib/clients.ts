import fs from "fs";
import path from "path";
import crypto from "crypto";

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
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// ── Clients ──

export function getAllClients(): Client[] {
  ensureFile(CLIENTS_FILE);
  return JSON.parse(fs.readFileSync(CLIENTS_FILE, "utf-8"));
}

export function getClientById(id: string): Client | undefined {
  return getAllClients().find((c) => c.id === id);
}

export function getClientByEmail(email: string): Client | undefined {
  return getAllClients().find((c) => c.email.toLowerCase() === email.toLowerCase());
}

export function createClient(data: { name: string; email: string; password: string; phone?: string }): Client {
  const clients = getAllClients();

  if (clients.some((c) => c.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error("A client with this email already exists");
  }

  const client: Client = {
    id: crypto.randomUUID(),
    name: data.name,
    email: data.email.toLowerCase(),
    password: hashPassword(data.password),
    phone: data.phone || "",
    createdAt: new Date().toISOString(),
    programs: [],
  };

  clients.push(client);
  fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
  return client;
}

export function verifyClientPassword(email: string, password: string): Client | null {
  const client = getClientByEmail(email);
  if (!client) return null;
  if (client.password !== hashPassword(password)) return null;
  return client;
}

export function updateClient(id: string, updates: Partial<Client>): Client | null {
  const clients = getAllClients();
  const idx = clients.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  clients[idx] = { ...clients[idx], ...updates };
  fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
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

export function createProgram(data: Omit<Program, "id" | "createdAt">): Program {
  const programs = getAllPrograms();
  const program: Program = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  programs.push(program);
  fs.writeFileSync(PROGRAMS_FILE, JSON.stringify(programs, null, 2));

  // Also add program id to each assigned client's programs array
  if (data.assignedTo.length > 0) {
    const clients = getAllClients();
    let changed = false;
    for (const client of clients) {
      if (data.assignedTo.includes(client.id) && !client.programs.includes(program.id)) {
        client.programs.push(program.id);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
    }
  }

  return program;
}

export function updateProgram(id: string, updates: Partial<Program>): Program | null {
  const programs = getAllPrograms();
  const idx = programs.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const oldAssigned = programs[idx].assignedTo;
  programs[idx] = { ...programs[idx], ...updates };
  fs.writeFileSync(PROGRAMS_FILE, JSON.stringify(programs, null, 2));

  // Sync client program arrays when assignedTo changes
  if (updates.assignedTo) {
    const clients = getAllClients();
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
      fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
    }
  }

  return programs[idx];
}

export function deleteProgram(id: string): boolean {
  const programs = getAllPrograms();
  const filtered = programs.filter((p) => p.id !== id);
  if (filtered.length === programs.length) return false;
  fs.writeFileSync(PROGRAMS_FILE, JSON.stringify(filtered, null, 2));

  // Remove program from all clients
  const clients = getAllClients();
  let changed = false;
  for (const client of clients) {
    if (client.programs.includes(id)) {
      client.programs = client.programs.filter((pid) => pid !== id);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
  }

  return true;
}
