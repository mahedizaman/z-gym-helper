import { z } from 'zod';

export const FoodCategoryEnum = z.enum([
  'grains',
  'lentils',
  'fish',
  'poultry_meat',
  'eggs_dairy',
  'vegetables_bhorta',
  'fruits',
  'snacks_beverages',
  'other',
]);

export type FoodCategory = z.infer<typeof FoodCategoryEnum>;

export function normalizeCategory(cat: string): FoodCategory {
  if (!cat) return 'other';
  const c = cat.toLowerCase().trim().replace(/[-\s_]+/g, '');
  if (['grains', 'grain', 'rice', 'bread', 'roti'].includes(c)) return 'grains';
  if (['lentils', 'lentil', 'dal', 'daal'].includes(c)) return 'lentils';
  if (['fish', 'seafood', 'mach'].includes(c)) return 'fish';
  if (['meat', 'poultry', 'chicken', 'beef', 'mutton', 'poultrymeat', 'mangsho'].includes(c)) return 'poultry_meat';
  if (['eggs', 'egg', 'dairy', 'milk', 'eggsdairy', 'dim', 'dudh'].includes(c)) return 'eggs_dairy';
  if (['vegetables', 'vegetable', 'bhorta', 'shobji', 'vegetablesbhorta'].includes(c)) return 'vegetables_bhorta';
  if (['fruits', 'fruit', 'fol'].includes(c)) return 'fruits';
  if (['snacks', 'snack', 'drinks', 'drink', 'beverages', 'beverage', 'tea', 'coffee', 'snacksbeverages'].includes(c)) return 'snacks_beverages';
  return 'other';
}

export const CsvFoodRowSchema = z.object({
  nameBn: z.string().trim().min(1, 'Bangla name is required').max(100),
  nameEn: z.string().trim().min(1, 'English name is required').max(100),
  aliases: z.array(z.string().trim()).default([]),
  category: FoodCategoryEnum.default('other'),
  kcal: z.coerce.number().min(0, 'Kcal must be 0 or greater').max(2000),
  protein: z.coerce.number().min(0, 'Protein must be 0 or greater').max(100),
  carbs: z.coerce.number().min(0, 'Carbs must be 0 or greater').max(100),
  fat: z.coerce.number().min(0, 'Fat must be 0 or greater').max(100),
  fiber: z.coerce.number().min(0).default(0),
  potassium: z.coerce.number().min(0).default(0),
  zinc: z.coerce.number().min(0).default(0),
  iron: z.coerce.number().min(0).default(0),
  calcium: z.coerce.number().min(0).default(0),
  sodium: z.coerce.number().min(0).default(0),
  servingLabelBn: z.string().trim().default('১ পরিবেশন'),
  servingLabelEn: z.string().trim().default('1 serving'),
  servingGrams: z.coerce.number().positive('Serving grams must be greater than 0').default(100),
  source: z.string().trim().default(''),
  imagePath: z.string().trim().default(''),
  verified: z.boolean().default(false),
});

export type CsvFoodRow = z.infer<typeof CsvFoodRowSchema>;

export interface CsvParseResult {
  validRows: CsvFoodRow[];
  invalidRows: { rowNumber: number; raw: Record<string, string>; errors: string[] }[];
  duplicateCount: number;
  totalParsed: number;
}

/**
 * Parses RFC 4180 CSV with UTF-8 Bangla text, quoted strings, embedded commas and newlines.
 */
