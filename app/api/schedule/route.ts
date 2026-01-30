import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// Load service account credentials from env
const credentials = JSON.parse(
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY as string,
);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = process.env.SPREADSHEET_ID as string;
const SHEET_NAME = "Schedules";

export async function GET(req: NextRequest) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:D`, // Date | Time | TotalSeats | IsActive
    });

    const rows = response.data.values || [];

    const schedule: Record<string, string[]> = {};
    let totalSeats = 0;

    for (const row of rows) {
      const [date, time, total, isActive] = row;

      if (!date || !time) continue;
      if (String(isActive).toUpperCase() !== "TRUE") continue;

      // build schedule
      if (!schedule[date]) {
        schedule[date] = [];
      }
      schedule[date].push(time);

      // sum total seats
      const seatsNum = Number(total);
      if (!isNaN(seatsNum)) {
        totalSeats += seatsNum;
      }
    }

    return NextResponse.json({
      status: "success",
      schedule,
      total: String(totalSeats), // "60"
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}
