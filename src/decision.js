export const answerOptions = {
  regime: ['ntr', 'otr'], age: ['20s', '30s', '40s', '50s'],
  dependents: ['yes', 'no'], health: ['yes', 'no'], term: ['yes', 'no'],
  ef: ['none', '<3', '3-6', '6+'], debt: ['yes', 'no'],
  corpPf: ['yes', 'no', 'na'], tax: ['yes', 'no']
};

export function parseAmount(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return null;
  // Exponents and grouping separators are intentionally rejected, never truncated.
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) throw new RangeError('Enter a positive amount with at most two decimal places, without commas or exponents.');
  const [whole, fractional = ''] = text.split('.');
  const cents = BigInt(whole) * 100n + BigInt(fractional.padEnd(2, '0'));
  if (cents > BigInt(Number.MAX_SAFE_INTEGER) * 100n) throw new RangeError('Enter an amount within the supported numeric range.');
  const value = Number(text);
  if (!Number.isFinite(value) || value <= 0 || value > Number.MAX_SAFE_INTEGER) throw new RangeError('Enter a positive amount within the supported numeric range.');
  return value;
}

export function evaluateDecision(answers, rawAmount = '') {
  for (const [key, options] of Object.entries(answerOptions)) {
    if (!options.includes(answers[key])) throw new TypeError(`Please answer: ${key}.`);
  }
  const amount = parseAmount(rawAmount);
  const common = {
    assumptions: `Illustrative checkpoint for the ${answers.age} age bracket under the ${answers.regime === 'ntr' ? 'New' : 'Old'} Tax Regime. Answers are self-reported; age alone does not determine risk capacity. This is not a suitability assessment.`,
    context: amount === null ? '' : `Illustrative amount: ${formatAmount(rawAmount)}. This tool does not allocate this amount.`,
    factIds: []
  };
  let result;
  if (answers.ef === 'none') result = {
    id: 'baseline', step: 1, title: 'Baseline cash access',
    explanation: 'Review a readily accessible cash buffer for immediate expenses before considering longer-term investments. A suitable amount depends on essential spending and access needs.',
    milestone: 'Identify essential monthly expenses and reliable access to cash.', guide: 'topic-cash', factIds: ['rule_baseline_cash_cushion']
  };
  else if (answers.health === 'no') result = {
    id: 'health', step: 2, title: 'Health protection review',
    explanation: 'Review personal health cover, exclusions, deductibles and waiting periods. Employer cover may end with employment; an illustrative cover amount is not a universal requirement.',
    milestone: 'Compare protection needs and policy terms with a qualified insurance professional.', guide: 'topic-healthcare-liability-insulation', factIds: ['health_base_topup_recommendation']
  };
  else if (answers.dependents === 'yes' && answers.term === 'no') result = {
    id: 'dependents', step: 3, title: 'Dependent protection review',
    explanation: 'Financial dependents make income replacement worth reviewing. Cover needs depend on liabilities, existing assets, future expenses and policy terms, rather than a fixed income multiple.',
    milestone: 'Document dependents, liabilities and existing protection.', guide: 'topic-healthcare-liability-insulation'
  };
  else if (answers.corpPf === 'no') result = {
    id: 'employer', step: 4, title: 'Applicable employer benefits',
    explanation: 'Check which EPF or NPS benefits your employer actually offers. A tax deduction limit is not a promise of matching contributions or investment returns. Employment rules and the chosen tax regime matter.',
    milestone: 'Confirm contribution terms and eligibility with payroll.', guide: 'topic-non-taxable-investment-options-new-tax-regime', factIds: ['tax_sec_80ccd2_private', 'tax_sec_80ccd2_govt']
  };
  else if (answers.debt === 'yes') result = {
    id: 'debt', step: 5, title: 'Expensive debt review',
    explanation: 'Compare the effective cost of debt, prepayment charges and required cash reserves. The questionnaire uses 9% as an editorial screening threshold, not a universal repayment rule.',
    milestone: 'List balances, effective rates, penalties and minimum repayments.', guide: 'topic-wealth-acceleration-step-up-sip'
  };
  else if (answers.ef === '<3' || (['40s', '50s'].includes(answers.age) && answers.ef !== '6+')) result = {
    id: 'reserve', step: 6, title: 'Emergency reserve review',
    explanation: 'Review essential expenses, income stability and access time. The framework uses 3–6 months as a starting illustration, with larger reserves worth considering for variable income or greater commitments. Funds can fluctuate and settlement is not instant.',
    milestone: 'Set an expense-based reserve and distinguish immediate cash from invested reserves.', guide: 'topic-cash'
  };
  else result = {
    id: 'planning', step: 7, title: 'Investment planning review',
    explanation: answers.tax === 'no'
      ? `Review long-term tax-advantaged options alongside goals and liquidity. Under the ${answers.regime === 'ntr' ? 'New' : 'Old'} Tax Regime, eligibility and deductions must be checked for the applicable tax year; no personal tax benefit is assumed.`
      : 'Review goal horizons, existing holdings, liquidity and capacity for loss before comparing the illustrative allocation templates. Satellites are optional; age alone does not establish an equity percentage.',
    milestone: 'Write down each goal, date, liquidity need and acceptable loss before choosing an allocation.', guide: 'templates', factIds: answers.tax === 'no' ? ['cap_sec_80c', 'rate_ppf_interest'] : []
  };
  return { ...common, ...result };
}

function formatAmount(raw) {
  const [whole, fractional = ''] = String(raw).trim().split('.');
  // Format the integer as BigInt so very large permitted examples retain their paise.
  return '₹' + new Intl.NumberFormat('en-IN').format(BigInt(whole)) + (fractional ? '.' + fractional.padEnd(2, '0') : '');
}
