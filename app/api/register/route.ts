import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { sendEmail } from "@/lib/mailer";

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
const SHEET_NAME = "Registrations";

// ✅ Named export for POST method
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { time, seat, email, phone, date } = body;

    if (!time || !seat || !email || !phone || !date) {
      return NextResponse.json(
        { status: "error", message: "All fields are required" },
        { status: 400 },
      );
    }

    // Check if seat is already taken for this date and time
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`,
    });

    const rows = response.data.values || [];

    // Filter rows for the same date and time
    const existingRegistrations = rows.filter((row) => {
      const rowTime = row[0]; // Column A
      const rowDate = row[5]; // Column F
      return rowDate === date && rowTime === time;
    });

    // Check if the requested seat is already taken
    const takenSeats = existingRegistrations
      .map((row) => Number(row[1])) // Seat column
      .filter((s) => !isNaN(s));

    if (takenSeats.includes(Number(seat))) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Энэ суудал аль хэдийн эзэлсэн байна. Өөр суудал сонгоно уу.",
        },
        { status: 409 }, // 409 Conflict
      );
    }

    // Append row to Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[time, seat, email, phone, new Date().toISOString(), date]],
      },
    });

    await sendEmail({
      to: email,
      subject: "Бүртгэл амжилттай боллоо",
      text: `Та амжилттай бүртгэгдлээ! Цаг: ${time},`,
      html: `<p>Таны бүртгэл амжилттай баталгаажлаа.</p>

<p>
  <strong>Нээлттэй хичээлийн хуваарь:</strong>
  ${date} ${time}
</p>

<p>
  <strong>Хаяг:</strong><br />
  Улаанбаатар хот, Чингэлтэй дүүрэг, 1-р хороо,<br />
  Мөнгөн Завьяагийн автобусны буудлын ард талд<br />
  Дэнвер оффис 2 давхарт, 15170
</p>

<p>
  <strong>Утас:</strong>
  99142833, 99131953
</p>

<p>
  <strong>Google map:</strong>
  <a href="https://maps.app.goo.gl/9ubRA6VQMszqm3Ey8">
    https://maps.app.goo.gl/9ubRA6VQMszqm3Ey8
  </a>
</p>
`,
    });

    await sendEmail({
      to: "ts.sarnai05@gmail.com",
      subject: "Event-д хүн бүртгүүллээ",
      html: `
<p>
  <strong>Нээлттэй хичээлийн хуваарь:</strong>
  ${date} ${time}
</p>

<p>
    ${email}  and  ${phone}
</p>
`,
    });

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Optional: get query param ?time=12:00
    const { searchParams } = new URL(req.url);
    const dateFilter = searchParams.get("date"); // "1 сарын 31"
    const timeFilter = searchParams.get("time"); // "12:00"

    // Read the sheet data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`, // columns: Time | Seat | Email | Phone | Timestamp
    });

    const rows = response.data.values || [];

    // Filter by time if provided
    const filteredRows = rows.filter((row) => {
      const rowTime = row[0]; // Column A
      const rowDate = row[5]; // Column F

      if (dateFilter && timeFilter) {
        return rowDate === dateFilter && rowTime === timeFilter;
      }

      if (dateFilter) {
        return rowDate === dateFilter;
      }

      if (timeFilter) {
        return rowTime === timeFilter;
      }

      return true;
    });

    const takenSeats = filteredRows
      .map((row) => Number(row[1])) // Seat column
      .filter((seat) => !isNaN(seat));

    return NextResponse.json({
      status: "success",
      takenSeats,
      count: rows.length,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}
