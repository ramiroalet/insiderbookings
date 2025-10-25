import { test } from 'node:test';
import assert from 'node:assert';
import { getRoleFromReq } from '../src/helpers/getRoleFromReq.js';

test('unauthenticated request defaults to guest role', () => {
  const req = { query: { user_role: '99' }, headers: { 'x-user-role': '5' } };
  assert.strictEqual(getRoleFromReq(req), 1);
});

test('authenticated request uses token role over query/header', () => {
  const req = {
    user: { role: 5 },
    query: { user_role: '1' },
    headers: { 'x-user-role': '1' }
  };
  assert.strictEqual(getRoleFromReq(req), 5);
});
