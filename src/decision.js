import registry from './data/framework-facts.json' with { type: 'json' };
export const decisionPolicy = registry._decision_model;
export const answerOptions = {
  regime: ['ntr', 'otr'], age: ['20s', '30s', '40s', '50s'],
  dependents: ['yes', 'no'], health: ['yes', 'no'], term: ['yes', 'no'],
  ef: ['none', '<3', '3-6', '6+'], debt: ['yes', 'no'],
  corpPf: ['yes', 'no', 'na'], tax: ['yes', 'no'],
  taxBracket: [...new Set(Object.values(decisionPolicy.brackets).flat())],
  horizon: Object.keys(decisionPolicy.horizon_bins), capacity: Object.keys(decisionPolicy.risk_answers)
};
export const validBrackets = regime => decisionPolicy.brackets[regime] || [];
const currency = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
const money = value => '₹' + currency.format(value);

export function illustrateTax(bracket) {
  if (!answerOptions.taxBracket.includes(bracket)) throw new TypeError('Choose a supported marginal tax bracket.');
  if (bracket === 'unknown') return null;
  const rate = Number(bracket) / 100;
  const effectiveRate = rate * (1 + decisionPolicy.cess_rate);
  const tax = Math.round(decisionPolicy.illustrative_income * effectiveRate * 100) / 100;
  return { gross: decisionPolicy.illustrative_income, rate, effectiveRate, tax, retained: decisionPolicy.illustrative_income - tax };
}

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
  if (!validBrackets(answers.regime).includes(answers.taxBracket)) throw new TypeError('Choose a marginal bracket available under the selected tax regime.');
  const amount = parseAmount(rawAmount);
  const cards = [];
  function add(id, title, explanation, action, { checkpoint = null, category = 'Foundation', sourceIds = ['readiness'], factIds = [], metrics = [] } = {}) {
    cards.push({ id, title, explanation, action, checkpoint, category, sourceIds, factIds, metrics });
  }
  if (answers.ef === 'none') add('baseline', 'Baseline cash access',
    'You reported no emergency reserve. Immediate expenses need reliable cash access; a long lock-in or fluctuating investment can leave a cash shortfall.',
    'List essential monthly expenses and establish accessible cash before committing new money to long-term products.', { checkpoint: 1, factIds: ['rule_baseline_cash_cushion'] });
  if (answers.health === 'no') add('health', 'Health protection review',
    'You reported employer-only cover or no cover. Employer protection may end with employment; policy exclusions, waiting periods and deductibles matter.',
    'Review personal protection and policy terms against your household needs with a qualified insurance professional.', { checkpoint: 2, factIds: ['health_base_topup_recommendation'] });
  if (answers.dependents === 'yes' && answers.term === 'no') add('dependents', 'Dependent protection review',
    'You reported financial dependents without active term cover. An income interruption could affect their essential needs.',
    'Document liabilities, dependents’ future expenses, existing assets and cover before assessing an income-replacement gap.', { checkpoint: 3 });
  if (answers.corpPf === 'no') add('employer', 'Applicable employer benefits',
    'You have not reviewed applicable employer benefits. A tax deduction ceiling is not an employer match or a guaranteed return.',
    'Confirm actual EPF/NPS contributions, eligibility, liquidity and payroll terms. Employer NPS deduction conditions depend on the regime and employer type.', { checkpoint: 4, sourceIds: ['tax'], factIds: ['tax_sec_80ccd2_private', 'tax_sec_80ccd2_govt'] });
  if (answers.debt === 'yes') add('debt', 'Expensive debt review',
    'You reported debt above the questionnaire’s 9% editorial screen. Repayment reduces a contractual cost, while investment returns and liquidity are uncertain.',
    'Compare effective loan cost, penalties and required cash reserves before evaluating prepayment. Do not consume essential cash merely to reduce debt.', { checkpoint: 5 });
  if (answers.ef === '<3' || (answers.ef === '3-6' && ['40s', '50s'].includes(answers.age))) add('reserve', 'Emergency reserve review',
    'Review the reserve against essential expenses, income stability and access time. The 3–6 month range and more cautious later-career screen are editorial illustrations, not universal requirements.',
    'Choose an expense-based reserve. Separate immediately accessible cash from investments with settlement delays or loss risk.', { checkpoint: 6 });
  const gapCount = cards.length;
  if (!gapCount) add('maintenance', 'Maintain your financial foundations',
    'Your answers did not trigger the model’s foundation-gap rules. This is not confirmation that insurance, reserves or debts are adequate; income stability and existing commitments still need review.',
    'Revisit reserves, protection and liabilities when employment, dependents or essential spending changes.', { category: 'Maintenance' });

  const horizon = decisionPolicy.horizon_bins[answers.horizon];
  if (answers.horizon === 'soon') add('near-term', 'Protect near-term access',
    `Your selected horizon is ${horizon.toLowerCase()}. Losses or lock-ins could prevent meeting a fixed goal date; a high tax bracket does not remove this risk.`,
    'Define the amount and withdrawal date, then compare capital risk, maturity, access, deposit protection and post-tax proceeds. Do not select a product on tax savings alone.', { category: 'Goal & liquidity', sourceIds: ['allocation', 'readiness'] });
  else if (answers.horizon === 'medium') add('medium-term', 'Balance goal flexibility and loss risk',
    'For a 3–7 year goal, a market recovery may not arrive before a fixed payment date. Neither a hybrid label nor a long average return guarantees capital at withdrawal.',
    'Separate non-negotiable spending from flexible goals. Compare maturity, underlying credit, volatility, costs and access rather than adopting an automatic allocation.', { category: 'Goal & liquidity', sourceIds: ['allocation'] });
  else if (answers.horizon === 'long') add('long-term', 'Build a diversified long-term plan',
    'A horizon over 7 years may provide more time to absorb fluctuations, but does not establish your ability to bear losses or guarantee returns.',
    'Review diversification, costs, current holdings, a sustainable contribution schedule and rebalancing. Satellites remain optional; no equity percentage is inferred from age.', { category: 'Goal & liquidity', sourceIds: ['allocation'] });
  else add('define-goal', 'Define the goal before choosing investments',
    'Without a withdrawal horizon, the model cannot distinguish money needed soon from long-term capital.',
    'Write down the goal, amount, expected date and flexibility. Keep essential near-term needs distinct while clarifying the plan.', { category: 'Goal & liquidity', sourceIds: ['allocation'] });
  if (answers.capacity === 'limited') add('protect-essentials', 'Keep essential needs insulated from losses',
    'You said a loss would affect essential needs. A long horizon, young age or higher tax bracket does not compensate for limited loss capacity.',
    'Separate essential obligations from money genuinely available for risk. Review volatility, capital protection and liquidity before comparing growth options.', { category: 'Loss capacity', sourceIds: ['allocation', 'readiness'] });
  else if (answers.capacity === 'unsure') add('assess-capacity', 'Assess loss capacity first',
    'You have not assessed the effect of losses. Willingness to invest and financial capacity to absorb losses are different; neither can be established from age alone.',
    'Estimate the effect of a loss on housing, dependents, debt and goal dates. A qualified adviser can help assess suitability.', { category: 'Loss capacity', sourceIds: ['allocation'] });
  else add('capacity-review', 'Test your stated capacity against the goal',
    'You said losses would not affect essential needs. This self-report is not a validated risk profile and does not override the selected withdrawal horizon.',
    answers.horizon === 'soon' ? 'Even with capacity for loss, keep a fixed near-term goal separate from long-term risk capital.' : 'Check a realistic loss scenario, existing concentrated exposures and goal flexibility before selecting a mix.', { category: 'Loss capacity', sourceIds: ['allocation'] });

  const illustration = illustrateTax(answers.taxBracket);
  if (!illustration) add('tax-unknown', 'Confirm your marginal tax bracket',
    'You selected “Not sure”. The model will not invent a personal tax saving or after-tax amount. A nil tax bill after rebate is not necessarily a 0% marginal slab.',
    'Check ordinary taxable income after applicable deductions, regime, rebate eligibility and special-rate income with official guidance or a qualified tax professional.', { category: 'Tax context', sourceIds: ['tax', 'rates'] });
  else add('tax-illustration', `${answers.taxBracket}% marginal-bracket illustration`,
    `For ${money(illustration.gross)} of additional ordinary taxable interest entirely in your selected band, illustrative tax including ${Number((decisionPolicy.cess_rate * 100).toFixed(2))}% cess is ${money(illustration.tax)}, leaving ${money(illustration.retained)}. This is conditional arithmetic, not your assessed tax.`,
    'Compare post-tax proceeds only after considering liquidity, costs and risk. Special-rate gains, rebates, surcharge, relief, exemptions and crossing a tax band require a separate calculation.',
    { category: 'Tax context', sourceIds: ['tax', 'rates'], metrics: [{ label: 'Base marginal slab', value: answers.taxBracket + '%' }, { label: 'With cess, no surcharge', value: Number((illustration.effectiveRate * 100).toFixed(2)) + '%' }, { label: 'Illustrative retained interest', value: money(illustration.retained) }] });
  if (answers.regime === 'ntr') add('new-regime', 'Review New Regime eligibility, not an assumed deduction',
    'Most personal investment deductions, including section 123 and the additional own NPS deduction under section 124(3), are unavailable under section 202. Applicable employer NPS deductions are separate. A tax-free receipt and a contribution deduction are different.',
    answers.tax === 'no' ? 'Review eligible options, withdrawal rules and employer contributions before committing money. Compare full-year regime outcomes if eligible to choose; this questionnaire cannot establish the better regime.' : 'Recheck eligibility when rules or employment terms change. Do not buy a long-lock-in product expecting a personal deduction merely because your bracket is high.',
    { category: 'Regime review', sourceIds: ['tax'], factIds: ['cap_sec_80c', 'cap_sec_80ccd1b_nps', 'tax_sec_80ccd2_private'] });
  else add('old-regime', 'Review unused eligible deductions and lock-ins',
    illustration ? `If a separate ${money(illustration.gross)} deduction were fully eligible, unused and entirely within this marginal band, its illustrative tax reduction before rebates and surcharge would be ${money(illustration.tax)}, including cess. This is not an entitlement or a reason to invest that amount.` : 'No deduction saving is estimated because your marginal bracket is unknown. Eligibility, available limits and existing contributions must be established first.',
    answers.tax === 'no' ? 'Inventory eligible existing contributions, premiums and limits before considering additional products. Check lock-ins, affordability and goals; avoid double counting.' : 'Confirm the review remains current, including existing contributions and available headroom. A rebate or lower marginal band can reduce or eliminate an apparent saving.',
    { category: 'Regime review', sourceIds: ['tax', 'rates'], factIds: ['cap_sec_80c', 'cap_sec_80ccd1b_nps'] });
  const primary = gapCount ? cards[0] : cards.find(c => c.category === 'Goal & liquidity');
  return {
    id: primary.id, title: primary.title, explanation: primary.explanation, milestone: primary.action,
    step: primary.checkpoint, cards, gapCount, illustration,
    assumptions: `Educational review for your ${answers.age} age bracket, ${answers.regime === 'ntr' ? 'New' : 'Old'} Tax Regime and ${answers.taxBracket === 'unknown' ? 'unknown marginal bracket' : answers.taxBracket + '% marginal bracket'}; tax year ${decisionPolicy.tax_year}. Self-reported answers do not establish suitability, a complete financial plan or a tax return.`,
    context: amount === null ? '' : `Illustrative amount: ${formatAmount(rawAmount)}. It is not allocated and is not used as taxable income or an eligible deduction. Tax examples use a separate fixed ${money(decisionPolicy.illustrative_income)}.`,
    factIds: [...new Set(cards.flatMap(c => c.factIds))]
  };
}

function formatAmount(raw) {
  const [whole, fractional = ''] = String(raw).trim().split('.');
  // Format the integer as BigInt so very large permitted examples retain their paise.
  return '₹' + new Intl.NumberFormat('en-IN').format(BigInt(whole)) + (fractional ? '.' + fractional.padEnd(2, '0') : '');
}
