import { marked } from 'marked';
import { err, ok, type Result } from '../../lib/result';

export function renderMarkdown(input: string): Result<string, string> {
  try {
    const html = marked.parse(input, { gfm: true, breaks: true, async: false }) as string;
    return ok(html);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(`渲染失败：${msg}`);
  }
}