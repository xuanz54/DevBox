import { dump, load } from 'js-yaml';
import { err, ok, type Result } from '../../lib/result';

export function yamlToJson(input: string): Result<string, string> {
  if (!input.trim()) return err('输入为空');
  try {
    const data = load(input);
    return ok(JSON.stringify(data, null, 2));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(`YAML 解析失败：${msg}`);
  }
}

export function jsonToYaml(input: string): Result<string, string> {
  if (!input.trim()) return err('输入为空');
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(`JSON 解析失败：${msg}`);
  }
  try {
    return ok(dump(data));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(`转换失败：${msg}`);
  }
}