import { createHash } from 'crypto';

const PRECISION = 10;
const REGISTER_COUNT = 1 << PRECISION;
const HASH_BITS = 64;
const SUFFIX_BITS = HASH_BITS - PRECISION;
const ALPHA = 0.7213 / (1 + 1.079 / REGISTER_COUNT);

function hashToBigInt(value: string): bigint {
  return createHash('sha256').update(value).digest().readBigUInt64BE(0);
}

function countLeadingZeros(value: bigint, bits: number): number {
  if (value === 0n) return bits;

  let zeros = 0;
  for (let index = bits - 1; index >= 0; index -= 1) {
    if (((value >> BigInt(index)) & 1n) === 1n) break;
    zeros += 1;
  }

  return zeros;
}

function normalizeRegisters(registers?: number[] | null): number[] {
  const normalized = Array.from({ length: REGISTER_COUNT }, (_, index) => {
    const value = registers?.[index];
    return Number.isInteger(value) && value >= 0 ? value : 0;
  });

  return normalized;
}

function estimate(registers: number[]): number {
  const sum = registers.reduce((total, register) => total + 2 ** -register, 0);
  const rawEstimate = (ALPHA * REGISTER_COUNT * REGISTER_COUNT) / sum;
  const emptyRegisters = registers.filter((register) => register === 0).length;

  if (rawEstimate <= 2.5 * REGISTER_COUNT && emptyRegisters > 0) {
    return Math.round(REGISTER_COUNT * Math.log(REGISTER_COUNT / emptyRegisters));
  }

  return Math.round(rawEstimate);
}

export function addHyperLogLogValue(registers: number[], value: string): [number[], number] {
  const nextRegisters = normalizeRegisters(registers);
  const hash = hashToBigInt(value);
  const bucket = Number(hash >> BigInt(SUFFIX_BITS));
  const suffixMask = (1n << BigInt(SUFFIX_BITS)) - 1n;
  const suffix = hash & suffixMask;
  const rank = countLeadingZeros(suffix, SUFFIX_BITS) + 1;

  nextRegisters[bucket] = Math.max(nextRegisters[bucket], rank);

  return [nextRegisters, estimate(nextRegisters)];
}
