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
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // e.g., "4 сарын 6"
    const time = searchParams.get("time"); // e.g., "10:00"

    if (!date || !time) {
      return NextResponse.json(
        {
          status: "error",
          message: "Both 'date' and 'time' query parameters are required"
        },
        { status: 400 },
      );
    }

    // Read the schedule data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:D`, // Date | Time | TotalSeats | IsActive
    });

    const rows = response.data.values || [];

    // Find the matching row
    const matchingRow = rows.find((row) => {
      const [rowDate, rowTime, , rowIsActive] = row;
      return (
        rowDate === date &&
        rowTime === time &&
        String(rowIsActive).toUpperCase() === "TRUE"
      );
    });

    if (!matchingRow) {
      return NextResponse.json(
        {
          status: "error",
          message: "No active schedule found for the given date and time",
        },
        { status: 404 },
      );
    }

    const totalSeats = Number(matchingRow[2]); // Column C (TotalSeats)

    if (isNaN(totalSeats)) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid total seats value in the sheet",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: "success",
      date,
      time,
      totalSeats,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}
