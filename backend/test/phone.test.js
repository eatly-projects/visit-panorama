import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhone } from '../src/shared/utils/phone.js';

test('berbagai penulisan nomor dirapikan jadi berawalan 0', () => {
  assert.equal(normalizePhone('081234567890'), '081234567890');
  assert.equal(normalizePhone('+62 812-3456-7890'), '081234567890');
  assert.equal(normalizePhone('62 812 3456 7890'), '081234567890');
  assert.equal(normalizePhone('(0812) 3456.7890'), '081234567890');
  assert.equal(normalizePhone('81234567890'), '081234567890');
  assert.equal(normalizePhone('021 5551234'), '0215551234');
});

test('nomor yang terlalu pendek, terlalu panjang, atau berisi huruf ditolak', () => {
  assert.equal(normalizePhone('0812345'), null);
  assert.equal(normalizePhone('0812345678901234'), null);
  assert.equal(normalizePhone('0812abc45678'), null);
  assert.equal(normalizePhone(''), null);
  assert.equal(normalizePhone(undefined), null);
});
