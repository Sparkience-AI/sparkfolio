import registry from './data/framework-facts.json' with { type: 'json' };
import { evaluateDecision, answerOptions, decisionPolicy } from './decision.js';
import { reviewStatus } from './facts.js';

const claimEntries = Object.entries(registry)
  .filter(([group]) => !group.startsWith('_'))
  .flatMap(([, group]) => Object.entries(group));
const claims = Object.fromEntries(claimEntries);
const MAX_RESULTS = 50;

function validateArgs(args, allowed) {
  if (args === null || typeof args !== 'object' || Array.isArray(args)) throw new TypeError('Arguments must be an object.');
  for (const key of Object.keys(args)) if (!allowed.includes(key)) throw new TypeError(`Unknown argument: ${key}.`);
}

function asOfDate(value, { required = false } = {}) {
  if (required && value === undefined) {
    throw new TypeError('as_of is required for a reproducible readiness review.');
  }
  const date = value === undefined ? new Date().toISOString().slice(0, 10) : value;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new TypeError('as_of must be an ISO date in YYYY-MM-DD format.');
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new TypeError('as_of must be an ISO date in YYYY-MM-DD format.');
  }
  return date;
}

function publicClaim(id, claim, asOf) {
  return {
    id,
    label: claim.label,
    value: claim.val,
    authority: claim.authority,
    category: claim.category,
    claim_type: claim.claim_type,
    recorded_status: claim.review_status,
    effective_status: reviewStatus(claim, asOf),
    evidence_timing: !claim.reviewed_on ? 'no_source_review_date' : asOf < claim.reviewed_on ? 'before_recorded_review' : claim.review_due && asOf > claim.review_due ? 'review_overdue' : 'within_recorded_review_window',
    applicability: 'Not inferred from the evidence date; check the recorded effective period and conditions.',
    reviewed_on: claim.reviewed_on,
    review_due: claim.review_due,
    effective_period: claim.effective_period,
    assumptions: claim.assumptions,
    verification_scope: claim.verification_scope ?? null,
    sources: claim.sources.map(source => ({
      title: source.title,
      url: source.url,
      locator: source.locator,
      source_role: source.source_role ?? null
    }))
  };
}

export function listClaims(args = {}) {
  validateArgs(args, ['category', 'status', 'as_of', 'limit']);
  const { category, status, as_of: asOfInput, limit = 25 } = args;
  if (category !== undefined && typeof category !== 'string') throw new TypeError('category must be a string.');
  if (status !== undefined && !['verified', 'needs_review', 'editorial', 'calculated'].includes(status)) throw new TypeError('Choose a supported claim status.');
  const asOf = asOfDate(asOfInput);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_RESULTS) {
    throw new RangeError(`limit must be an integer from 1 to ${MAX_RESULTS}.`);
  }
  const matches = claimEntries
    .map(([id, claim]) => publicClaim(id, claim, asOf))
    .filter(claim => !category || claim.category === category)
    .filter(claim => !status || claim.effective_status === status)
    .slice(0, limit);
  return { as_of: asOf, count: matches.length, claims: matches };
}

export function getClaim(args = {}) {
  validateArgs(args, ['id', 'as_of']);
  const { id, as_of: asOfInput } = args;
  if (typeof id !== 'string' || !Object.hasOwn(claims, id)) throw new TypeError('id must name a registered Sparkfolio claim.');
  const asOf = asOfDate(asOfInput);
  return { as_of: asOf, claim: publicClaim(id, claims[id], asOf) };
}

export function reviewReadiness(args = {}) {
  validateArgs(args, ['answers', 'amount', 'as_of']);
  const { answers, amount = '', as_of: asOfInput } = args;
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    throw new TypeError('answers must be the complete Sparkfolio readiness-answer object.');
  }
  validateArgs(answers, Object.keys(answerOptions));
  for (const key of Object.keys(answerOptions)) if (!Object.hasOwn(answers, key)) throw new TypeError(`Please answer: ${key}.`);
  if (typeof amount !== 'string' || amount.length > 32) throw new TypeError('amount must be a string of at most 32 characters.');
  const result = evaluateDecision(answers, amount);
  const asOf = asOfDate(asOfInput, { required: true });
  const modelStatus = asOf < decisionPolicy.reviewed_on ? 'before_recorded_review' : asOf > decisionPolicy.review_due ? 'review_overdue' : 'within_recorded_review_window';
  const warnings = modelStatus === 'within_recorded_review_window' ? [] : [modelStatus === 'before_recorded_review'
    ? 'This date is before the model’s recorded source review. These outputs do not establish the rules that applied on that date.'
    : `The model’s source review was due ${decisionPolicy.review_due}. Its ${decisionPolicy.tax_year} tax examples have not been verified for the requested date. Check current primary sources before using them.`];
  return {
    as_of: asOf,
    purpose: 'Educational readiness review; not financial, investment, insurance, legal, or tax advice.',
    warnings,
    model: { tax_year: decisionPolicy.tax_year, reviewed_on: decisionPolicy.reviewed_on, review_due: decisionPolicy.review_due, evidence_status: modelStatus, sources: decisionPolicy.sources },
    result,
    evidence: result.factIds.map(id => publicClaim(id, claims[id], asOf)),
    limitations: [
      'Answers are self-reported and are not independently verified.',
      'The review does not allocate money, select products, or assess investment suitability.',
      'Tax examples are illustrations, not a calculation of the user’s tax bill.'
    ]
  };
}

export const toolDefinitions = [
  {
    name: 'list_claims',
    description: 'List bounded Sparkfolio educational claims with provenance and effective review status.',
    inputSchema: {
      type: 'object', additionalProperties: false,
      properties: {
        category: { type: 'string' },
        status: { type: 'string', enum: ['verified', 'needs_review', 'editorial', 'calculated'] },
        as_of: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        limit: { type: 'integer', minimum: 1, maximum: MAX_RESULTS, default: 25 }
      }
    }
  },
  {
    name: 'get_claim',
    description: 'Get one registered Sparkfolio claim, its limits, effective period, and source locators.',
    inputSchema: {
      type: 'object', additionalProperties: false, required: ['id'],
      properties: { id: { type: 'string' }, as_of: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' } }
    }
  },
  {
    name: 'review_readiness',
    description: 'Run Sparkfolio’s deterministic educational readiness review from complete explicit answers.',
    inputSchema: {
      type: 'object', additionalProperties: false, required: ['answers', 'as_of'],
      properties: {
        answers: { type: 'object', additionalProperties: false, required: Object.keys(answerOptions), properties: Object.fromEntries(Object.entries(answerOptions).map(([key, values]) => [key, { type: 'string', enum: values }])) },
        amount: { type: 'string', maxLength: 32, default: '' },
        as_of: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' }
      }
    }
  }
];

export function callTool(name, args) {
  if (name === 'list_claims') return listClaims(args);
  if (name === 'get_claim') return getClaim(args);
  if (name === 'review_readiness') return reviewReadiness(args);
  throw new TypeError(`Unknown tool: ${name}.`);
}
