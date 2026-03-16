import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface ReferredClient {
  name: string;
  email: string;
  bookedAt: string;
  status: "booked" | "completed";
}

export interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  referrerEmail: string;
  referralCode: string;
  referredClients: ReferredClient[];
  rewardsEarned: number;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "referrals.json");

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify([], null, 2));
  }
}

function readAll(): Referral[] {
  ensureFile();
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

function writeAll(referrals: Referral[]): void {
  fs.writeFileSync(FILE, JSON.stringify(referrals, null, 2));
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "KOCH-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getAllReferrals(): Referral[] {
  return readAll();
}

export function getReferralByCode(code: string): Referral | undefined {
  return readAll().find((r) => r.referralCode === code.toUpperCase());
}

export function getReferralByClientId(clientId: string): Referral | undefined {
  return readAll().find((r) => r.referrerId === clientId);
}

export function generateReferralCode(clientId: string, name: string, email: string): Referral {
  const referrals = readAll();

  const existing = referrals.find((r) => r.referrerId === clientId);
  if (existing) return existing;

  let code = generateCode();
  while (referrals.some((r) => r.referralCode === code)) {
    code = generateCode();
  }

  const referral: Referral = {
    id: crypto.randomUUID(),
    referrerId: clientId,
    referrerName: name,
    referrerEmail: email,
    referralCode: code,
    referredClients: [],
    rewardsEarned: 0,
    createdAt: new Date().toISOString(),
  };

  referrals.push(referral);
  writeAll(referrals);
  return referral;
}

export function trackReferral(
  code: string,
  name: string,
  email: string
): { success: boolean; error?: string } {
  const referrals = readAll();
  const idx = referrals.findIndex((r) => r.referralCode === code.toUpperCase());

  if (idx === -1) return { success: false, error: "Invalid referral code" };

  const alreadyReferred = referrals[idx].referredClients.some(
    (rc) => rc.email.toLowerCase() === email.toLowerCase()
  );
  if (alreadyReferred) return { success: false, error: "This email has already been referred" };

  referrals[idx].referredClients.push({
    name,
    email: email.toLowerCase(),
    bookedAt: new Date().toISOString(),
    status: "booked",
  });

  referrals[idx].rewardsEarned += 1;
  writeAll(referrals);
  return { success: true };
}
