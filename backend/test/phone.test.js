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

test('nomor luar negeri disimpan dengan kode negara (+), nomor +62 tetap jadi 0', () => {
  assert.equal(normalizePhone('+65 9123 4567'), '+6591234567');
  assert.equal(normalizePhone('0065 9123 4567'), '+6591234567');
  assert.equal(normalizePhone('+1 (415) 555-2671'), '+14155552671');
  assert.equal(normalizePhone('+44 7911 123456'), '+447911123456');
  assert.equal(normalizePhone('+62 812 3456 7890'), '081234567890');
});

test('nomor luar negeri yang tidak masuk akal ditolak', () => {
  assert.equal(normalizePhone('+12'), null);
  assert.equal(normalizePhone('+0123456789'), null);
  assert.equal(normalizePhone('+1234567890123456'), null);
  assert.equal(normalizePhone('+65 abc 4567'), null);
});

test('nomor yang terlalu pendek, terlalu panjang, atau berisi huruf ditolak', () => {
  assert.equal(normalizePhone('0812345'), null);
  assert.equal(normalizePhone('0812345678901234'), null);
  assert.equal(normalizePhone('0812abc45678'), null);
  assert.equal(normalizePhone(''), null);
  assert.equal(normalizePhone(undefined), null);
});
