import ExcelJS from "exceljs";
import { type Reservation, type Venue, trDaysFull, trMonthsFull, money } from "@/lib/rental-store";

export interface ExcelExportOptions {
  institutionName?: string;
  institutionSubHeader?: string;
  reportTitle?: string;
  reservations: Reservation[];
  venues: Venue[];
  filterSummary?: string;
}

export async function exportReservationsToExcel({
  institutionName = "T.C. KURUM / BELEDİYE BAŞKANLIĞI",
  institutionSubHeader = "Tesis & Salon İşletme Müdürlüğü",
  reportTitle = "ETKİNLİK, SALON TAHSİS VE GELİR RAPORU",
  reservations,
  venues,
  filterSummary,
}: ExcelExportOptions): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "İşletmeTakipAppPro";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Etkinlik & Tahsis Listesi", {
    pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true },
    views: [{ showGridLines: true }],
  });

  // 1. Institution Header Row
  worksheet.mergeCells("A1:N1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = institutionName.toUpperCase();
  titleCell.font = { name: "Calibri", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF312E81" }, // Dark Indigo
  };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(1).height = 28;

  // 2. Subheader Row
  worksheet.mergeCells("A2:N2");
  const subCell = worksheet.getCell("A2");
  subCell.value = `${institutionSubHeader} — ${reportTitle}`;
  subCell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFE0E7FF" } };
  subCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4338CA" }, // Indigo 700
  };
  subCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(2).height = 22;

  // 3. Info / Metadata Row
  worksheet.mergeCells("A3:N3");
  const metaCell = worksheet.getCell("A3");
  const nowStr = new Date().toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  metaCell.value = `Rapor Tarihi: ${nowStr}  |  Toplam Kayıt: ${reservations.length} Adet  |  Filtre: ${filterSummary || "Tüm Kayıtlar"}`;
  metaCell.font = { name: "Calibri", size: 9, italic: true, color: { argb: "FF475569" } };
  metaCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF1F5F9" }, // Slate 100
  };
  metaCell.alignment = { horizontal: "left", vertical: "middle" };
  worksheet.getRow(3).height = 20;

  // 4. Empty Spacing Row
  worksheet.getRow(4).height = 8;

  // 5. Table Header Columns
  const headers = [
    { header: "Sıra", key: "index", width: 7 },
    { header: "Tesis / Mekan Adı", key: "venue", width: 26 },
    { header: "Salon Adı", key: "hall", width: 22 },
    { header: "Tarih", key: "date", width: 14 },
    { header: "Gün", key: "day", width: 14 },
    { header: "Saat", key: "time", width: 14 },
    { header: "Etkinlik Türü", key: "eventType", width: 20 },
    { header: "Müşteri / Vatandaş Adı", key: "customer", width: 26 },
    { header: "İletişim Telefonu", key: "phone", width: 18 },
    { header: "Toplam Tarife (₺)", key: "price", width: 18 },
    { header: "Tahsil Edilen (₺)", key: "paid", width: 18 },
    { header: "Kalan Borç (₺)", key: "remaining", width: 18 },
    { header: "Durum", key: "status", width: 15 },
    { header: "Açıklama / Karar Bilgisi", key: "note", width: 30 },
  ];

  const headerRow = worksheet.getRow(5);
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h.header;
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" }, // Indigo 600
    };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FF312E81" } },
      left: { style: "thin", color: { argb: "FF312E81" } },
      bottom: { style: "medium", color: { argb: "FF1E1B4B" } },
      right: { style: "thin", color: { argb: "FF312E81" } },
    };
  });
  headerRow.height = 26;

  // 6. Data Rows
  let currentRowIdx = 6;
  let sumPrice = 0;
  let sumPaid = 0;
  let sumRemaining = 0;

  // Sort reservations by date ascending
  const sortedRes = [...reservations].sort((a, b) => a.date.localeCompare(b.date));

  sortedRes.forEach((res, idx) => {
    const venue = venues.find((v) => v.id === res.venueId);
    const hall = venue?.halls.find((h) => h.id === res.hallId);

    const priceNum = Number(res.price) || 0;
    const paidNum = Number(res.paid) || 0;
    const remainingNum = Math.max(0, priceNum - paidNum);

    sumPrice += priceNum;
    sumPaid += paidNum;
    sumRemaining += remainingNum;

    // Day of week
    let dayName = "";
    try {
      const [y, m, d] = res.date.split("-").map(Number);
      const dObj = new Date(y, m - 1, d);
      dayName = trDaysFull[dObj.getDay()] || "";
    } catch {
      dayName = "";
    }

    const statusText =
      res.status === "confirmed"
        ? "Onaylandı"
        : res.status === "option"
        ? "Opsiyonlu"
        : "İptal Edildi";

    const noteCombined = [res.decisionInfo ? `Karar: ${res.decisionInfo}` : null, res.note]
      .filter(Boolean)
      .join(" | ");

    const row = worksheet.getRow(currentRowIdx);
    row.values = [
      idx + 1,
      venue?.name || "Bilinmeyen Tesis",
      hall?.name || "Bilinmeyen Salon",
      res.date,
      dayName,
      `${res.start} - ${res.end}`,
      res.eventType || "Genel",
      res.customer,
      res.phone || "-",
      priceNum,
      paidNum,
      remainingNum,
      statusText,
      noteCombined,
    ];

    const isEven = idx % 2 === 0;
    const bgArgb = isEven ? "FFFFFFFF" : "FFF8FAFC"; // White / Slate 50

    row.eachCell((cell, colNumber) => {
      cell.font = { name: "Calibri", size: 9.5 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: bgArgb },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };

      // Alignment and Formatting
      if (colNumber === 1 || colNumber === 4 || colNumber === 5 || colNumber === 6 || colNumber === 13) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else if (colNumber >= 10 && colNumber <= 12) {
        cell.alignment = { horizontal: "right", vertical: "middle" };
        cell.numFmt = '#,##0.00" ₺"';
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      }
    });

    row.height = 20;
    currentRowIdx++;
  });

  // 7. Totals / Summary Row
  const totalRow = worksheet.getRow(currentRowIdx);
  totalRow.getCell(1).value = "GENEL TOPLAM";
  worksheet.mergeCells(`A${currentRowIdx}:I${currentRowIdx}`);
  const totalLabelCell = totalRow.getCell(1);
  totalLabelCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  totalLabelCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E293B" }, // Slate 800
  };
  totalLabelCell.alignment = { horizontal: "right", vertical: "middle" };

  // Total Price
  const priceCell = totalRow.getCell(10);
  priceCell.value = sumPrice;
  priceCell.numFmt = '#,##0.00" ₺"';
  priceCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  priceCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
  priceCell.alignment = { horizontal: "right", vertical: "middle" };

  // Total Paid
  const paidCell = totalRow.getCell(11);
  paidCell.value = sumPaid;
  paidCell.numFmt = '#,##0.00" ₺"';
  paidCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF10B981" } }; // Emerald 500
  paidCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
  paidCell.alignment = { horizontal: "right", vertical: "middle" };

  // Total Remaining
  const remainingCell = totalRow.getCell(12);
  remainingCell.value = sumRemaining;
  remainingCell.numFmt = '#,##0.00" ₺"';
  remainingCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: sumRemaining > 0 ? "FFF43F5E" : "FFFFFFFF" } };
  remainingCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
  remainingCell.alignment = { horizontal: "right", vertical: "middle" };

  // Empty cells for status and note in total row
  totalRow.getCell(13).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
  totalRow.getCell(14).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };

  totalRow.height = 24;

  // Set column widths
  headers.forEach((h, i) => {
    worksheet.getColumn(i + 1).width = h.width;
  });

  // 8. Generate File and Trigger Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const fileNameDate = new Date().toISOString().slice(0, 10);
  link.download = `Etkinlik_ve_Tahsis_Raporu_${fileNameDate}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
