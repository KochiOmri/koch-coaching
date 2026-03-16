/* ============================================================
   GOOGLE SHEETS INTEGRATION - src/lib/google-sheets.ts
   ============================================================
   Logs coaching session data to a Google Sheet for record keeping.

   Uses the same Google Service Account as the Calendar integration.
   The Sheet must be shared with the service account email
   (give it "Editor" permission).

   Required env vars:
     GOOGLE_SERVICE_ACCOUNT_EMAIL
     GOOGLE_PRIVATE_KEY
     GOOGLE_SHEET_ID
   ============================================================ */

import { google } from "googleapis";
import { getGoogleAuth } from "./google-calendar";

export function isSheetsConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_SHEET_ID
  );
}

function getSheetsClient() {
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"]);
  return google.sheets({ version: "v4", auth });
}

const SHEET_RANGE = "Sessions!A:H";
const SHEET_HEADERS = [
  "Date",
  "Time",
  "Client Name",
  "Client Email",
  "Session Type",
  "Status",
  "Meet Link",
  "Notes",
];

export interface SessionLogData {
  date: string;
  time: string;
  clientName: string;
  clientEmail: string;
  sessionType: string;
  status: string;
  meetLink?: string;
  notes?: string;
}

/* --- Ensure the sheet has headers ---
   Creates the "Sessions" sheet and adds header row if empty. */
async function ensureHeaders() {
  const sheets = getSheetsClient();
  const sheetId = process.env.GOOGLE_SHEET_ID!;

  try {
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Sessions!A1:H1",
    });

    if (!existing.data.values || existing.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Sessions!A1:H1",
        valueInputOption: "RAW",
        requestBody: { values: [SHEET_HEADERS] },
      });
    }
  } catch {
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: "Sessions" } } }],
        },
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Sessions!A1:H1",
        valueInputOption: "RAW",
        requestBody: { values: [SHEET_HEADERS] },
      });
    } catch (innerError) {
      console.error("Failed to create Sessions sheet:", innerError);
      throw innerError;
    }
  }
}

/* --- Log a session to the sheet ---
   Appends a row with the session data. */
export async function logSessionToSheet(
  data: SessionLogData
): Promise<boolean> {
  if (!isSheetsConfigured()) {
    console.log("Google Sheets not configured — skipping log");
    return false;
  }

  try {
    await ensureHeaders();

    const sheets = getSheetsClient();
    const formattedDate = new Date(data.date + "T00:00:00").toLocaleDateString(
      "en-US",
      { year: "numeric", month: "short", day: "numeric" }
    );

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: SHEET_RANGE,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
            formattedDate,
            data.time,
            data.clientName,
            data.clientEmail,
            data.sessionType,
            data.status,
            data.meetLink || "",
            data.notes || "",
          ],
        ],
      },
    });

    console.log(`Session logged to Google Sheet: ${data.clientName} on ${data.date}`);
    return true;
  } catch (error) {
    console.error("Failed to log session to Google Sheets:", error);
    return false;
  }
}

/* --- Read session logs from the sheet --- */
export async function getSheetData(): Promise<SessionLogData[]> {
  if (!isSheetsConfigured()) return [];

  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: SHEET_RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return [];

    return rows.slice(1).map((row) => ({
      date: row[0] || "",
      time: row[1] || "",
      clientName: row[2] || "",
      clientEmail: row[3] || "",
      sessionType: row[4] || "",
      status: row[5] || "",
      meetLink: row[6] || "",
      notes: row[7] || "",
    }));
  } catch (error) {
    console.error("Failed to read Google Sheets data:", error);
    return [];
  }
}

/* --- Test Sheets Connection --- */
export async function testSheetsConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isSheetsConfigured()) {
    return {
      success: false,
      error: "Google Sheets environment variables not configured",
    };
  }

  try {
    const sheets = getSheetsClient();
    await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      fields: "properties.title",
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
