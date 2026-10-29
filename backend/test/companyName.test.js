import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCompanyName, tidyDisplayName } from '../src/shared/utils/companyName.js';

test('nama yang hanya beda huruf, tanda baca, atau bentuk badan usaha jadi sama', () => {
  assert.equal(normalizeCompanyName('PT. Maju Jaya'), 'maju jaya');
  assert.equal(normalizeCompanyName('pt maju jaya'), 'maju jaya');
  assert.equal(normalizeCompanyName('Maju Jaya Tbk'), 'maju jaya');
  assert.equal(normalizeCompanyName('  MAJU   JAYA, PT  '), 'maju jaya');
  assert.equal(normalizeCompanyName('PT Maju Jaya (Persero) Tbk.'), 'maju jaya');
  assert.equal(normalizeCompanyName('CV. Maju-Jaya'), 'maju jaya');
});

test('kata yang hanya mengandung pt/cv di tengah kata tidak ikut dibuang', () => {
  assert.equal(normalizeCompanyName('Ptolemy Coffee'), 'ptolemy coffee');
  assert.equal(normalizeCompanyName('Cvita Studio'), 'cvita studio');
});

test('nama yang isinya hanya bentuk badan usaha atau tanda baca jadi kosong', () => {
  assert.equal(normalizeCompanyName('PT'), '');
  assert.equal(normalizeCompanyName(' . , '), '');
  assert.equal(normalizeCompanyName(''), '');
  assert.equal(normalizeCompanyName(null), '');
});

test('nama tampilan hanya dirapikan spasinya', () => {
  assert.equal(tidyDisplayName('  PT   Maju  Jaya '), 'PT Maju Jaya');
  assert.equal(tidyDisplayName('pt maju jaya'), 'pt maju jaya');
});
