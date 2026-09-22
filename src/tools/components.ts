import type { ComponentType } from 'react';
import JsonFormatTool from './json-format/Tool';
import JsonDiffTool from './json-diff/Tool';
import Base64Tool from './base64/Tool';
import UrlTool from './url/Tool';
import HtmlEntityTool from './html-entity/Tool';
import RadixTool from './radix/Tool';
import JwtTool from './jwt/Tool';
import TimestampTool from './timestamp/Tool';
import RegexTool from './regex/Tool';
import TextDiffTool from './text-diff/Tool';
import TextStatTool from './text-stat/Tool';
import CaseTool from './case/Tool';
import HashTool from './hash/Tool';
import UuidTool from './uuid/Tool';
import PasswordTool from './password/Tool';
import HttpTool from './http/Tool';

export const toolComponents: Record<string, ComponentType> = {
  'json-format': JsonFormatTool,
  'json-diff': JsonDiffTool,
  base64: Base64Tool,
  url: UrlTool,
  'html-entity': HtmlEntityTool,
  radix: RadixTool,
  jwt: JwtTool,
  timestamp: TimestampTool,
  regex: RegexTool,
  'text-diff': TextDiffTool,
  'text-stat': TextStatTool,
  case: CaseTool,
  hash: HashTool,
  uuid: UuidTool,
  password: PasswordTool,
  http: HttpTool,
};
