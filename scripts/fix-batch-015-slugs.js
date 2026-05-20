#!/usr/bin/env node
// Fix glossary coverage: add glossaryTooltip marks where terms appear as plain text.

const fs = require('fs');
const path = require('path');
const BRIEFS_DIR = path.join(__dirname, '..', 'docs', 'wood-natural-craft-bulk-001-briefs');

// Traverse all nodes recursively and call fn on each text node with its parent array + index.
function visitTextNodes(nodes, fn) {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.type === 'text') {
      fn(nodes, i, node);
    }
    if (node.content) visitTextNodes(node.content, fn);
    if (node.attrs && node.attrs.items) {
      for (const item of node.attrs.items) {
        // troubleshooter items aren't visited by body traversal; skip
      }
    }
  }
}

// Split a plain-text node that contains `term` into [before, term, after],
// where `term` gets a glossaryTooltip mark added.
function splitAndMark(nodes, idx, node, term, termSlug) {
  const text = node.text;
  const pos = text.indexOf(term);
  if (pos === -1) return false;
  const before = text.slice(0, pos);
  const after = text.slice(pos + term.length);
  const markedNode = {
    type: 'text',
    marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }],
    text: term,
  };
  const replacements = [];
  if (before) replacements.push({ type: 'text', text: before });
  replacements.push(markedNode);
  if (after) replacements.push({ type: 'text', text: after });
  nodes.splice(idx, 1, ...replacements);
  return true;
}

// For salad-servers: add glossaryTooltip+techniqueLink to existing techniqueLink node
function addGlossaryToTechniqueLink(nodes) {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.type === 'text' && Array.isArray(node.marks)) {
      const tl = node.marks.find(m => m.type === 'techniqueLink' && m.attrs && m.attrs.techniqueSlug === 'push-cut-technique');
      if (tl && !node.marks.find(m => m.type === 'glossaryTooltip')) {
        node.marks.push({ type: 'glossaryTooltip', attrs: { termSlug: 'push-cut' } });
        return true;
      }
    }
    if (node.content) {
      if (addGlossaryToTechniqueLink(node.content)) return true;
    }
  }
  return false;
}

// --- carved-sycamore-salad-servers: add glossaryTooltip to existing techniqueLink node ---
{
  const fpath = path.join(BRIEFS_DIR, 'carved-sycamore-salad-servers.json');
  const doc = JSON.parse(fs.readFileSync(fpath, 'utf8'));
  if (addGlossaryToTechniqueLink(doc.body.content)) {
    fs.writeFileSync(fpath, JSON.stringify(doc, null, 2));
    console.log('Fixed carved-sycamore-salad-servers: added glossaryTooltip to techniqueLink');
  } else {
    console.log('MISS carved-sycamore-salad-servers: push-cut-technique not found');
  }
}

// --- carved-walnut-honey-spoon: wrap plain "push cuts" in paragraph text ---
{
  const fpath = path.join(BRIEFS_DIR, 'carved-walnut-honey-spoon.json');
  const doc = JSON.parse(fs.readFileSync(fpath, 'utf8'));
  let fixed = false;

  function tryFix(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.type === 'text' && !node.marks && typeof node.text === 'string') {
        if (node.text.includes('push cuts')) {
          if (splitAndMark(nodes, i, node, 'push cuts', 'push-cut')) {
            fixed = true;
            return;
          }
        }
      }
      if (node.content) tryFix(node.content);
      if (fixed) return;
    }
  }
  tryFix(doc.body.content);

  if (fixed) {
    fs.writeFileSync(fpath, JSON.stringify(doc, null, 2));
    console.log('Fixed carved-walnut-honey-spoon: wrapped push-cut with glossaryTooltip');
  } else {
    console.log('MISS carved-walnut-honey-spoon: no plain push-cut text found');
  }
}

// --- willow-hurdle-garden-panel: wrap plain "waling" in body text ---
{
  const fpath = path.join(BRIEFS_DIR, 'willow-hurdle-garden-panel.json');
  const doc = JSON.parse(fs.readFileSync(fpath, 'utf8'));
  let fixed = false;

  function tryFixWaling(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.type === 'text' && !node.marks && typeof node.text === 'string') {
        if (node.text.includes('waling')) {
          if (splitAndMark(nodes, i, node, 'waling', 'waling')) {
            fixed = true;
            return;
          }
        }
      }
      if (node.content) tryFixWaling(node.content);
      if (fixed) return;
    }
  }
  tryFixWaling(doc.body.content);

  if (fixed) {
    fs.writeFileSync(fpath, JSON.stringify(doc, null, 2));
    console.log('Fixed willow-hurdle-garden-panel: wrapped waling with glossaryTooltip');
  } else {
    console.log('MISS willow-hurdle-garden-panel: no plain waling text found');
  }
}
