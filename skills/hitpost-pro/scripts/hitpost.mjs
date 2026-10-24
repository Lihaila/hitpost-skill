#!/usr/bin/env node
// HitPost API client for the HitPost Pro skill. No dependencies; Node 18+.
//
//   node hitpost.mjs login <key>          save the API key (from lihaila.si → account menu → Use in Claude)
//   node hitpost.mjs me                   account, credits and today's optimizations left
//   node hitpost.mjs craft --idea "..." [--format single|thread|long|article] [--tone auto|insight|story|bold|funny|pro] [--lang auto|en|zh|ja|ko|es|fr|de|pt] [--handle you]
//   node hitpost.mjs optimize --posts posts.json [--craft <craftId>]
//   node hitpost.mjs format --posts posts.json --mode emojis|bullets
//   node hitpost.mjs post --posts posts.json [--craft <craftId>] [--variant <id>]
//
// posts.json is a JSON array of post strings (one per post of a thread).
// Output is JSON on stdout; progress goes to stderr. Exit codes: 0 ok, 1 error, 2 needs action
// (no key, out of credits, not a blue-check account): the JSON's "action" says what to do.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASE = (process.env.HITPOST_URL || 'https://lihaila.si').replace(/\/+$/, '');
const KEY_FILE = path.join(os.homedir(), '.config', 'hitpost', 'key');
const TOPUP = `${BASE}/ (account menu → Top up)`;
const KEYS = `${BASE}/ (sign in with X → account menu → Use in Claude → Create a key)`;

const out = (obj, code = 0) => { process.stdout.write(JSON.stringify(obj, null, 2) + '\n'); process.exit(code); };
const needs = (action, message) => out({ ok: false, action, message }, 2);

function args(list) {
  const o = { _: [] };
  for (let i = 0; i < list.length; i++) {
    if (list[i].startsWith('--')) o[list[i].slice(2)] = list[i + 1]?.startsWith('--') || list[i + 1] === undefined ? true : list[++i];
    else o._.push(list[i]);
  }
  return o;
}

function readKey() {
  if (process.env.HITPOST_API_KEY) return process.env.HITPOST_API_KEY.trim();
  try { return fs.readFileSync(KEY_FILE, 'utf8').trim(); } catch { return ''; }
}

