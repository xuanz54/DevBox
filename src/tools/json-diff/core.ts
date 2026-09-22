import { ok, err, type Result } from '../../lib/result';

export interface DiffLine {
  readonly type: 'same' | 'add' | 'del';
  readonly text: string;
}

function splitLines(text: string): string[] {
  if (text === '') return [];
  return text.replace(/\r\n/g, '\n').split('\n');
}

/** 行级 LCS Diff */
export function diffLines(left: string, right: string): DiffLine[] {
  const a = splitLines(left);
  const b = splitLines(right);
  const n = a.length;
  const m = b.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array.from({ length: m + 1 }, () => 0),
  );

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      const ai = a[i];
      const bj = b[j];
      const row = dp[i];
      const next = dp[i + 1];
      if (!row) continue;
      if (next && ai !== undefined && bj !== undefined && ai === bj) {
        row[j] = (next[j + 1] ?? 0) + 1;
      } else {
        row[j] = Math.max(next?.[j] ?? 0, row[j + 1] ?? 0);
      }
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    const ai = a[i];
    const bj = b[j];
    if (ai !== undefined && bj !== undefined && ai === bj) {
      result.push({ type: 'same', text: ai });
      i++;
      j++;
    } else if ((dp[i + 1]?.[j] ?? 0) >= (dp[i]?.[j + 1] ?? 0)) {
      if (ai !== undefined) result.push({ type: 'del', text: ai });
      i++;
    } else {
      if (bj !== undefined) result.push({ type: 'add', text: bj });
      j++;
    }
  }
  while (i < n) {
    const ai = a[i];
    if (ai !== undefined) result.push({ type: 'del', text: ai });
    i++;
  }
  while (j < m) {
    const bj = b[j];
    if (bj !== undefined) result.push({ type: 'add', text: bj });
    j++;
  }
  return result;
}

export function prettyForDiff(input: string): Result<string, string> {
  const trimmed = input.trim();
  if (!trimmed) return err('输入为空');
  try {
    const value: unknown = JSON.parse(trimmed);
    return ok(JSON.stringify(value, null, 2));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(`JSON 解析失败：${msg}`);
  }
}

export function summarizeDiff(lines: DiffLine[]): { added: number; removed: number; same: number } {
  let added = 0;
  let removed = 0;
  let same = 0;
  for (const line of lines) {
    if (line.type === 'add') added++;
    else if (line.type === 'del') removed++;
    else same++;
  }
  return { added, removed, same };
}
