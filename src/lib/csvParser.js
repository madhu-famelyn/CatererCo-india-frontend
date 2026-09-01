/**
 * csvParser.js
 * Parses CSV and Excel files (.csv, .xlsx, .xls) using the xlsx library.
 * Returns an array of dish objects compatible with the menu API.
 */
import * as XLSX from "xlsx";

function normaliseCategory(raw) {
  if (!raw) return "Main Course";
  const str = String(raw).trim();
  if (!str) return "Main Course";
  return str;
}

function normalisePrice(raw) {
  if (!raw && raw !== 0) return 0;
  const n = parseFloat(String(raw).replace(/[^\d.]/g, ""));
  return isNaN(n) ? 0 : n;
}

function normaliseVeg(raw) {
  if (!raw && raw !== 0) return false;
  const s = String(raw).toLowerCase().trim();
  if (s.includes("non") || s.includes("nveg") || s.includes("non-veg") || s === "no" || s === "false" || s === "0") {
    return false;
  }
  if (s.includes("veg") || s === "yes" || s === "true" || s === "1" || s === "y" || s === "✓") {
    return true;
  }
  return false;
}

/**
 * Parse a File object (CSV or Excel) into dish rows.
 * @param {File} file
 * @returns {Promise<Array>}
 */
export async function parseSpreadsheetMenu(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) return [];

  // Use the first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to array-of-objects using first row as header
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (!rawRows || !rawRows.length) return [];

  return rawRows
    .map((row) => {
      // Build a lookup map of cleaned column names to their raw values
      const cleanMap = {};
      for (const [k, v] of Object.entries(row)) {
        const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (cleanK) {
          cleanMap[cleanK] = v;
        }
      }

      // Helper to find column values by exact key priority
      const getVal = (...keys) => {
        for (const target of keys) {
          const cleanTarget = target.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (cleanMap[cleanTarget] !== undefined && cleanMap[cleanTarget] !== null && String(cleanMap[cleanTarget]).trim() !== "") {
            return cleanMap[cleanTarget];
          }
        }
        return "";
      };

      const nameVal = getVal("itemname", "dishname", "item", "dish", "name", "title");
      const categoryVal = getVal("categoryname", "category", "course", "section", "cat");
      const cuisineVal = getVal("cuisinetype", "cuisine", "specialty", "origin");
      const vegVal = getVal("vegnonveg", "veg", "vegetarian", "isveg", "diet");
      const priceVal = getVal("priceaed", "price", "cost", "rate", "amount", "aed");
      const descVal = getVal("description", "desc", "details", "info");

      const name = String(nameVal).trim();
      const category = normaliseCategory(categoryVal);
      const cuisine = String(cuisineVal || "Arabic").trim();
      const price = normalisePrice(priceVal);
      const is_vegetarian = normaliseVeg(vegVal);
      const description = String(descVal).trim();

      return {
        name,
        category,
        cuisine: cuisine || "Arabic",
        price,
        description,
        is_vegetarian,
        is_popular: false,
      };
    })
    .filter((r) => r.name && r.price > 0);
}

