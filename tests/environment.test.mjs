// Tests unitaires de l'Environment Router (fonctions pures, sans Supabase).
import assert from 'node:assert/strict';
import { ordersTable, describeEnvironment, isBackendRejection, backendMessage } from '../src/utils/environment.js';

assert.equal(ordersTable('test'), 'orders_test');
assert.equal(ordersTable('production'), 'orders');
assert.equal(ordersTable(undefined), 'orders');

// Repli : migration 008 pas encore appliquee -> comportement historique
const legacy = describeEnvironment({ nom: 'O\'Smash' });
assert.deepEqual([legacy.environment, legacy.fiscalActive, legacy.table], ['production', false, 'orders']);
assert.equal(describeEnvironment(null).table, 'orders');

const test = describeEnvironment({ environment: 'test', fiscal_profile: 'NONE' });
assert.deepEqual([test.isTest, test.fiscalActive, test.table], [true, false, 'orders_test']);

// Un profil FR n'est actif qu'en production
assert.equal(describeEnvironment({ environment: 'test', fiscal_profile: 'FR' }).fiscalActive, false);
const fr = describeEnvironment({ environment: 'production', fiscal_profile: 'FR' });
assert.deepEqual([fr.fiscalActive, fr.table], [true, 'orders']);

// Refus backend (a ne pas rejouer) vs coupure reseau (a rejouer)
assert.equal(isBackendRejection({ code: 'FS001', message: 'x' }), true);
assert.equal(isBackendRejection({ code: '42501', message: 'x' }), true);
assert.equal(isBackendRejection({ code: '', message: 'TypeError: Failed to fetch' }), false);
assert.equal(isBackendRejection({ message: 'Failed to fetch' }), false);
assert.equal(isBackendRejection({ code: 'PGRST301' }), false);
assert.equal(isBackendRejection(null), false);

assert.equal(backendMessage({ message: 'FISCAL_LOCKED: vente verrouillee' }), 'vente verrouillee');
assert.equal(backendMessage(null), 'Operation refusee');

console.log('environment.test.mjs : OK');
