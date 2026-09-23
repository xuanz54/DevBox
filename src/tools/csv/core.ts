import Papa from 'papaparse';
import { err, ok, type Result } from '../../lib/result';

type UnparseInput = Parameters<typeof Papa.unparse>[0];

export function csvToJson(
  input: string,
  delimiter = ',',
  hasHeader = true,
): Result<string, string> {
  if (!input.trim()) return err('输入为空');
  const common = {
    delimiter,
    skipEmptyLines: true as const,
    transformHeader: (h: string) => h.trim(),
  };
  const result = hasHeader
    ? Papa.parse<Record<string, string>>(input, { ...common, header: true })
    : Papa.parse<string[]>(input, { ...common, header: false });
  if (result.errors.length > 0) {
    const first = result.errors[0];
    const loc =
      first && first.row !== undefined && first.row >= 0 ? `（行 ${first.row}）` : '';
    return err(`解析失败${loc}：${first?.message ?? '未知错误'}`);
  }
  return ok(JSON.stringify(result.data, null, 2));
}

export function jsonToCsv(input: string, delimiter = ','): Result<string, string> {
  if (!input.trim()) return err('输入为空');
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(`JSON 解析失败：${msg}`);
  }
  try {
    return ok(Papa.unparse(data as UnparseInput, { delimiter, newline: '\n' }));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(`转换失败：${msg}`);
  }
}