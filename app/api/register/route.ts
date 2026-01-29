import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { sendEmail } from "@/lib/mailer";

// Load service account credentials from env
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY as string);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = process.env.SPREADSHEET_ID as string;
const SHEET_NAME = "Registrations";

// ✅ Named export for POST method
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { time, seat, email, phone } = body;

    if (!time || !seat || !email || !phone) {
      return NextResponse.json(
        { status: "error", message: "All fields are required" },
        { status: 400 }
      );
    }

    // Append row to Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:E`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[time, seat, email, phone, new Date().toISOString()]],
      },
    });

      await sendEmail({
      to: email,
      subject: "Бүртгэл амжилттай боллоо",
      text: `Та амжилттай бүртгэгдлээ! Цаг: ${time}, Суудал: ${seat}`,
      html: `<p>Та амжилттай бүртгэгдлээ!</p><p><strong>Цаг:</strong> ${time}</p><p><strong>Суудал:</strong> ${seat}</p>`,
    });

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Optional: get query param ?time=12:00
    const { searchParams } = new URL(req.url);
    const timeFilter = searchParams.get("time"); // e.g., "12:00"

    // Read the sheet data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:E`, // columns: Time | Seat | Email | Phone | Timestamp
    });

    const rows = response.data.values || [];

    // Filter by time if provided
    const filteredRows = timeFilter
      ? rows.filter((row) => row[0] === timeFilter)
      : rows;

    // Seats that are taken
    const takenSeats = filteredRows.map((row) => Number(row[1])).filter(Boolean);

    return NextResponse.json({ status: "success", takenSeats });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
