import test from 'ava';

import {escapeCmdExe, escapePosix, escapePowerShell, escapeForShell} from '../../app/utils/shell-escape';

// cmd.exe escaping
test('escapeCmdExe escapes percent signs', (t) => {
  t.is(escapeCmdExe('hello%PATH%world'), '"hello%%PATH%%world"');
});

test('escapeCmdExe escapes ampersand', (t) => {
  t.is(escapeCmdExe('test&whoami'), '"test^&whoami"');
});

test('escapeCmdExe escapes pipe', (t) => {
  t.is(escapeCmdExe('test|cat'), '"test^|cat"');
});

test('escapeCmdExe escapes angle brackets', (t) => {
  t.is(escapeCmdExe('test>out<in'), '"test^>out^<in"');
});

test('escapeCmdExe escapes caret', (t) => {
  t.is(escapeCmdExe('test^caret'), '"test^^caret"');
});

test('escapeCmdExe escapes exclamation mark (delayed expansion)', (t) => {
  t.is(escapeCmdExe('!VAR!'), '"^!VAR^!"');
});

test('escapeCmdExe escapes double quotes', (t) => {
  t.is(escapeCmdExe('say "hello"'), '"say ^"hello^""');
});

test('escapeCmdExe handles normal paths', (t) => {
  t.is(escapeCmdExe('C:\\Users\\test\\file.txt'), '"C:\\Users\\test\\file.txt"');
});

test('escapeCmdExe handles complex injection attempt', (t) => {
  t.is(escapeCmdExe('C:\\Users\\test&whoami\\file.txt'), '"C:\\Users\\test^&whoami\\file.txt"');
});

// POSIX escaping
test('escapePosix wraps in single quotes', (t) => {
  t.is(escapePosix('hello world'), "'hello world'");
});

test('escapePosix escapes embedded single quotes', (t) => {
  t.is(escapePosix("it's"), "'it'\\''s'");
});

test('escapePosix handles shell metacharacters', (t) => {
  t.is(escapePosix('test;rm -rf /'), "'test;rm -rf /'");
});

test('escapePosix handles backticks', (t) => {
  t.is(escapePosix('`whoami`'), "'`whoami`'");
});

test('escapePosix handles dollar sign', (t) => {
  t.is(escapePosix('$(whoami)'), "'$(whoami)'");
});

// PowerShell escaping
test('escapePowerShell wraps in single quotes', (t) => {
  t.is(escapePowerShell('hello world'), "'hello world'");
});

test('escapePowerShell doubles embedded single quotes', (t) => {
  t.is(escapePowerShell("it's"), "'it''s'");
});

// escapeForShell dispatch
test('escapeForShell uses cmd.exe escaping for cmd.exe', (t) => {
  t.is(escapeForShell('test&whoami', 'C:\\Windows\\System32\\cmd.exe'), '"test^&whoami"');
});

test('escapeForShell uses PowerShell escaping for pwsh.exe', (t) => {
  t.is(escapeForShell("it's", 'C:\\Program Files\\PowerShell\\7\\pwsh.exe'), "'it''s'");
});

test('escapeForShell uses PowerShell escaping for powershell.exe', (t) => {
  t.is(
    escapeForShell("it's", 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'),
    "'it''s'"
  );
});

test('escapeForShell uses POSIX escaping for bash', (t) => {
  t.is(escapeForShell("it's", '/bin/bash'), "'it'\\''s'");
});

test('escapeForShell uses POSIX escaping for null shell', (t) => {
  t.is(escapeForShell('test', null), "'test'");
});

test('escapeForShell uses POSIX escaping for undefined shell', (t) => {
  t.is(escapeForShell('test', undefined), "'test'");
});
