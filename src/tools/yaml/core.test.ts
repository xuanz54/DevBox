import { describe, expect, it } from 'vitest';
import { jsonToYaml, yamlToJson } from './core';

describe('yaml', () => {
  it('converts yaml to json', () => {
    const r = yamlToJson('name: DevBox\nversion: 1.0\n');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(JSON.parse(r.value)).toEqual({ name: 'DevBox', version: 1 });
    }
  });

  it('converts json to yaml and back', () => {
    const json = JSON.stringify({ a: 1, b: [true, 'x'], c: { d: null } });
    const y = jsonToYaml(json);
    expect(y.ok).toBe(true);
    if (!y.ok) return;
    const back = yamlToJson(y.value);
    expect(back.ok).toBe(true);
    if (back.ok) {
      expect(JSON.parse(back.value)).toEqual(JSON.parse(json));
    }
  });

  it('rejects empty and invalid input', () => {
    expect(yamlToJson('   ').ok).toBe(false);
    expect(jsonToYaml('nope').ok).toBe(false);
    expect(jsonToYaml('{ not json').ok).toBe(false);
  });

  it('handles nested anchors/lists', () => {
    const y = 'servers:\n  - host: a\n    port: 80\n  - host: b\n    port: 443\n';
    const r = yamlToJson(y);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(JSON.parse(r.value)).toEqual({
        servers: [
          { host: 'a', port: 80 },
          { host: 'b', port: 443 },
        ],
      });
    }
  });
});