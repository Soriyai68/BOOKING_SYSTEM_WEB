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
export const exportToExcel = (data, filename = "export") => {
  if (!data || !data.length) return;

  const worksheet = XLSX.utils.json_to_sheet(data);
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
) => {
  if (!data || !data.length) return;

  // Use orientation 'p' or 'l' based on column count
  const orientation = columns.length > 6 ? "l" : "p";
  const doc = new jsPDF(orientation);

  // Register Font
  doc.addFileToVFS("KhmerFont.ttf", KHMER_FONT_BASE64);
  doc.addFont("KhmerFont.ttf", "KhmerFont", "normal");

  // Set Global Document Font
  doc.setFont("KhmerFont", "normal");

  // Title with Shaper
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0); // Black RGB
  doc.text(shapeKhmer(title), 14, 22);

  // Subtitle / Timestamp
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100); // Gray RGB
  // doc.text(
  //   shapeKhmer(`បង្កើតនៅថ្ងៃទី: ${new Date().toLocaleString()}`),
  //   14,
  //   30,
  // );

  // Table Data Preparation (Strict Array-of-Arrays)
  const head = [columns.map((col) => shapeKhmer(col.header))];
  const body = data.map((row) =>
    columns.map((col) => {
      let val = row[col.dataKey];

      // Auto-translate common values if they appear in English
      if (typeof val === "string" && KHMER_MAP[val]) {
        val = KHMER_MAP[val];
      }

      return shapeKhmer(val === null || val === undefined ? "" : String(val));
    }),
  );

  autoTable(doc, {
    startY: 35,
    head: head,
    body: body,
    theme: "striped",
    styles: {
      font: "KhmerFont",
      fontStyle: "normal",
      fontSize: 9,
      cellPadding: 3,
      textColor: [0, 0, 0], // Default Body Text Black
    },
    headStyles: {
      fillColor: [63, 81, 181], // Indigo-ish RGB
      textColor: [255, 255, 255], // White RGB
      font: "KhmerFont",
      fontStyle: "normal",
      fontSize: 10,
    },
    bodyStyles: {
      font: "KhmerFont",
      fontStyle: "normal",
    },
    alternateRowStyles: {
      fillColor: [245, 247, 251], // Light background
    },
    margin: { top: 35 },
    // Extreme measures to ensure font is applied to every cell
    didParseCell: (hookData) => {
      hookData.cell.styles.font = "KhmerFont";
    },
  });

  doc.save(`${filename}.pdf`);
};
