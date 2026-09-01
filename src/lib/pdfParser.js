/**
 * pdfParser.js
 * Extracts text from a PDF File object using pdfjs-dist,
 * then heuristically finds dish name + price pairs.
 */
import * as pdfjsLib from "pdfjs-dist";

// Use the bundled worker so Vite can resolve it
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).href;

/**
 * Extract all text lines from every page of a PDF File.
 * @param {File} file
 * @returns {Promise<string[]>}
 */
async function extractLines(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const lines = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    // Group items by approximate Y position (same line)
    const byY = {};
    for (const item of content.items) {
      const y = Math.round(item.transform[5]);
      if (!byY[y]) byY[y] = [];
      byY[y].push(item.str);
    }
    // Emit lines sorted top-to-bottom
    Object.keys(byY)
      .sort((a, b) => Number(b) - Number(a))
      .forEach((y) => lines.push(byY[y].join(" ").trim()));
  }
  return lines.filter(Boolean);
}

/**
 * Guess a category from a heading line.
 */
const KNOWN_CATEGORIES = [
  "starter", "starters", "appetizer", "appetizers", "salad", "salads",
  "soup", "soups", "main", "mains", "main course", "grill", "grills",
  "dessert", "desserts", "sweet", "beverage", "beverages", "drink",
  "drinks", "sides", "bread", "breakfast", "lunch", "dinner",
];
function detectCategory(line) {
  const l = line.toLowerCase().replace(/[^a-z ]/g, "").trim();
  for (const cat of KNOWN_CATEGORIES) {
    if (l.includes(cat)) {
      // Capitalise first letter of each word
      return cat.replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }
  return null;
}

/**
 * Parse an array of text lines into dish objects.
 * Strategy:
 *  1. Detect category heading lines.
 *  2. Any line containing a number (price) that isn't a heading → extract dish.
 *  3. Price patterns: 45, 45.00, AED 45, 45 AED, د.إ 45
 */
const PRICE_RE = /(?:aed|د\.إ|dhs?)?\s*(\d{1,5}(?:\.\d{1,2})?)\s*(?:aed|\/\s*(?:pax|person|pcs|pc))?/i;
const SKIP_RE = /^\d{1,2}[.)\-]\s/; // numbered list "1. " or "1) "

export function parseMenuLines(lines) {
  const dishes = [];
  let currentCategory = "Main Course";

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.length < 3) continue;

    // Category heading?
    const catGuess = detectCategory(line);
    if (catGuess && line.length < 50) {
      currentCategory = catGuess;
      continue;
    }

    // Does the line contain a price-like number?
    const priceMatch = PRICE_RE.exec(line);
    if (!priceMatch) continue;

    const price = parseFloat(priceMatch[1]);
    if (price < 1 || price > 5000) continue; // sanity bounds

    // Extract dish name: remove the price token and surrounding noise
    let dishName = line
      .replace(priceMatch[0], "")
      .replace(/[\.\-–—]{2,}/g, "") // dot leaders or dashes
      .replace(SKIP_RE, "")
      .replace(/^\d+\s+/, "")       // leading number
      .replace(/[()[\]]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    if (!dishName || dishName.length < 2) continue;
    // Skip obvious non-dish lines (phone, address, etc.)
    if (/^(\+|00|tel|fax|www|http|email|©)/i.test(dishName)) continue;

    dishes.push({
      name: dishName,
      category: currentCategory,
      price,
      description: "",
      is_vegetarian: false,
      is_popular: false,
    });
  }

  return dishes;
}

/**
 * High-level: read a File → return parsed dish rows.
 * @param {File} file
 * @returns {Promise<Array>}
 */
export async function parsePdfMenu(file) {
  const lines = await extractLines(file);
  return parseMenuLines(lines);
}
