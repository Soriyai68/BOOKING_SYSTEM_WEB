import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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

  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  // Add table
  autoTable(doc, {
    startY: 35,
    columns: columns,
    body: data,
    theme: "striped",
    headStyles: { fillColor: [99, 102, 241] }, // Indigo color matching theme
    margin: { top: 35 },
  });

  doc.save(`${filename}.pdf`);
};
