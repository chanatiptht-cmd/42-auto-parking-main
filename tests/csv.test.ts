import { expect, it } from 'vitest';
import { csvText } from '../src/utils/csv';

it('exports Thai text with UTF-8 BOM and escapes quotes, separators and formulas', () => {
  const csv = csvText([
    ['ทะเบียน', 'ยอดชำระ'],
    ['กก 1234', 120],
    ['ทด,"สอบ"', '=1+1'],
  ]);
  expect(csv.charCodeAt(0)).toBe(0xfeff);
  expect(csv).toContain('"กก 1234","120"');
  expect(csv).toContain('"ทด,""สอบ""","\'=1+1"');
});
