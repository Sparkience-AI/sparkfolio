import registry from './data/framework-facts.json';
import { answerOptions, evaluateDecision } from './decision.js';
import { reviewStatus } from './facts.js';

const facts = Object.assign({}, registry.L1_evergreen, registry.L2_annual, registry.L3_quarterly);
const byId = id => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function initNavigation() {
  const button = document.querySelector('.mobile-menu-btn');
  const links = document.querySelector('.nav-links');
  function closeMenu(returnFocus = false) {
    button.setAttribute('aria-expanded', 'false');
    links.classList.remove('active');
    document.body.classList.remove('no-scroll');
    document.querySelector('.nav-backdrop')?.remove();
    if (returnFocus) button.focus();
  }
  button.addEventListener('click', () => {
    if (button.getAttribute('aria-expanded') === 'true') return closeMenu();
    button.setAttribute('aria-expanded', 'true');
    links.classList.add('active');
    document.body.classList.add('no-scroll');
    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    backdrop.addEventListener('click', () => closeMenu(true));
    document.body.append(backdrop);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('focusin', event => {
    if (button.getAttribute('aria-expanded') === 'true' && !links.contains(event.target) && event.target !== button) closeMenu();
  });
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    closeMenu();
    revealFragment(anchor.hash);
    // Native fragment navigation preserves the URL and browser history.
  });
  matchMedia('(min-width: 768px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
  window.addEventListener('hashchange', () => revealFragment(location.hash));
  revealFragment(location.hash);
}

function revealFragment(hash) {
  if (!hash || hash === '#') return;
  let id;
  try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
  const target = byId(id);
  if (!target) return;
  if (target.closest('#implementation')) {
    byId('topic-search').value = '';
    filterTopics();
  }
  if (target.id.startsWith('source-')) target.querySelector('details')?.setAttribute('open', '');
  let detail = target.closest('details');
  while (detail) { detail.open = true; detail = detail.parentElement.closest('details'); }
  if (target.matches('[tabindex="-1"]')) target.focus({ preventScroll: true });
  document.fonts.ready.then(() => target.scrollIntoView({ behavior: 'instant', block: 'start' }));
}

function filterTopics() {
  const query = byId('topic-search').value.trim().toLocaleLowerCase('en-IN');
  const topics = [...document.querySelectorAll('#implementation details')];
  let count = 0;
  for (const detail of topics) {
    const match = detail.textContent.toLocaleLowerCase('en-IN').includes(query);
    detail.hidden = !match;
    if (match) count++;
  }
  byId('topic-count').textContent = `${count} of ${topics.length} topics${query ? ' match your search' : ' available'}.`;
  byId('topic-empty').hidden = count !== 0;
}

function initTopics() {
  byId('topic-search').addEventListener('input', filterTopics);
  byId('topic-reset').addEventListener('click', () => {
    byId('topic-search').value = ''; filterTopics(); byId('topic-search').focus();
  });
  filterTopics();
}

function initDecision() {
  const form = byId('de-form');
  const card = byId('de-result-card');
  const error = byId('de-error');
  const status = byId('de-status');
  byId('de-generate-btn').disabled = false;
  let generated = false;
  const labels = { regime: 'tax regime', age: 'age bracket', dependents: 'financial dependents', health: 'personal health cover', term: 'term cover', ef: 'emergency reserve', debt: 'expensive debt', corpPf: 'employer benefits', tax: 'long-term tax-advantaged review' };
  form.addEventListener('input', () => {
    error.textContent = '';
    byId('de-amount').removeAttribute('aria-invalid');
    if (generated) {
      card.dataset.stale = 'true';
      status.textContent = 'Answers changed. The previous result is outdated. Generate a new checkpoint.';
    }
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form), answers = Object.fromEntries(data);
    error.textContent = '';
    for (const key of Object.keys(answerOptions)) {
      if (!data.has(key)) {
        error.textContent = `Please answer the question about ${labels[key]}.`;
        form.querySelector(`input[name="${key}"]`).focus();
        return;
      }
    }
    let result;
    try { result = evaluateDecision(answers, byId('de-amount').value); }
    catch (issue) {
      error.textContent = issue.message;
      byId('de-amount').setAttribute('aria-invalid', 'true');
      byId('de-amount').focus();
      return;
    }
    generated = true;
    card.dataset.stale = 'false';
    byId('de-empty-state').hidden = true;
    card.hidden = false;
    byId('de-step-badge').textContent = `CHECKPOINT ${result.step} OF 7`;
    byId('de-step-name').textContent = result.title;
    byId('de-action').textContent = result.explanation;
    byId('de-rationale').textContent = result.assumptions;
    byId('de-milestone').textContent = result.milestone;
    byId('de-context').textContent = result.context;
    const notes = byId('de-fact-notes');
    notes.replaceChildren();
    for (const id of result.factIds) {
      const fact = facts[id], item = document.createElement('li'), link = document.createElement('a');
      link.href = '#source-' + id;
      link.className = 'result-source';
      link.textContent = fact.label;
      link.setAttribute('aria-label', `${fact.label}: ${reviewStatus(fact).replaceAll('_', ' ')} source notes`);
      item.append(link); notes.append(item);
    }
    status.textContent = `Checkpoint ${result.step}: ${result.title}. Result updated.`;
  });
}

