import { describe, it, expect } from 'vitest';
import {
  parseRawCsv,
  parseFoodCsv,
  normalizeCategory,
  FOOD_CSV_TEMPLATE,
} from './csv-parser';

describe('CSV Parser & Bulk Food Import Suite', () => {
  describe('parseRawCsv RFC 4180 Compliance', () => {
    it('correctly handles UTF-8 Bangla characters, commas, and quotes', () => {
      const csv = `"নাম","English Name","বিবরণ"\n"ইলিশ মাছ, ভাজা","Fried Hilsa","খুব সুস্বাদু"\n"গরুর মাংস","Beef Bhuna","ঝাল ভুনা"`;
      const parsed = parseRawCsv(csv);

      expect(parsed.length).toBe(3);
      expect(parsed[0]).toEqual(['নাম', 'English Name', 'বিবরণ']);
      expect(parsed[1]).toEqual(['ইলিশ মাছ, ভাজা', 'Fried Hilsa', 'খুব সুস্বাদু']);
      expect(parsed[2]).toEqual(['গরুর মাংস', 'Beef Bhuna', 'ঝাল ভুনা']);
    });

    it('handles escaped quotes ("") inside quoted fields', () => {
      const csv = `"nameBn","desc"\n"ডিম ভুনা","দেশি ""হাসের"" ডিম"`;
      const parsed = parseRawCsv(csv);

      expect(parsed.length).toBe(2);
      expect(parsed[1][1]).toBe('দেশি "হাসের" ডিম');
    });

    it('strips UTF-8 Byte Order Mark (BOM)', () => {
      const bomCsv = '\uFEFFnameBn,nameEn\n"ভাত","Rice"';
      const parsed = parseRawCsv(bomCsv);

      expect(parsed[0][0]).toBe('nameBn');
      expect(parsed[1]).toEqual(['ভাত', 'Rice']);
    });

    it('gracefully handles empty cells and CRLF line breaks', () => {
      const csv = "nameBn,nameEn,source\r\n\"ভাত\",\"Rice\",\r\n\"রুটি\",\"Roti\",\"BIRDEM\"\r\n";
      const parsed = parseRawCsv(csv);

      expect(parsed.length).toBe(3);
      expect(parsed[1]).toEqual(['ভাত', 'Rice', '']);
      expect(parsed[2]).toEqual(['রুটি', 'Roti', 'BIRDEM']);
    });
  });

  describe('Category Normalization', () => {
    it('normalizes various colloquial and English category labels to canonical enum', () => {
      expect(normalizeCategory('rice')).toBe('grains');
      expect(normalizeCategory('dal')).toBe('lentils');
      expect(normalizeCategory('mach')).toBe('fish');
      expect(normalizeCategory('meat')).toBe('poultry_meat');
      expect(normalizeCategory('chicken')).toBe('poultry_meat');
      expect(normalizeCategory('dairy')).toBe('eggs_dairy');
      expect(normalizeCategory('shobji')).toBe('vegetables_bhorta');
      expect(normalizeCategory('fol')).toBe('fruits');
      expect(normalizeCategory('tea')).toBe('snacks_beverages');
      expect(normalizeCategory('unknown_item')).toBe('other');
    });
  });

  describe('parseFoodCsv Validation & Deduplication', () => {
    it('successfully parses the standard template CSV with 3 items', () => {
      const result = parseFoodCsv(FOOD_CSV_TEMPLATE);

      expect(result.validRows.length).toBe(3);
      expect(result.invalidRows.length).toBe(0);
      expect(result.duplicateCount).toBe(0);

      const ilish = result.validRows[0];
      expect(ilish.nameBn).toBe('ইলিশ মাছ ভাজা');
      expect(ilish.nameEn).toBe('Ilish Mach Bhaja');
      expect(ilish.category).toBe('fish');
      expect(ilish.kcal).toBe(310);
      expect(ilish.protein).toBe(21.5);
      expect(ilish.aliases).toEqual(['Hilsa Fish Fry', 'Fried Hilsa']);
      expect(ilish.imagePath).toBe('/foods/ilish-mach-bhaja.webp');
    });

    it('detects duplicate food items within the same CSV', () => {
      const csv = `nameBn,nameEn,category,kcal,protein,carbs,fat
"সিদ্ধ ডিম","Boiled Egg","dairy",155,13.0,1.1,11.0
"সিদ্ধ ডিম","Boiled Egg","dairy",155,13.0,1.1,11.0`;

      const result = parseFoodCsv(csv);
      expect(result.validRows.length).toBe(2);
      expect(result.duplicateCount).toBe(1);
    });

    it('flags invalid numeric values as invalid rows', () => {
      const csv = `nameBn,nameEn,category,kcal,protein,carbs,fat
"তেহারি","Beef Tehari","grains",-50,invalid,50,20
"খিচুড়ি","Khichuri","grains",200,8,30,5`;

      const result = parseFoodCsv(csv);
      expect(result.validRows.length).toBe(1);
      expect(result.invalidRows.length).toBe(1);
      expect(result.invalidRows[0].rowNumber).toBe(2);
      expect(result.invalidRows[0].errors.some((e) => e.includes('kcal'))).toBe(true);
    });

    it('marks verified strictly when markVerified is true AND source citation is present', () => {
      const csv = `nameBn,nameEn,category,kcal,protein,carbs,fat,source
"মুগ ডাল","Moong Dal","lentils",120,8.5,18.0,1.0,"INFS Dhaka University"
"আম","Mango","fruits",60,0.8,15.0,0.4,""`;

      const unverifiedResult = parseFoodCsv(csv, { markVerified: false });
      expect(unverifiedResult.validRows[0].verified).toBe(false);
      expect(unverifiedResult.validRows[1].verified).toBe(false);

      const verifiedResult = parseFoodCsv(csv, { markVerified: true });
      // Row 1 has source citation -> verified: true
      expect(verifiedResult.validRows[0].verified).toBe(true);
      // Row 2 has empty source -> verified: false even though markVerified was checked
      expect(verifiedResult.validRows[1].verified).toBe(false);
    });

    it('enforces maximum row limit of 2000', () => {
      let largeCsv = 'nameBn,nameEn,category,kcal,protein,carbs,fat\n';
      for (let i = 1; i <= 2100; i++) {
        largeCsv += `"খাবার ${i}","Food ${i}","grains",100,5,20,1\n`;
      }

      const result = parseFoodCsv(largeCsv);
      expect(result.totalParsed).toBe(2000);
      expect(result.validRows.length).toBe(2000);
    });
  });
});
