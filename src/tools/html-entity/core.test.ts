import { describe, expect, it } from 'vitest';
import { decodeHtmlEntities, encodeHtmlEntities } from './core';

describe('html entity', () => {
  it('encodes special chars', () => {
    expect(encodeHtmlEntities('<a href="x">\'&\'</a>')).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
    );
  });

  it('decodes named/numeric', () => {
    const r = decodeHtmlEntities('&lt;div&gt;&nbsp;&#65;&#x42;');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe('<div> AB');
  });

  it('keeps unknown entities', () => {
    const r = decodeHtmlEntities('&unknownthing;');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe('&unknownthing;');
  });
});