function initGlossary() {
  const bubble = document.createElement('div');
  bubble.id = 'jargon-tooltip'; bubble.className = 'tooltip-bubble'; bubble.setAttribute('role', 'tooltip');
  document.body.append(bubble);
  let active = null, timer;
  function hide() {
    clearTimeout(timer);
    active?.removeAttribute('aria-describedby');
    active = null; bubble.classList.remove('visible');
  }
  function scheduleHide() { clearTimeout(timer); timer = setTimeout(hide, 180); }
  function show(el) {
    clearTimeout(timer);
    if (active !== el) hide();
    active = el;
    bubble.textContent = el.dataset.tip;
    bubble.classList.add('visible');
    el.setAttribute('aria-describedby', bubble.id);
    const rect = el.getBoundingClientRect(), size = bubble.getBoundingClientRect();
    const left = Math.max(12, Math.min(rect.left + (rect.width - size.width) / 2, document.documentElement.clientWidth - size.width - 12));
    const below = rect.top - size.height < 20;
    bubble.classList.toggle('below', below);
    bubble.style.left = `${left}px`;
    bubble.style.top = `${Math.max(12, Math.min(below ? rect.bottom + 8 : rect.top - size.height - 8, innerHeight - size.height - 12))}px`;
    bubble.style.setProperty('--arrow-left', `${rect.left + rect.width / 2 - left}px`);
  }
  for (const el of document.querySelectorAll('.jargon[data-tip]')) {
    el.addEventListener('mouseenter', () => show(el));
    el.addEventListener('focus', () => show(el));
    el.addEventListener('click', event => { event.stopPropagation(); show(el); });
    el.addEventListener('mouseleave', scheduleHide);
    el.addEventListener('blur', scheduleHide);
  }
  bubble.addEventListener('mouseenter', () => clearTimeout(timer));
  bubble.addEventListener('mouseleave', scheduleHide);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
  document.addEventListener('click', e => { if (!bubble.contains(e.target)) hide(); });
  addEventListener('resize', hide);
  addEventListener('scroll', hide, { passive: true });
}

function initDecorations() {
  for (const chart of document.querySelectorAll('.chart-box')) {
    const label = chart.querySelector('.font-mono');
    const value = Number.parseInt(label?.textContent, 10);
    if (Number.isFinite(value)) chart.style.background = `conic-gradient(var(--donut-color, var(--primary-blue)) ${value}%, var(--bg-surface) 0)`;
  }
  const progress = byId('scrollProgress');
  let pending = false;
  addEventListener('scroll', () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      const distance = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = `${distance > 0 ? scrollY / distance * 100 : 0}%`;
      pending = false;
    });
  }, { passive: true });
  // No content or figures depend on motion or intersection observers.
  document.documentElement.style.scrollBehavior = reducedMotion.matches ? 'auto' : 'smooth';
  reducedMotion.addEventListener('change', e => { document.documentElement.style.scrollBehavior = e.matches ? 'auto' : 'smooth'; });
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        for (const link of document.querySelectorAll('.nav-links a')) {
          const current = link.hash === '#' + entry.target.id;
          link.classList.toggle('active', current);
          if (current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
        }
      }
    }, { rootMargin: '-10% 0px -70% 0px' });
    document.querySelectorAll('section[id], header[id]').forEach(el => spy.observe(el));
  }
}

function init() { initTopics(); initNavigation(); initDecision(); initGlossary(); initDecorations(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
