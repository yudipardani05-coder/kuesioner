import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getAllRespondents, createRespondent } from "./queries/respondents";
import { getDb } from "./queries/connection";
import { respondents } from "@db/schema";
import { env } from "./lib/env";
import ExcelJS from "exceljs";
import nodemailer from "nodemailer";
import { desc } from "drizzle-orm";

// Create Nodemailer transporter
function getTransporter() {
  return nodemailer.createTransporter({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
}

// Generate Excel buffer from respondents data
async function generateExcelBuffer(data: typeof respondents.$inferSelect[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data Kuesioner");

  // Define columns
  const columns = [
    { header: "No", key: "no", width: 5 },
    { header: "Nama", key: "name", width: 30 },
    { header: "Bagian", key: "department", width: 25 },
    { header: "Lama Bekerja", key: "workDuration", width: 18 },
  ];

  for (let i = 1; i <= 48; i++) {
    columns.push({ header: `Q${i}`, key: `q${i}`, width: 6 });
  }

  worksheet.columns = columns;

  // Style header row
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Add data rows
  data.forEach((respondent, index) => {
    const rowData: Record<string, unknown> = {
      no: index + 1,
      name: respondent.name,
      department: respondent.department,
      workDuration: respondent.workDuration,
    };

    for (let i = 1; i <= 48; i++) {
      rowData[`q${i}`] = respondent[`q${i}` as keyof typeof respondent];
    }

    const row = worksheet.addRow(rowData);

    row.eachCell((cell) => {
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Auto width for name and department
  worksheet.getColumn("name").alignment = { horizontal: "left", vertical: "middle" };
  worksheet.getColumn("department").alignment = { horizontal: "left", vertical: "middle" };

  // Freeze header row
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  return await workbook.xlsx.writeBuffer();
}

// Send email with Excel attachment
async function sendExcelEmail(buffer: Buffer, respondentName: string) {
  const transporter = getTransporter();
  const dateStr = new Date().toLocaleDateString("id-ID");

  await transporter.sendMail({
    from: env.smtpFrom,
    to: env.emailTo,
    subject: "Hasil Kuesioner Penelitian",
    text: `Terlampir hasil kuesioner terbaru dari ${respondentName} pada tanggal ${dateStr}.\n\nTotal responden saat ini dapat dilihat pada file Excel terlampir.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563EB;">Hasil Kuesioner Penelitian</h2>
        <p>Terlampir hasil kuesioner terbaru dari <strong>${respondentName}</strong> pada tanggal ${dateStr}.</p>
        <p>Data siap diolah di <strong>SmartPLS / SPSS / Excel</strong> tanpa perlu edit ulang.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">Email ini dikirim otomatis dari sistem kuesioner penelitian.</p>
      </div>
    `,
    attachments: [
      {
        filename: `Data_Kuesioner_${dateStr.replace(/\//g, "-")}.xlsx`,
        content: buffer,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
  });
}

export const kuesionerRouter = createRouter({
  // Submit questionnaire
  submit: publicQuery
    .input(
      z.object({
        name: z.string().min(1, "Nama lengkap wajib diisi"),
        department: z.string().min(1, "Bagian wajib diisi"),
        workDuration: z.string().min(1, "Lama bekerja wajib diisi"),
        answers: z.record(z.number().min(1).max(5)).refine(
          (answers) => Object.keys(answers).length === 48,
          "Semua 48 pertanyaan harus dijawab"
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Build answer data
        const answerData: Record<string, number> = {};
        for (let i = 1; i <= 48; i++) {
          const val = input.answers[String(i)];
          if (val === undefined || val === null) {
            throw new Error(`Pertanyaan ${i} belum dijawab`);
          }
          answerData[`q${i}`] = val;
        }

        // Save to database
        const respondentId = await createRespondent({
          name: input.name,
          department: input.department,
          workDuration: input.workDuration,
          ...answerData as {
            q1: number; q2: number; q3: number; q4: number; q5: number;
            q6: number; q7: number; q8: number; q9: number; q10: number;
            q11: number; q12: number; q13: number; q14: number; q15: number;
            q16: number; q17: number; q18: number; q19: number; q20: number;
            q21: number; q22: number; q23: number; q24: number; q25: number;
            q26: number; q27: number; q28: number; q29: number; q30: number;
            q31: number; q32: number; q33: number; q34: number; q35: number;
            q36: number; q37: number; q38: number; q39: number; q40: number;
            q41: number; q42: number; q43: number; q44: number; q45: number;
            q46: number; q47: number; q48: number;
          },
        });

        // Get all respondents for Excel
        const allData = await getDb().select().from(respondents).orderBy(desc(respondents.createdAt));

        // Generate Excel
        const excelBuffer = await generateExcelBuffer(allData);

        // Send email with Excel
        if (env.smtpUser && env.smtpPass) {
          try {
            await sendExcelEmail(Buffer.from(excelBuffer), input.name);
          } catch (emailErr) {
            console.error("Email sending failed:", emailErr);
            // Don't throw - submission is still successful
          }
        }

        return {
          success: true,
          respondentId,
          message: "Kuesioner berhasil dikirim! Terima kasih atas partisipasi Anda.",
        };
      } catch (error) {
        console.error("Submit error:", error);
        throw new Error(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data");
      }
    }),

  // List all respondents
  list: publicQuery.query(async () => {
    return getAllRespondents();
  }),

  // Export Excel (returns base64 for download)
  export: publicQuery.query(async () => {
    const allData = await getDb().select().from(respondents).orderBy(desc(respondents.createdAt));
    const buffer = await generateExcelBuffer(allData);
    return {
      data: Buffer.from(buffer).toString("base64"),
      filename: `Data_Kuesioner_${new Date().toISOString().split("T")[0]}.xlsx`,
      count: allData.length,
    };
  }),
});