function readPosts(file) {
  if (!file || file === true) out({ ok: false, error: 'Pass --posts <file.json> (a JSON array of post strings).' }, 1);
  let posts;
  try { posts = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { out({ ok: false, error: `Couldn't read ${file}: ${e.message}` }, 1); }
  if (!Array.isArray(posts) || !posts.length || posts.some((p) => typeof p !== 'string')) out({ ok: false, error: `${file} must be a JSON array of post strings.` }, 1);
  return posts;
}

/** Turn a refused request into what the user has to do. */
function refused(status, body) {
  const msg = body?.error || `HTTP ${status}`;
  if (body?.code === 'badkey' || status === 401) needs('create_key', `${msg} Create one at ${KEYS}, then run: node hitpost.mjs login <key>`);
  if (body?.code === 'verified' || body?.code === 'signin') needs('blue_check', msg);
  if (body?.code === 'quota' || body?.code === 'linkcredits' || status === 402) needs('top_up', `${msg} Top up at ${TOPUP}; credits are shared with the website.`);
  out({ ok: false, status, error: msg }, 1);
}

async function call(p, { method = 'GET', body } = {}) {
  const key = readKey();
  if (!key) needs('create_key', `No HitPost API key yet. Create one at ${KEYS}, then run: node hitpost.mjs login <key>`);
  let res;
  try {
    res = await fetch(BASE + p, {
      method,
      headers: { authorization: `Bearer ${key}`, ...(body ? { 'content-type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(400_000),
    });
  } catch (e) {
    out({ ok: false, error: `Couldn't reach ${BASE}: ${e.message}` }, 1);
  }
  return res;
}

/** Long jobs stream newline-delimited JSON events; returns them all, logging steps to stderr. */
async function streamed(res) {
  const events = [];
  const dec = new TextDecoder();
  let buf = '';
  for await (const chunk of res.body) {
    buf += dec.decode(chunk, { stream: true });
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line) continue;
      const ev = JSON.parse(line);
      if (ev.type === 'step') process.stderr.write(`[hitpost] ${ev.step}…\n`);
      events.push(ev);
    }
  }
  return events;
}

const credits = (q) => (q ? { credits: q.credits, optimizesLeftToday: q.optimizes } : undefined);

const [cmd, ...rest] = process.argv.slice(2);
const a = args(rest);

switch (cmd) {
  case 'login': {
    const key = String(a._[0] || '').trim();
    if (!/^hp_[A-Za-z0-9_-]{20,}$/.test(key)) out({ ok: false, error: 'That doesn\'t look like a HitPost key (it starts with hp_).' }, 1);
    fs.mkdirSync(path.dirname(KEY_FILE), { recursive: true });
    fs.writeFileSync(KEY_FILE, key + '\n', { mode: 0o600 });
    const res = await call('/api/me');
    const body = await res.json().catch(() => ({}));
    if (!res.ok) refused(res.status, body);
    out({ ok: true, saved: KEY_FILE, handle: body.user?.handle, ...credits(body.quota) });
  }
  case 'me': {
    const res = await call('/api/me');
    const body = await res.json().catch(() => ({}));
    if (!res.ok) refused(res.status, body);
    out({ ok: true, handle: body.user?.handle, blueCheck: body.user?.verified, xConnected: body.user?.connected, ...credits(body.quota), topUp: TOPUP });
  }
  case 'craft': {
    if (!a.idea || a.idea === true) out({ ok: false, error: 'Pass --idea "what the post is about".' }, 1);
    const res = await call('/api/craft', { method: 'POST', body: { idea: a.idea, format: a.format, tone: a.tone, lang: a.lang, handle: a.handle } });
    if (!res.ok) refused(res.status, await res.json().catch(() => ({})));
    const events = await streamed(res);
    const start = events.find((e) => e.type === 'start');
    const research = events.find((e) => e.type === 'research')?.research;
    const done = events.find((e) => e.type === 'variants');
    const err = events.find((e) => e.type === 'error');
    if (!done) out({ ok: false, error: err?.error || 'The craft did not finish. Your credit was refunded.', ...credits(err?.quota) }, 1);
    out({
      ok: true,
      craftId: start?.id,
      // What the research found, for citing and for the user's judgment.
      research: research && !research.light ? {
        pulse: research.x?.pulse || '',
        angles: research.x?.angles || [],
        hotPosts: (research.x?.hot_posts || []).map((p) => ({ author: p.author, gist: p.gist, url: p.url })),
        sources: (research.web || []).map((w) => ({ source: w.source, title: w.title, url: w.url })),
      } : { kind: research?.kind || 'light' },
      variants: done.variants,
      ...credits(done.quota),
    });
  }
  case 'optimize': {
    const res = await call('/api/optimize', { method: 'POST', body: { posts: readPosts(a.posts), craftId: a.craft } });
    if (!res.ok) refused(res.status, await res.json().catch(() => ({})));
    const events = await streamed(res);
    const r = events.find((e) => e.type === 'result');
    if (!r) out({ ok: false, error: events.find((e) => e.type === 'error')?.error || 'Optimization failed.' }, 1);
    out({ ok: true, winner: r.winner, candidates: r.candidates.map((c) => ({ id: c.id, posts: c.posts, scores: c.scores, total: c.total, note: c.note, changes: c.changes, warning: !!c.warning })), ...credits(r.quota) });
  }
  case 'format': {
    if (!['emojis', 'bullets'].includes(a.mode)) out({ ok: false, error: 'Pass --mode emojis or --mode bullets.' }, 1);
    const res = await call('/api/format', { method: 'POST', body: { posts: readPosts(a.posts), mode: a.mode } });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) refused(res.status, body);
    out({ ok: true, posts: body.posts });
  }
  case 'post': {
    const res = await call('/api/post', { method: 'POST', body: { posts: readPosts(a.posts), craftId: a.craft, variantId: a.variant } });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (body.code === 'reconnect' || res.status === 403) needs('reconnect_x', `${body.error || 'X access expired.'} Sign in with X again at ${BASE}/ and retry.`);
      if (body.posted?.length) out({ ok: false, error: body.error, postedBeforeError: body.posted }, 1);
      refused(res.status, body);
    }
    out({ ok: true, posted: body.posted });
  }
  default:
    out({ ok: false, error: 'Commands: login <key> | me | craft --idea "…" | optimize --posts f.json | format --posts f.json --mode emojis|bullets | post --posts f.json' }, 1);
}
