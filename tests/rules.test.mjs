import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { vehicleStatus, rentalDays, validLicense, assertReturnKm,
  canIssueInvoice, assertUnique, assertCanDelete } from '../src/models/rules.ts';

const db = JSON.parse(fs.readFileSync(new URL('../db.json', import.meta.url), 'utf8'));

test('RF16 e RN01: veículo locado ou em manutenção não aparece disponível', () => {
  assert.equal(vehicleStatus(db, 'v2'), 'LOCADO');
  assert.equal(vehicleStatus(db, 'v4'), 'EM MANUTENÇÃO');
  assert.equal(vehicleStatus(db, 'v3'), 'DISPONÍVEL');
});

test('RF08 e RN02: diária arredondada para cima e data prevista posterior', () => {
  assert.equal(rentalDays('2026-11-25T10:00', '2026-11-27T10:00'), 2);
  assert.equal(rentalDays('2026-11-25T10:00', '2026-11-25T11:00'), 1);
  assert.throws(() => rentalDays('2026-11-25T10:00', '2026-11-25T10:00'));
});

test('RN03: cliente com CNH vencida na retirada é recusado', () => {
  assert.equal(validLicense(db.clientes[0], '2026-11-25T10:00'), true);
  assert.equal(validLicense({...db.clientes[0],validadeCnh:'2026-11-24'}, '2026-11-25T10:00'), false);
});

test('RN04: KM de devolução nunca diminui', () => {
  assert.throws(() => assertReturnKm(100, 101, 100));
  assert.throws(() => assertReturnKm(200, 100, 201));
  assert.doesNotThrow(() => assertReturnKm(201, 100, 201));
});

test('RF04 e RF06: placa, chassi, CPF e CNH sem duplicatas', () => {
  assert.throws(() => assertUnique(db.veiculos, {...db.veiculos[2],id:'outro',placa:'ABC1D23'}, ['placa','chassi'], 'Veículo'));
  assert.throws(() => assertUnique(db.clientes, {...db.clientes[2],id:'outro',cpf:db.clientes[0].cpf}, ['cpf','cnh'], 'Cliente'));
});

test('RN05 e RN06: nota somente ao finalizar e exclusão bloqueada por dependentes', () => {
  assert.equal(canIssueInvoice(db.locacoes[0], db), false);
  assert.equal(canIssueInvoice(db.locacoes[1], db), false);
  assert.equal(canIssueInvoice({...db.locacoes[1],id:'loc-nova'}, db), true);
  assert.throws(() => assertCanDelete('marcas', 'm1', db));
  assert.throws(() => assertCanDelete('clientes', 'c1', db));
  assert.doesNotThrow(() => assertCanDelete('manutencoes', 'man1', db));
});
