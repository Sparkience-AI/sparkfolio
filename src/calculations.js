// Effective annual return, month-end contributions, annual contribution increases.
export function futureValue({ monthly = 20000, years = 20, annualReturn = 0.11, stepUp = 0 } = {}) {
  if (![monthly, years, annualReturn, stepUp].every(Number.isFinite) || monthly < 0 || years < 0 || annualReturn <= -1 || stepUp < 0 || !Number.isInteger(years * 12)) throw new RangeError('Invalid projection inputs');
  const rate = Math.pow(1 + annualReturn, 1 / 12) - 1;
  let balance = 0;
  for (let month = 0; month < years * 12; month++) balance = balance * (1 + rate) + monthly * Math.pow(1 + stepUp, Math.floor(month / 12));
  return balance;
}

export function yearsToTarget(target, { monthly = 20000, annualReturn = 0.12 } = {}) {
  if (!Number.isFinite(target) || target <= 0 || monthly <= 0 || annualReturn < 0) throw new RangeError('Invalid target');
  const rate = Math.pow(1 + annualReturn, 1 / 12) - 1;
  let balance = 0;
  for (let month = 1; month <= 1200; month++) {
    balance = balance * (1 + rate) + monthly;
    if (balance >= target) return month / 12;
  }
  throw new RangeError('Target is outside the 100-year illustration');
}

export const illustrations = {
  fixed_sip: `₹${(futureValue() / 1e7).toFixed(2)} Cr`,
  stepped_sip: `₹${(futureValue({ stepUp: 0.1 }) / 1e7).toFixed(2)} Cr`,
  first_crore: yearsToTarget(1e7).toFixed(1),
  second_crore: (yearsToTarget(2e7) - yearsToTarget(1e7)).toFixed(2)
};
