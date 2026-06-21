import { readFileSync, writeFileSync } from 'node:fs';
import postcss from 'postcss';

const file = new URL('../app/custom.css', import.meta.url);
const css = readFileSync(file, 'utf8');
const root = postcss.parse(css);

let exactRulesRemoved = 0;
let dupDeclsRemoved = 0;
let adjacentMerged = 0;

// Scope key = chain of enclosing at-rules (e.g. @media (...), @keyframes ...).
function scopeKey(node) {
  const parts = [];
  let p = node.parent;
  while (p && p.type !== 'root') {
    if (p.type === 'atrule') parts.push('@' + p.name + ' ' + (p.params || ''));
    p = p.parent;
  }
  return parts.reverse().join(' >> ');
}

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

function declBody(rule) {
  return rule.nodes
    .filter((n) => n.type === 'decl')
    .map((d) => `${norm(d.prop)}:${norm(d.value)}${d.important ? '!important' : ''}`)
    .join(';');
}

// 1) Remove exact-duplicate declarations inside a rule (same prop+value+important).
//    Keep the LAST occurrence (the one that actually wins in the cascade).
root.walkRules((rule) => {
  const seen = new Map(); // key -> decl node
  rule.each((node) => {
    if (node.type !== 'decl') return;
    const key = `${norm(node.prop)}|${norm(node.value)}|${node.important ? 1 : 0}`;
    if (seen.has(key)) {
      seen.get(key).remove(); // drop the earlier identical decl
      dupDeclsRemoved++;
    }
    seen.set(key, node);
  });
});

// 2) Merge ADJACENT sibling rules with the same scope+selector (cascade-safe:
//    nothing sits between them, so combining can't change specificity outcomes).
root.walkRules((rule) => {
  const prev = rule.prev();
  if (prev && prev.type === 'rule' &&
      norm(prev.selector) === norm(rule.selector) &&
      scopeKey(prev) === scopeKey(rule)) {
    rule.each((node) => prev.append(node.clone()));
    rule.remove();
    adjacentMerged++;
  }
});

// 3) Remove exact-duplicate rule blocks (same scope + selector + identical decls),
//    keeping the LAST occurrence. Keeping the last copy is cascade-safe: a later
//    identical rule may be re-asserting its values over an intervening conflicting
//    rule, so the final winner stays in place; only the redundant earlier copies go.
const seenRules = new Map(); // key -> last-seen rule node
root.walkRules((rule) => {
  const key = `${scopeKey(rule)}||${norm(rule.selector)}||${declBody(rule)}`;
  if (seenRules.has(key)) {
    seenRules.get(key).remove(); // drop the earlier identical copy
    exactRulesRemoved++;
  }
  seenRules.set(key, rule);
});

const out = root.toString();
writeFileSync(file, out, 'utf8');

console.log(`Adjacent same-selector rules merged: ${adjacentMerged}`);
console.log(`Exact-duplicate rule blocks removed: ${exactRulesRemoved}`);
console.log(`Exact-duplicate declarations removed: ${dupDeclsRemoved}`);
console.log(`Bytes: ${css.length} -> ${out.length}  (saved ${css.length - out.length})`);