export function parseRawCsv(content: string): string[][] {
  const clean = content.replace(/^\uFEFF/, ''); // Strip BOM
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < clean.length) {
    const char = clean[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < clean.length && clean[i + 1] === '"') {
          // Escaped double quote ("")
          currentField += '"';
          i += 2;
          continue;
        } else {
          // Closing quote
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
        i++;
        continue;
      } else if (char === '\r') {
        // Handle CRLF
        if (i + 1 < clean.length && clean[i + 1] === '\n') {
          i++;
        }
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        i++;
        continue;
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  // Handle trailing content
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Normalizes header keys to standard camelCase
 */
function normalizeHeader(h: string): string {
  const clean = h.toLowerCase().trim().replace(/[-_\s]+/g, '');
  if (['namebn', 'bengaliname', 'banglaname', 'naam'].includes(clean)) return 'nameBn';
  if (['nameen', 'englishname', 'name'].includes(clean)) return 'nameEn';
  if (['aliases', 'alias', 'alternate', 'synonyms'].includes(clean)) return 'aliases';
  if (['category', 'cat', 'type'].includes(clean)) return 'category';
  if (['kcal', 'calories', 'cal', 'calorie'].includes(clean)) return 'kcal';
  if (['protein', 'prot'].includes(clean)) return 'protein';
  if (['carbs', 'carbohydrates', 'carb'].includes(clean)) return 'carbs';
  if (['fat', 'fats', 'lipid'].includes(clean)) return 'fat';
  if (['fiber', 'fibre'].includes(clean)) return 'fiber';
  if (['potassium', 'k'].includes(clean)) return 'potassium';
  if (['zinc', 'zn'].includes(clean)) return 'zinc';
  if (['iron', 'fe'].includes(clean)) return 'iron';
  if (['calcium', 'ca'].includes(clean)) return 'calcium';
  if (['sodium', 'na'].includes(clean)) return 'sodium';
  if (['servinglabelbn', 'servingbn', 'portionbn'].includes(clean)) return 'servingLabelBn';
  if (['servinglabelen', 'servingen', 'portionen', 'servinglabel'].includes(clean)) return 'servingLabelEn';
  if (['servinggrams', 'grams', 'gram', 'servingweight', 'weight'].includes(clean)) return 'servingGrams';
  if (['source', 'ref', 'reference', 'citation'].includes(clean)) return 'source';
  if (['imagepath', 'image', 'img', 'photo'].includes(clean)) return 'imagePath';
  return h.trim();
}

/**
 * Parses, validates, and deduplicates food CSV rows.
 */
export function parseFoodCsv(content: string, options: { markVerified?: boolean } = {}): CsvParseResult {
  const rows = parseRawCsv(content);
  if (rows.length < 2) {
    return { validRows: [], invalidRows: [], duplicateCount: 0, totalParsed: 0 };
  }

  const rawHeaders = rows[0];
  const headers = rawHeaders.map(normalizeHeader);

  const validRows: CsvFoodRow[] = [];
  const invalidRows: { rowNumber: number; raw: Record<string, string>; errors: string[] }[] = [];
  const seenEn = new Set<string>();
  const seenBn = new Set<string>();
  let duplicateCount = 0;

  // Maximum row limit: 2000
  const dataRows = rows.slice(1, 2001);

  for (let idx = 0; idx < dataRows.length; idx++) {
    const rowNumber = idx + 2; // Line 1 is header
    const rowValues = dataRows[idx];
    const rawObj: Record<string, string> = {};

    headers.forEach((h, colIdx) => {
      rawObj[h] = rowValues[colIdx] || '';
    });

    // Extract aliases split by '|'
    const rawAliases = rawObj.aliases
      ? rawObj.aliases
          .split('|')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const category = normalizeCategory(rawObj.category);

    // Format for Zod parsing
    const candidate = {
      nameBn: rawObj.nameBn || '',
      nameEn: rawObj.nameEn || '',
      aliases: rawAliases,
      category,
      kcal: rawObj.kcal === '' ? undefined : rawObj.kcal,
      protein: rawObj.protein === '' ? undefined : rawObj.protein,
      carbs: rawObj.carbs === '' ? undefined : rawObj.carbs,
      fat: rawObj.fat === '' ? undefined : rawObj.fat,
      fiber: rawObj.fiber === '' ? 0 : rawObj.fiber,
      potassium: rawObj.potassium === '' ? 0 : rawObj.potassium,
      zinc: rawObj.zinc === '' ? 0 : rawObj.zinc,
      iron: rawObj.iron === '' ? 0 : rawObj.iron,
      calcium: rawObj.calcium === '' ? 0 : rawObj.calcium,
      sodium: rawObj.sodium === '' ? 0 : rawObj.sodium,
      servingLabelBn: rawObj.servingLabelBn || '১ পরিবেশন',
      servingLabelEn: rawObj.servingLabelEn || '1 serving',
      servingGrams: rawObj.servingGrams === '' ? 100 : rawObj.servingGrams,
      source: rawObj.source || '',
      imagePath: rawObj.imagePath || '',
      verified: Boolean(options.markVerified && rawObj.source?.trim()),
    };

    const parsed = CsvFoodRowSchema.safeParse(candidate);

    if (!parsed.success) {
      invalidRows.push({
        rowNumber,
        raw: rawObj,
        errors: parsed.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`),
      });
      continue;
    }

    const row = parsed.data;
    const normalizedEn = row.nameEn.toLowerCase().trim();
    const normalizedBn = row.nameBn.trim();

    if (seenEn.has(normalizedEn) || seenBn.has(normalizedBn)) {
      duplicateCount++;
    } else {
      seenEn.add(normalizedEn);
      seenBn.add(normalizedBn);
    }

    validRows.push(row);
  }

  return {
    validRows,
    invalidRows,
    duplicateCount,
    totalParsed: dataRows.length,
  };
}

/**
 * Standard CSV Template with real Bangladeshi food examples
 */
export const FOOD_CSV_TEMPLATE = `nameBn,nameEn,aliases,category,kcal,protein,carbs,fat,fiber,potassium,zinc,iron,calcium,sodium,servingLabelBn,servingLabelEn,servingGrams,source,imagePath
"ইলিশ মাছ ভাজা","Ilish Mach Bhaja","Hilsa Fish Fry|Fried Hilsa","fish",310,21.5,0.0,25.0,0.0,320,1.2,1.8,180,65,"১ টুকরা","1 piece",100,"FCTB (INFS, University of Dhaka)","/foods/ilish-mach-bhaja.webp"
"চিকেন খিচুড়ি","Chicken Khichuri","Bhoona Khichuri|Murgh Khichuri","grains",185,9.2,22.0,6.5,2.1,210,1.5,1.4,35,320,"১ বাটি","1 bowl",200,"BIRDEM Nutrition Guidelines","/foods/chicken-khichuri.webp"
"লাল শাক ভাজি","Lal Shak Bhaji","Red Amaranth Stir Fry","vegetables",75,2.8,4.5,4.8,3.2,380,0.9,4.2,210,85,"১ বাটি","1 bowl",150,"BARI Horticulture Division",""
`;
