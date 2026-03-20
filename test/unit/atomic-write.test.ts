import {existsSync, readFileSync, mkdtempSync} from 'fs';
import {tmpdir} from 'os';
import {join} from 'path';

import test from 'ava';

import {atomicWriteFileSync} from '../../app/utils/atomic-write';

test('writes file content correctly', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'hyper-test-'));
  const filePath = join(dir, 'test.json');

  atomicWriteFileSync(filePath, '{"key": "value"}');

  t.true(existsSync(filePath));
  t.is(readFileSync(filePath, 'utf8'), '{"key": "value"}');
});

test('does not leave tmp file after successful write', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'hyper-test-'));
  const filePath = join(dir, 'test.json');

  atomicWriteFileSync(filePath, 'data');

  t.false(existsSync(`${filePath}.tmp`));
});

test('overwrites existing file atomically', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'hyper-test-'));
  const filePath = join(dir, 'test.json');

  atomicWriteFileSync(filePath, 'original');
  atomicWriteFileSync(filePath, 'updated');

  t.is(readFileSync(filePath, 'utf8'), 'updated');
});
