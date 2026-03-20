import test from 'ava';

import {isSafeExternalUrl} from '../../app/utils/url-validation';

test('allows http URLs', (t) => {
  t.true(isSafeExternalUrl('http://example.com'));
  t.true(isSafeExternalUrl('http://example.com/path?query=1'));
});

test('allows https URLs', (t) => {
  t.true(isSafeExternalUrl('https://example.com'));
  t.true(isSafeExternalUrl('https://github.com/vercel/hyper'));
});

test('allows ssh URLs', (t) => {
  t.true(isSafeExternalUrl('ssh://user@host.com'));
});

test('rejects javascript URLs', (t) => {
  t.false(isSafeExternalUrl('javascript:alert(1)'));
});

test('rejects file URLs', (t) => {
  t.false(isSafeExternalUrl('file:///etc/passwd'));
});

test('rejects data URLs', (t) => {
  t.false(isSafeExternalUrl('data:text/html,<script>alert(1)</script>'));
});

test('rejects ftp URLs', (t) => {
  t.false(isSafeExternalUrl('ftp://example.com'));
});

test('rejects invalid URLs', (t) => {
  t.false(isSafeExternalUrl('not-a-url'));
  t.false(isSafeExternalUrl(''));
});
