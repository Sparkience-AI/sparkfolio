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
  if (!answerOptions.taxBracket.includes(bracket)) throw new TypeError('Choose one of the tax brackets shown, or select “Not sure”.');
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
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) throw new RangeError('Enter an amount greater than zero, with no more than two decimal places. For example: 10000.50. Leave out commas and forms such as 1e6.');
  const [whole, fractional = ''] = text.split('.');
  const cents = BigInt(whole) * 100n + BigInt(fractional.padEnd(2, '0'));
  if (cents > BigInt(Number.MAX_SAFE_INTEGER) * 100n) throw new RangeError('That amount is too large for this example. Enter a smaller amount.');
  const value = Number(text);
  if (!Number.isFinite(value) || value <= 0 || value > Number.MAX_SAFE_INTEGER) throw new RangeError('Enter an amount greater than zero and within the supported range.');
  return value;
}

export function evaluateDecision(answers, rawAmount = '') {
  for (const [key, options] of Object.entries(answerOptions)) {
    if (!options.includes(answers[key])) throw new TypeError(`Please answer: ${key}.`);
  }
  if (!validBrackets(answers.regime).includes(answers.taxBracket)) throw new TypeError('Choose a tax bracket listed for your selected regime, or select “Not sure”.');
  const amount = parseAmount(rawAmount);
  const cards = [];
  function add(id, title, explanation, action, { checkpoint = null, category = 'Foundation', sourceIds = ['readiness'], factIds = [], metrics = [] } = {}) {
    cards.push({ id, title, explanation, action, checkpoint, category, sourceIds, factIds, metrics });
  }
  if (answers.ef === 'none') add('baseline', 'Start with money you can reach quickly',
    'You said you do not have an emergency fund yet. If an unexpected bill arrives, you may have to wait to withdraw invested money or sell at a loss.',
    'Add up your essential monthly bills. Start setting aside money you can withdraw quickly before locking more money into long-term investments.', { checkpoint: 1, factIds: ['rule_baseline_cash_cushion'] });
  if (answers.health === 'no') add('health', 'Check your health insurance',
    'You selected employer-only health insurance or no cover. If you rely on insurance through work, check what happens when you leave the job.',
    'Check whether you need your own policy. Ask what it covers, what it excludes, when cover starts and how much you would have to pay yourself.', { checkpoint: 2, factIds: ['health_base_topup_recommendation'] });
  if (answers.dependents === 'yes' && answers.term === 'no') add('dependents', 'Protect the people who depend on your income',
    'Someone depends on your income, and you do not have term life insurance. Think about how their bills and future needs would be paid if you died.',
    'List their living costs, future expenses and your outstanding loans. Subtract the savings and insurance already available, then discuss any shortfall with a qualified insurance professional.', { checkpoint: 3 });
  if (answers.corpPf === 'no') add('employer', 'Find out what your employer contributes',
    'You have not checked your employer’s EPF or NPS benefits yet. The amount allowed as a tax deduction is not necessarily the amount your employer will contribute.',
    'Ask payroll what you and your employer pay, who qualifies and when you can withdraw the money. Check the tax rules for your employer and chosen regime.', { checkpoint: 4, sourceIds: ['tax'], factIds: ['tax_sec_80ccd2_private', 'tax_sec_80ccd2_govt'] });
  if (answers.debt === 'yes') add('debt', 'Take a closer look at costly debt',
    'You have a loan charging more than 9%. It is worth comparing the interest you could avoid by paying it down with the uncertain returns from investing. We use 9% as a review prompt, not a rule for every loan.',
    'Check the loan’s actual cost and any early-payment charges. Keep enough cash for essential bills and emergencies before deciding whether to pay extra.', { checkpoint: 5 });
  if (answers.ef === '<3' || (answers.ef === '3-6' && ['40s', '50s'].includes(answers.age))) add('reserve', 'Check how long your emergency money would last',
    'Your answers suggest taking another look at your emergency fund. The right amount depends on your bills, job security and family commitments. Our 3–6 month guide and extra check in your 40s or 50s are starting points, not fixed requirements.',
    'Work out how many months of essential bills your savings would cover. Keep some money available immediately; investments may take time to sell and can lose value.', { checkpoint: 6 });
  const gapCount = cards.length;
  if (!gapCount) add('maintenance', 'Keep your basics up to date',
    'Your answers did not flag a missing step in these basic checks. You still need to check whether your savings and insurance amounts are enough for your needs.',
    'Check your emergency fund, insurance and loans again when your job, family needs or regular spending changes.', { category: 'Maintenance' });

  const horizon = decisionPolicy.horizon_bins[answers.horizon];
  if (answers.horizon === 'soon') add('near-term', 'Keep money for a goal coming up soon within reach',
    `You expect to need this money in ${horizon.toLowerCase()}. If its value falls or you cannot withdraw it in time, you could miss your goal. A tax saving would not make up for that.`,
    'Write down how much you need and when. Compare the risk of losing money, withdrawal rules, when the money is repaid, whether a deposit is insured and what you would keep after tax.', { category: 'Goal & liquidity', sourceIds: ['allocation', 'readiness'] });
  else if (answers.horizon === 'medium') add('medium-term', 'Plan around your goal’s deadline',
    'You need this money in 3–7 years. If markets fall near that date, you may not have time to wait for a recovery. A fund labelled “hybrid” does not guarantee that your money will be safe.',
    'Decide which payments cannot wait and which goals could move. Check how much an investment could lose, whether borrowers could default, its fees and when you can withdraw.', { category: 'Goal & liquidity', sourceIds: ['allocation'] });
  else if (answers.horizon === 'long') add('long-term', 'Make a plan for your longer-term goal',
    'You have more than 7 years before you need this money. That gives you more time to deal with market ups and downs, but losses are still possible.',
    'Look at what you already own, spread risk across investments and choose contributions you can afford. Check fees and review the mix over time. Extra specialist investments are optional; your age alone does not decide how much equity to hold.', { category: 'Goal & liquidity', sourceIds: ['allocation'] });
  else add('define-goal', 'Decide what the money is for first',
    'You are not sure when you will need this money. That makes it hard to judge how much risk or how long a lock-in would make sense.',
    'Write down the goal, likely cost and expected date. Decide whether that date can move, and keep money for upcoming bills separate.', { category: 'Goal & liquidity', sourceIds: ['allocation'] });
  if (answers.capacity === 'limited') add('protect-essentials', 'Do not put essential bills at risk',
    'You said an investment loss would affect your essential needs. Even if you are young, have plenty of time or pay a high rate of tax, those bills still need protecting.',
    'Work out which money must be kept safe and accessible. Check how much you could lose without missing essential payments, and keep money for those payments accessible.', { category: 'Loss capacity', sourceIds: ['allocation', 'readiness'] });
  else if (answers.capacity === 'unsure') add('assess-capacity', 'Work out what a loss would mean for you',
    'You have not worked out how a loss would affect you yet. Feeling comfortable with risk is different from being able to afford a loss.',
    'Think through what a loss would mean for rent or home payments, family needs, loans and your goal date. A qualified adviser can help you assess what is suitable.', { category: 'Loss capacity', sourceIds: ['allocation'] });
  else add('capacity-review', 'Check that a loss would not disrupt your plans',
    'You said you could handle a loss without affecting essential bills. Check that the same is true for your goal: being able to afford a loss does not mean you can delay a payment.',
    answers.horizon === 'soon' ? 'Keep money for a fixed, nearby deadline separate from money you can leave invested for longer.' : 'Consider a realistic fall in value, whether too much of your money is in one place, and whether your goal date could move.', { category: 'Loss capacity', sourceIds: ['allocation'] });

  const illustration = illustrateTax(answers.taxBracket);
  if (!illustration) add('tax-unknown', 'Find your tax bracket before comparing tax savings',
    'You are not sure of your tax bracket, so no tax amount has been estimated. A rebate can bring your tax bill to zero even when your tax band is higher than 0%.',
    'Check your income after allowed deductions and the rules for your chosen regime. Rebates and income taxed separately, such as some capital gains, can change the result. Use official guidance or ask a qualified tax professional.', { category: 'Tax context', sourceIds: ['tax', 'rates'] });
  else add('tax-illustration', `What your ${answers.taxBracket}% tax bracket could mean`,
    `Suppose you earned ${money(illustration.gross)} in extra taxable interest, all within your ${answers.taxBracket}% band. Including the ${Number((decisionPolicy.cess_rate * 100).toFixed(2))}% health and education cess, tax on that interest would be ${money(illustration.tax)}. You would keep ${money(illustration.retained)}. This example assumes no rebate or surcharge.`,
    'Compare what you would keep after tax, along with fees, risk and access to your money. Your actual tax may differ, especially if a rebate applies or the income crosses into another band.',
    { category: 'Tax context', sourceIds: ['tax', 'rates'], metrics: [{ label: 'Your tax band', value: answers.taxBracket + '%' }, { label: 'Including cess', value: Number((illustration.effectiveRate * 100).toFixed(2)) + '%' }, { label: 'Interest you would keep', value: money(illustration.retained) }] });
  if (answers.regime === 'ntr') add('new-regime', 'Know which tax breaks the New Regime allows',
    'A deduction reduces the income you are taxed on. Most deductions for your own savings and investments are not available under the New Regime, including the deduction for eligible tax-saving investments and the extra deduction for your own NPS payments. Employer NPS contributions have separate rules. A tax-free payout does not automatically give you a deduction when you pay in.',
    answers.tax === 'no' ? 'Check which tax breaks you qualify for and when you could withdraw the money. If you can choose between regimes, compare your full-year tax under both; these answers alone cannot tell you which is better.' : 'Recheck the rules when your job or tax situation changes. Before locking money away for a tax break, confirm that the deduction is actually available to you.',
    { category: 'Regime review', sourceIds: ['tax'], factIds: ['cap_sec_80c', 'cap_sec_80ccd1b_nps', 'tax_sec_80ccd2_private'] });
  else add('old-regime', 'Check the tax deductions you still have available',
    illustration ? `A deduction reduces the income you are taxed on. Suppose you could claim another ${money(illustration.gross)} deduction, had enough of the deduction limit left, and the whole deduction fell in your ${answers.taxBracket}% band. It could reduce tax by ${money(illustration.tax)}, including cess, before considering rebates or surcharge. This does not mean you qualify for that deduction.` : 'No tax saving has been estimated because your bracket is unknown. First check which deductions you qualify for and how much of each deduction limit you have already used.',
    answers.tax === 'no' ? 'Count any qualifying payments you already make, including eligible contributions and insurance premiums. Check the remaining deduction limit, withdrawal rules and affordability before adding anything. Do not count the same payment twice.' : 'Check that your earlier calculation still matches your income and payments. A rebate or a lower tax band can reduce the saving, sometimes to zero.',
    { category: 'Regime review', sourceIds: ['tax', 'rates'], factIds: ['cap_sec_80c', 'cap_sec_80ccd1b_nps'] });
  const primary = gapCount ? cards[0] : cards.find(c => c.category === 'Goal & liquidity');
  return {
    id: primary.id, title: primary.title, explanation: primary.explanation, milestone: primary.action,
    step: primary.checkpoint, cards, gapCount, illustration,
    assumptions: `Based on your answers: ${answers.age}, ${answers.regime === 'ntr' ? 'New' : 'Old'} Tax Regime, ${answers.taxBracket === 'unknown' ? 'tax bracket not yet known' : answers.taxBracket + '% tax bracket'}. Tax year ${decisionPolicy.tax_year}. These cards help you decide what to check next. They are not a full financial plan or a calculation of your tax bill.`,
    context: amount === null ? '' : `You entered ${formatAmount(rawAmount)}. No part of it has been allocated. It is not treated as taxable income or a tax deduction; the tax examples use a separate ${money(decisionPolicy.illustrative_income)}.`,
    factIds: [...new Set(cards.flatMap(c => c.factIds))]
  };
}

function formatAmount(raw) {
  const [whole, fractional = ''] = String(raw).trim().split('.');
  // Format the integer as BigInt so very large permitted examples retain their paise.
  return '₹' + new Intl.NumberFormat('en-IN').format(BigInt(whole)) + (fractional ? '.' + fractional.padEnd(2, '0') : '');
}
