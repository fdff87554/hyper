import test from 'ava';

import {parseSSHUrl, buildSSHCommand} from '../../app/utils/ssh-url';

// Valid SSH URLs
test('parses basic ssh URL', (t) => {
  const result = parseSSHUrl('ssh://host.example.com');
  t.deepEqual(result, {hostname: 'host.example.com', username: '', port: ''});
});

test('parses ssh URL with username', (t) => {
  const result = parseSSHUrl('ssh://user@host.example.com');
  t.deepEqual(result, {hostname: 'host.example.com', username: 'user', port: ''});
});

test('parses ssh URL with username and port', (t) => {
  const result = parseSSHUrl('ssh://user@host.example.com:2222');
  t.deepEqual(result, {hostname: 'host.example.com', username: 'user', port: '2222'});
});

test('parses ssh URL with only port', (t) => {
  const result = parseSSHUrl('ssh://host.example.com:22');
  t.deepEqual(result, {hostname: 'host.example.com', username: '', port: '22'});
});

test('parses ssh URL with hyphenated hostname', (t) => {
  const result = parseSSHUrl('ssh://my-server.example.com');
  t.deepEqual(result, {hostname: 'my-server.example.com', username: '', port: ''});
});

test('parses ssh URL with dotted username', (t) => {
  const result = parseSSHUrl('ssh://user.name@host.example.com');
  t.deepEqual(result, {hostname: 'host.example.com', username: 'user.name', port: ''});
});

// Command injection attempts
test('rejects ssh URL with semicolon in username', (t) => {
  t.is(parseSSHUrl('ssh://user;rm -rf /@host.com'), null);
});

test('rejects ssh URL with backtick in hostname', (t) => {
  t.is(parseSSHUrl('ssh://`whoami`.evil.com'), null);
});

test('rejects ssh URL with $() in hostname', (t) => {
  t.is(parseSSHUrl('ssh://$(whoami).evil.com'), null);
});

test('rejects ssh URL with pipe in username', (t) => {
  t.is(parseSSHUrl('ssh://user|cat /etc/passwd@host.com'), null);
});

test('rejects ssh URL with space in hostname', (t) => {
  t.is(parseSSHUrl('ssh://host.com whoami'), null);
});

// Invalid URLs
test('rejects non-ssh protocol', (t) => {
  t.is(parseSSHUrl('http://host.example.com'), null);
});

test('rejects ftp protocol', (t) => {
  t.is(parseSSHUrl('ftp://host.example.com'), null);
});

test('rejects invalid URL', (t) => {
  t.is(parseSSHUrl('not-a-url'), null);
});

test('rejects empty string', (t) => {
  t.is(parseSSHUrl(''), null);
});

test('rejects port > 65535', (t) => {
  t.is(parseSSHUrl('ssh://host.example.com:99999'), null);
});

test('rejects non-numeric port', (t) => {
  // new URL() should reject non-numeric ports, but let's verify
  t.is(parseSSHUrl('ssh://host.example.com:abc'), null);
});

// buildSSHCommand
test('builds basic SSH command', (t) => {
  t.is(buildSSHCommand({hostname: 'host.example.com', username: '', port: ''}), 'ssh host.example.com');
});

test('builds SSH command with username', (t) => {
  t.is(buildSSHCommand({hostname: 'host.example.com', username: 'user', port: ''}), 'ssh user@host.example.com');
});

test('builds SSH command with username and port', (t) => {
  t.is(
    buildSSHCommand({hostname: 'host.example.com', username: 'user', port: '2222'}),
    'ssh user@host.example.com -p 2222'
  );
});

test('builds SSH command with only port', (t) => {
  t.is(buildSSHCommand({hostname: 'host.example.com', username: '', port: '22'}), 'ssh host.example.com -p 22');
});
