import {renameSync, writeFileSync} from 'fs';

export function atomicWriteFileSync(filePath: string, data: string, encoding: BufferEncoding = 'utf8'): void {
  const tmpPath = `${filePath}.tmp`;
  writeFileSync(tmpPath, data, encoding);
  renameSync(tmpPath, filePath);
}
