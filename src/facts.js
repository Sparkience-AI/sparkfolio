export function reviewStatus(fact, today = new Date().toISOString().slice(0, 10)) {
  return fact.review_status === 'verified' && fact.review_due && fact.review_due < today
    ? 'needs_review' : fact.review_status;
}
