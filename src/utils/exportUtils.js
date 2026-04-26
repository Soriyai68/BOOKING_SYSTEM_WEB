import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { KHMER_FONT_BASE64 } from "../assets/fonts/KhmerFont.js";

/**
 * Export data to CSV
 * @param {Array} data - Array of objects
 * @param {String} filename - Output filename
 */
export const exportToCSV = (data, filename = "export") => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(","));

  // Add data
  for (const row of data) {
    const values = headers.map((header) => {
      const val =
        row[header] === null || row[header] === undefined ? "" : row[header];
      const escaped = ("" + val).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Precision Khmer Shaping Helper for jsPDF
 * Handles reordering of complex clusters (pre-vowels and Coeng Ro) to ensure visual correctness.
 * @param {string} text
 * @returns {string}
 */
const shapeKhmer = (text) => {
  if (!text) return "";

  let str = String(text);

  // 0. Remove Zero Width Spaces and Normalize
  str = str.replace(/\u200B/g, "").normalize("NFC");

  // 1. Decompose split vowels for visual reordering
  // ោ (17C4) -> េ (17C1) + ា (17B6)
  // ោះ (17C5) -> េ (17C1) + ា (17B6) + ះ (17C7)
  str = str.replace(/\u17C4/g, "\u17C1\u17B6");
  str = str.replace(/\u17C5/g, "\u17C1\u17B6\u17C7");

  // 2. Use Intl.Segmenter for "True" Khmer Cluster identification
  // This is the most robust way to handle any complex syllable.
  const segmenter = new Intl.Segmenter("km", { granularity: "grapheme" });
  const segments = Array.from(segmenter.segment(str));

  return segments
    .map((segment) => {
      let cluster = segment.segment;

      // a. Handle Coeng Ro (\u17D2\u179A) inside this cluster
      // It MUST move to the very front of the cluster it belongs to.
      if (cluster.includes("\u17D2\u179A")) {
        cluster = "\u17D2\u179A" + cluster.replace("\u17D2\u179A", "");
      }

      // b. Handle Pre-consonant vowels: េ (17C1), ែ (17C2), ៃ (17C3), ើ (17BE), ឿ (17BF), ៀ (17C0)
      // These MUST move to the very front (even before Coeng Ro).
      const preVowels = /[\u17C1\u17C2\u17C3\u17BE\u17BF\u17C0]/;
      const match = cluster.match(preVowels);
      if (match) {
        const vowel = match[0];
        cluster = vowel + cluster.replace(vowel, "");
      }

      return cluster;
    })
    .join("");
};

/**
 * Enhanced translation map for internal report data values.
 */
const KHMER_MAP = {
  // Cash: "សាច់ប្រាក់",
  Bakong: "បាគង់",
  Pending: "រង់ចាំ",
  Paid: "បង់រួច",
  Cancelled: "បោះបង់",
  Completed: "រួចរាល់",
  "N/A": "មិនមាន",
};

/**
 * Export data to Excel
 * @param {Array} data - Array of objects
 * @param {String} filename - Output filename
 */
export const exportToExcel = (data, filename = "export", options = {}) => {
  if (!data || !data.length) return;
  const { summary = [] } = options;

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add summary rows at the bottom
  if (summary.length > 0) {
    const nextRow = data.length + 2; // +1 for header, +1 for empty row
    summary.forEach((item, index) => {
      let val = item.value;
      if (!isNaN(parseFloat(val))) {
        val = `$${parseFloat(val).toFixed(2)}`;
      }
      XLSX.utils.sheet_add_aoa(worksheet, [[item.label, val]], { origin: `A${nextRow + index}` });
    });
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Export data to PDF
 * @param {Array} data - Array of objects
 * @param {Array} columns - Array of column definitions [{ header: 'Name', dataKey: 'name' }]
 * @param {String} title - PDF title
 * @param {String} filename - Output filename
 */
export const exportToPDF = (
  data,
  columns,
  title = "Report",
  filename = "report",
  options = {}
) => {
  if (!data || !data.length) return;
  const { summary = [] } = options;

  // Use orientation 'p' or 'l' based on column count
  const orientation = columns.length > 6 ? "l" : "p";
  const doc = new jsPDF(orientation);
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Register Font
  doc.addFileToVFS("KhmerFont.ttf", KHMER_FONT_BASE64);
  doc.addFont("KhmerFont.ttf", "KhmerFont", "normal");
  doc.setFont("KhmerFont", "normal");

  // --- HEADER SECTION ---
  // Background for Header
  doc.setFillColor(26, 26, 26); // #1a1a1a
  doc.rect(0, 0, pageWidth, 40, "F");

  // Logo Placeholder / Text Branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("NINJA BOOKING SYSTEM", 14, 20);
  
  doc.setFontSize(14);
  doc.setTextColor(166, 141, 94); // #a68d5e (Gold Accent)
  doc.text(shapeKhmer("ប្រព័ន្ធកក់ នីនចា"), 14, 28);
  
  
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(shapeKhmer("Expert Movie Ticketing & Management Solution"), 14, 35);

  // Report Title (Right Aligned)
  doc.setFontSize(16);
  const titleText = shapeKhmer(title.toUpperCase());
  const titleWidth = doc.getTextWidth(titleText);
  doc.text(titleText, pageWidth - titleWidth - 14, 25);

  // --- INFO SECTION ---
  doc.setTextColor(30, 41, 59); // Reset to dark
  doc.setFontSize(10);
  let currentY = 50;

  const timestamp = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  doc.text(shapeKhmer(`បង្កើតនៅថ្ងៃទី (Generated Date): ${timestamp}`), 14, currentY);
  doc.text(shapeKhmer(`ប្រភេទរបាយការណ៍ (Report Type): ${title}`), 14, currentY + 6);
  
  // Horizontal Line Separator
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.line(14, currentY + 12, pageWidth - 14, currentY + 12);

  // --- TABLE SECTION ---
  const head = [columns.map((col) => shapeKhmer(col.header))];
  const body = data.map((row) =>
    columns.map((col) => {
      let val = row[col.dataKey];
      if (typeof val === "string" && KHMER_MAP[val]) {
        val = KHMER_MAP[val];
      }
      
      // Formatting for PDF
      let displayVal = val === null || val === undefined ? "" : String(val);
      
      // Date Formatting: Simplified to YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(displayVal)) {
        displayVal = displayVal.split(" ")[0];
      }
      
      // Currency Formatting: Add $ sign for numeric amount/price columns
      const lowHeader = col.header.toLowerCase();
      if ((lowHeader.includes('amount') || lowHeader.includes('price') || lowHeader.includes('ទឹកប្រាក់')) && !isNaN(parseFloat(displayVal))) {
        displayVal = `$${parseFloat(displayVal).toFixed(2)}`;
      }

      return shapeKhmer(displayVal);
    }),
  );

  autoTable(doc, {
    startY: currentY + 18,
    head: head,
    body: body,
    theme: "striped",
    styles: {
      font: "KhmerFont",
      fontSize: 9,
      cellPadding: 4,
      textColor: [26, 26, 26],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [26, 26, 26],
      textColor: [255, 255, 255],
      fontStyle: "normal",
      fontSize: 10,
      halign: "left",
    },
    columnStyles: {
      0: { fontStyle: "normal" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14, top: 45, bottom: 20 },
    didDrawPage: (data) => {
      // --- FOOTER SECTION ---
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // Slate-500
      
      // Page Number
      const str = "Page " + doc.internal.getNumberOfPages();
      doc.text(str, pageWidth - 14 - doc.getTextWidth(str), pageHeight - 10);
      
      // Disclaimer / Company Info
      doc.text(
        shapeKhmer("ឯកសារសម្ងាត់របស់ក្រុមហ៊ុន - រក្សាសិទ្ធិគ្រប់យ៉ាង (Confidential - All Rights Reserved)"),
        14,
        pageHeight - 10,
      );
      
      // Summary Section (Grand Total, etc.)
      if (data.pageNumber === totalPages && summary.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(26, 26, 26);
        let summaryY = data.cursor.y + 10;
        
        // Ensure summary doesn't overlap signatures
        if (summaryY > pageHeight - 60) {
           // Maybe we should cap it or just push signatures? 
           // For now, let's just draw it.
        }

        summary.forEach((item) => {
          doc.setFont(undefined, 'bold');
          const label = shapeKhmer(item.label);
          doc.text(`${label}:`, 14, summaryY);
          
          let val = item.value;
          if (!isNaN(parseFloat(val))) {
            val = `$${parseFloat(val).toFixed(2)}`;
          }
          const valText = shapeKhmer(String(val));
          const valWidth = doc.getTextWidth(valText);
          doc.text(valText, pageWidth - 14 - valWidth, summaryY);
          
          summaryY += 8;
        });
        
        // Add a separator line after summary if needed
        doc.setDrawColor(166, 141, 94);
        doc.setLineWidth(0.5);
        doc.line(14, summaryY - 2, pageWidth - 14, summaryY - 2);
      }

      // Signature Section (only on the last page)
      // We'll put it on the final page of each document for a professional finish.
      const totalPages = doc.internal.getNumberOfPages();
      if (data.pageNumber === totalPages) {
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        const sigY = pageHeight - 35;
        
        // Prepared By
        doc.text(shapeKhmer("រៀបចំដោយ (Prepared By)"), 14, sigY);
        doc.line(14, sigY + 5, 14 + 50, sigY + 5);
        
        // Approved By
        const approvedText = shapeKhmer("អនុម័តដោយ (Approved By)");
        const approvedWidth = doc.getTextWidth(approvedText);
        doc.text(approvedText, pageWidth - 14 - approvedWidth, sigY);
        doc.line(pageWidth - 14 - approvedWidth, sigY + 5, pageWidth - 14, sigY + 5);
      }
      
      // Bottom border for footer
      doc.setDrawColor(226, 232, 240);
      doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
    },
    didParseCell: (hookData) => {
      hookData.cell.styles.font = "KhmerFont";
    },
  });

  doc.save(`${filename}.pdf`);
};

/**
 * Print data as a formatted table
 * @param {Array} data - Array of objects
 * @param {Array} columns - Array of column definitions [{ header: 'Name', dataKey: 'name' }]
 * @param {String} title - Print title
 */
export const printTable = (data, columns, title = "Report", options = {}) => {
  if (!data || !data.length) return;
  const { summary = [] } = options;

  const printWindow = window.open("", "", "height=800,width=1000");
  const timestamp = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  let html = `
    <!DOCTYPE html>
    <html lang="km">
    <head>
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Freehand&family=Hanuman:wght@100;300;400;700;900&display=swap');
        
        body {
          font-family: 'Hanuman', Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #1a1a1a;
          -webkit-print-color-adjust: exact;
        }
        
        .header {
          background-color: #1a1a1a;
          color: white;
          padding: 24px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          border-bottom: 4px solid #a68d5e;
        }
        
        .company-info h1 {
          margin: 0;
          font-size: 24px;
          line-height: 1.2;
          letter-spacing: 1px;
        }
        
        .company-info h2 {
          margin: 4px 0 0 0;
          font-size: 18px;
          color: #a68d5e;
          font-weight: 500;
        }
        
        .report-title {
          text-align: right;
        }
        
        .report-title h2 {
          margin: 0;
          font-size: 20px;
          text-transform: uppercase;
        }
        
        .content {
          padding: 0 40px;
        }
        
        .meta-info {
          margin-bottom: 25px;
          font-size: 13px;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 15px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          border: 1px solid #e2e8f0;
        }
        
        th {
          background-color: #1a1a1a;
          color: white;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          border: none;
        }
        
        td {
          padding: 14px 12px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 13px;
        }
        
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        
        .footer {
          margin-top: 50px;
          padding: 20px 40px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #94a3b8;
        }
        
        .summary-section {
          margin-top: 30px;
          border-top: 2px solid #a68d5e;
          padding-top: 15px;
        }

        .summary-row {
          display: flex;
          justify-content: flex-end;
          gap: 40px;
          margin-bottom: 8px;
        }

        .summary-label {
          font-weight: 600;
          color: #1a1a1a;
          font-size: 16px;
        }

        .summary-value {
          font-weight: 800;
          color: #1a1a1a;
          font-size: 18px;
          min-width: 120px;
          text-align: right;
        }

        .signature-section {
          margin-top: 60px;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          page-break-inside: avoid;
        }
        
        .sig-line {
          width: 250px;
          border-top: 2px solid #1a1a1a;
          padding-top: 10px;
          font-weight: 600;
          font-size: 14px;
          text-align: center;
        }
        
        @media print {
          .no-print {
            display: none;
          }
          body {
            padding-bottom: 50px;
          }
           @page {
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info" style="display: flex; align-items: center; gap: 24px;">
          <img src="/src/assets/rsb-cinema.png" alt="Logo" style="height: 70px; filter: brightness(0) invert(1) contrast(100%);">
          <div>
            <h1>NINJA BOOKING SYSTEM</h1>
            <h2>ប្រព័ន្ធកក់ នីនចា</h2>
          </div>
        </div>
        <div class="report-title">
          <h2 style="color: #a68d5e; font-size: 22px;">${title}</h2>
          <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">${timestamp}</div>
        </div>
      </div>
      
      <div class="content">
        <div class="meta-info">
          <div>បង្កើតនៅថ្ងៃទី (Generated Date): ${timestamp}</div>
          <div>ប្រភេទរបាយការណ៍ (Report Type): ${title}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              ${columns.map((col) => `<th>${col.header}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (row) => `
              <tr>
                ${columns.map((col) => {
                  let val = row[col.dataKey] || "";
                  let displayVal = String(val);
                  
                  // Date Formatting
                  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(displayVal)) {
                    displayVal = displayVal.split(" ")[0];
                  }
                  
                  // Currency Formatting
                  const lowHeader = col.header.toLowerCase();
                  const isFinancial = lowHeader.includes('amount') || lowHeader.includes('price') || lowHeader.includes('ទឹកប្រាក់');
                  if (isFinancial && !isNaN(parseFloat(displayVal))) {
                    displayVal = `$${parseFloat(displayVal).toFixed(2)}`;
                  }
                  
                  return `<td style="${isFinancial ? 'text-align: right; font-weight: bold; color: #1a1a1a;' : ''}">${displayVal}</td>`;
                }).join("")}
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="summary-section">
          ${summary.map(item => {
            let val = item.value;
            if (!isNaN(parseFloat(val))) {
              val = `$${parseFloat(val).toFixed(2)}`;
            }
            return `
              <div class="summary-row">
                <span class="summary-label">${item.label}</span>
                <span class="summary-value">${val}</span>
              </div>
            `;
          }).join("")}
        </div>

        <div class="signature-section">
          <div class="sig-line">រៀបចំដោយ (Prepared By)</div>
          <div class="sig-line">អនុម័តដោយ (Approved By)</div>
        </div>
      </div>
      
      <div class="footer">
        <div>ឯកសារសម្ងាត់របស់ក្រុមហ៊ុន - រក្សាសិទ្ធិគ្រប់យ៉ាង (Confidential - All Rights Reserved)</div>
        <div class="no-print">Printed on: ${timestamp}</div>
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            // window.close(); // Optional: close window after printing
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
