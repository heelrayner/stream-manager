// Minimal Node.js ambient declarations for offline TypeScript builds
interface ImportMeta {}

declare const __dirname: string;
declare const require: any;
declare const module: any;

declare var process: {
  env: Record<string, string | undefined>;
  cwd(): string;
};

declare type BufferEncoding =
  | 'ascii'
  | 'utf8'
  | 'utf-8'
  | 'utf16le'
  | 'ucs2'
  | 'ucs-2'
  | 'base64'
  | 'base64url'
  | 'latin1'
  | 'binary'
  | 'hex';

declare class BufferClass extends Uint8Array {
  static from(data: string, encoding?: BufferEncoding): BufferClass;
  static concat(list: BufferClass[]): BufferClass;
  static alloc(size: number): BufferClass;
  toString(encoding?: BufferEncoding): string;
}

declare type Buffer = BufferClass;
declare const Buffer: typeof BufferClass;
declare const console: { log: (...args: any[]) => void; error: (...args: any[]) => void };

declare module 'node:events' {
  export class EventEmitter {
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
  }
}

declare module 'node:http' {
  import { EventEmitter } from 'node:events';
  export interface IncomingMessage extends EventEmitter {
    method?: string;
    url?: string;
    headers: Record<string, string | string[] | undefined>;
    on(event: 'data', listener: (chunk: any) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
  }
  export interface ServerResponse {
    statusCode: number;
    setHeader(name: string, value: string): void;
    write(data: any): void;
    end(data?: any): void;
  }
  export type RequestListener = (req: IncomingMessage, res: ServerResponse) => void;
  export function createServer(listener: RequestListener): { listen: (port: number, cb?: () => void) => void };
}

declare module 'node:url' {
  export interface UrlWithParsedQuery {
    pathname: string | null;
    query: Record<string, string | string[]>;
  }
  export function parse(urlStr: string, parseQueryString?: boolean, slashesDenoteHost?: boolean): UrlWithParsedQuery;
}

declare module 'node:path' {
  export function join(...parts: string[]): string;
  export function resolve(...parts: string[]): string;
  export function normalize(path: string): string;
  export function dirname(path: string): string;
}

declare module 'node:fs' {
  export function readFileSync(path: string, encoding?: string): string;
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function writeFileSync(path: string, data: string): void;
  export function copyFileSync(src: string, dest: string): void;
  export function readdirSync(path: string): string[];
  export function statSync(path: string): { isDirectory(): boolean };
}

declare module 'node:crypto' {
  export function randomBytes(size: number): Buffer;
  export function createHash(algo: string): { update(data: string | Buffer): any; digest(encoding: BufferEncoding): string };
  export function createCipheriv(algo: string, key: Buffer, iv: Buffer): {
    update(data: string, inputEncoding: BufferEncoding, outputEncoding: BufferEncoding): string;
    final(outputEncoding: BufferEncoding): string;
  };
  export function createDecipheriv(algo: string, key: Buffer, iv: Buffer): {
    update(data: string, inputEncoding: BufferEncoding, outputEncoding: BufferEncoding): string;
    final(outputEncoding: BufferEncoding): string;
  };
  export function createHmac(algo: string, key: Buffer): { update(data: string): any; digest(encoding: BufferEncoding): string };
}

declare module 'node:sqlite' {
  export class StatementSync {
    run(...params: any[]): { changes: number; lastInsertRowid?: number };
    all(...params: any[]): any[];
    get(...params: any[]): any;
  }
  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}

declare module 'node:fs/promises' {
  export function readFile(path: string, encoding: string): Promise<string>;
}

declare module 'node:os' {
  export function homedir(): string;
}
