import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './core';

describe('markdown', () => {
  it('renders headings, lists and code', () => {
    const r = renderMarkdown('# 标题\n\n- a\n- b\n\n```js\n1\n```');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toContain('<h1');
      expect(r.value).toContain('<li>a</li>');
      expect(r.value).toContain('<pre>');
      expect(r.value).toContain('<code class="language-js">');
    }
  });

  it('renders tables and links', () => {
    const r = renderMarkdown('| a | b |\n| - | - |\n| 1 | 2 |\n\n[link](https://x.dev)');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toContain('<table>');
      expect(r.value).toContain('<th>a</th>');
      expect(r.value).toContain('<a href="https://x.dev">link</a>');
    }
  });

  it('handles gfm line breaks', () => {
    const r = renderMarkdown('one  \ntwo');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toContain('<br>');
    }
  });
});