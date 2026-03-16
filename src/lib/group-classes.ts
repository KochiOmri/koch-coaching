import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface GroupClass {
  id: string;
  name: string;
  description: string;
  dayOfWeek: string;
  time: string;
  duration: number;
  maxParticipants: number;
  currentParticipants: string[];
  waitlist: string[];
  price: number;
  isActive: boolean;
  location: string;
  meetLink: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "group-classes.json");

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify([], null, 2));
  }
}

function readAll(): GroupClass[] {
  ensureFile();
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

function writeAll(classes: GroupClass[]): void {
  fs.writeFileSync(FILE, JSON.stringify(classes, null, 2));
}

export function getAllGroupClasses(): GroupClass[] {
  return readAll();
}

export function getGroupClassById(id: string): GroupClass | undefined {
  return readAll().find((c) => c.id === id);
}

export function createGroupClass(
  data: Omit<GroupClass, "id" | "currentParticipants" | "waitlist" | "createdAt">
): GroupClass {
  const classes = readAll();
  const gc: GroupClass = {
    ...data,
    id: crypto.randomUUID(),
    currentParticipants: [],
    waitlist: [],
    createdAt: new Date().toISOString(),
  };
  classes.push(gc);
  writeAll(classes);
  return gc;
}

export function updateGroupClass(id: string, updates: Partial<GroupClass>): GroupClass | null {
  const classes = readAll();
  const idx = classes.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  classes[idx] = { ...classes[idx], ...updates };
  writeAll(classes);
  return classes[idx];
}

export function deleteGroupClass(id: string): boolean {
  const classes = readAll();
  const filtered = classes.filter((c) => c.id !== id);
  if (filtered.length === classes.length) return false;
  writeAll(filtered);
  return true;
}

export function joinGroupClass(
  id: string,
  clientId: string
): { status: "joined" | "waitlisted" | "already_joined" | "not_found" } {
  const classes = readAll();
  const idx = classes.findIndex((c) => c.id === id);
  if (idx === -1) return { status: "not_found" };

  const gc = classes[idx];

  if (gc.currentParticipants.includes(clientId) || gc.waitlist.includes(clientId)) {
    return { status: "already_joined" };
  }

  if (gc.currentParticipants.length < gc.maxParticipants) {
    gc.currentParticipants.push(clientId);
    writeAll(classes);
    return { status: "joined" };
  }

  gc.waitlist.push(clientId);
  writeAll(classes);
  return { status: "waitlisted" };
}

export function leaveGroupClass(
  id: string,
  clientId: string
): { status: "left" | "not_found" | "not_in_class"; promoted?: string } {
  const classes = readAll();
  const idx = classes.findIndex((c) => c.id === id);
  if (idx === -1) return { status: "not_found" };

  const gc = classes[idx];
  const wasParticipant = gc.currentParticipants.includes(clientId);
  const wasWaitlisted = gc.waitlist.includes(clientId);

  if (!wasParticipant && !wasWaitlisted) {
    return { status: "not_in_class" };
  }

  if (wasWaitlisted) {
    gc.waitlist = gc.waitlist.filter((id) => id !== clientId);
    writeAll(classes);
    return { status: "left" };
  }

  gc.currentParticipants = gc.currentParticipants.filter((id) => id !== clientId);

  let promoted: string | undefined;
  if (gc.waitlist.length > 0) {
    promoted = gc.waitlist.shift()!;
    gc.currentParticipants.push(promoted);
  }

  writeAll(classes);
  return { status: "left", promoted };
}
