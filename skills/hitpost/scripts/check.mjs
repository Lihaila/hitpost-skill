#!/usr/bin/env node
// Checks X drafts against HitPost's output spec and prints a share link for each.
// Usage: node check.mjs drafts.json   (or pipe the JSON on stdin)
// Input:  {"format": "single|thread|long", "lang": "en|zh|ja|ko|es|fr|de|pt|auto", "idea": "...",
//          "drafts": [{"angle": "...", "posts": ["..."]}]}
// Output: per draft, each post's weighted length, problems (empty = meets the spec), and an X share link.
// No dependencies; Node 18+.
import fs from 'node:fs';

// ---- X's weighted character count (twitter-text v3): Latin 1, CJK and most other scripts 2, emoji 2, URL 23.
const LIGHT = [[0, 4351], [8192, 8205], [8208, 8223], [8242, 8247]];
const URL_RE = /\bhttps?:\/\/[^\s]+|\b(?:[a-z0-9-]+\.)+(?:com|net|org|io|ai|co|si|dev|app|me|cn|so|gg|xyz|info)(?:\/[^\s]*)?/gi;
const EMOJI_RE = /\p{Extended_Pictographic}/u;
const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter() : null;
const cpWeight = (cp) => (LIGHT.some(([a, b]) => cp >= a && cp <= b) ? 1 : 2);

export function weightedLength(text) {
  let s = String(text || '').normalize('NFC');
  let n = 0;
  s = s.replace(URL_RE, () => { n += 23; return ''; });
  const parts = seg ? Array.from(seg.segment(s), (x) => x.segment) : Array.from(s);
  for (const g of parts) {
    if (EMOJI_RE.test(g)) { n += 2; continue; }
    for (const ch of g) n += cpWeight(ch.codePointAt(0));
  }
  return n;
}

// ---- language
const LANG_NAMES = { en: 'English', zh: 'Simplified Chinese', ja: 'Japanese', ko: 'Korean', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese' };
const count = (s, re) => (String(s).match(re) || []).length;
const HAN = /\p{Script=Han}/gu;
const KANA = /[\p{Script=Hiragana}\p{Script=Katakana}]/gu;
const HANGUL = /\p{Script=Hangul}/gu;
const LATIN = /\p{Script=Latin}/gu;
const stripLinks = (s) => String(s).replace(/https?:\/\/\S+|@\w+|#\w+/g, ' ');

function resolveLang(idea, lang) {
  if (LANG_NAMES[lang]) return lang;
  const s = stripLinks(idea);
  const kana = count(s, KANA), hangul = count(s, HANGUL), han = count(s, HAN), latin = count(s, LATIN);
  if (kana >= 2) return 'ja';
  if (hangul >= 2 && hangul >= han) return 'ko';
  if (han >= 2 && han * 3 >= latin * 0.5) return 'zh';
  return 'en';
}

function langOk(text, lang) {
  const s = stripLinks(text);
  const han = count(s, HAN), kana = count(s, KANA), hangul = count(s, HANGUL);
  const latinWords = count(s, /\p{Script=Latin}[\p{Script=Latin}\d.'-]*/gu);
  if (lang === 'zh') return han >= 8 && han >= latinWords * 1.5;
  if (lang === 'ja') return kana >= 4;
  if (lang === 'ko') return hangul >= 8 && hangul >= latinWords;
  return han + kana + hangul <= Math.max(2, latinWords * 0.05);
}

// ---- format spec (weighted characters; CJK minimums are lower because each character says more)
const FORMAT_SPEC = {
  single: { posts: [1, 1], min: 160, minCjk: 120, max: 280 },
  thread: { posts: [4, 6], min: 220, minCjk: 160, max: 500 },
  long: { posts: [1, 1], min: 700, minCjk: 500, max: 2400 },
  greeting: { posts: [1, 1], min: 0, minCjk: 0, max: 200 },
};
const CJK_LANGS = ['zh', 'ja', 'ko'];

// Phrases that make a post read as machine-written (from HitPost's writing guide).
const BANNED = [
  '🚨', 'Excited to', "Let's dive in", "Here's the thing", 'game-changer', 'game changer', 'this changes everything',
  'delve', 'tapestry', 'unleash', 'seamless', 'revolutionize', 'cutting-edge', 'testament to', 'a new era', '🔹',
  '赋能', '颠覆', '重磅', '炸裂', '震撼', '一文读懂', '干货满满', '建议收藏', '家人们', '划重点',
];

function checkPosts(posts, format, lang) {
  const spec = FORMAT_SPEC[format] || FORMAT_SPEC.single;
  const cjk = CJK_LANGS.includes(lang);
  const problems = [];
  if (posts.length < spec.posts[0] || posts.length > spec.posts[1]) {
    problems.push(spec.posts[0] === spec.posts[1]
      ? `must be exactly ${spec.posts[0]} post, it has ${posts.length}`
      : `must have ${spec.posts[0]}–${spec.posts[1]} posts, it has ${posts.length}`);
  }
  // Minimums are soft: only drafts clearly short (15% grace) count.
  const min = Math.round((cjk ? spec.minCjk : spec.min) * 0.85);
  const unit = (n) => (cjk ? `${Math.round(n / 2)} characters` : `${n} weighted characters`);
  posts.forEach((p, i) => {
    const n = weightedLength(p);
    const which = posts.length > 1 ? `post ${i + 1}` : 'the post';
    if (n > spec.max) problems.push(`${which} is ${unit(n)}, over the ${unit(spec.max)} maximum: cut it`);
    else if (n < min) problems.push(`${which} is only ${unit(n)}, under the ${unit(min)} minimum: add a concrete detail`);
  });
  const all = posts.join('\n');
  if (!langOk(all, lang)) problems.push(`not written in ${LANG_NAMES[lang] || 'English'}`);
  const hits = BANNED.filter((b) => all.toLowerCase().includes(b.toLowerCase()));
  if (hits.length) problems.push(`sounds machine-written: remove ${hits.map((h) => `"${h}"`).join(', ')}`);
  // Bare domains count too: X turns "example.com" into a link.
  if (new RegExp(URL_RE.source, 'i').test(all.replace(/\n*(?:Source|来源|出典|출처)\s*[:：][^\n]*$/u, ''))) problems.push('has a link or domain in the body (X turns "example.com" into a link, which costs reach): name it instead, e.g. "the Claude app", "The Register"');
  if (format !== 'greeting' && /^\s*(?:\d+[/.)]|🧵)/m.test(posts.slice(1).join('\n'))) problems.push("numbered thread posts: don't number them");
  return problems;
}

const shareLink = (text) => `https://x.com/intent/post?text=${encodeURIComponent(text)}`;

// ---- main
const raw = process.argv[2] && process.argv[2] !== '-' ? fs.readFileSync(process.argv[2], 'utf8') : fs.readFileSync(0, 'utf8');
const input = JSON.parse(raw);
const format = FORMAT_SPEC[input.format] ? input.format : 'single';
const drafts = input.drafts || (input.posts ? [{ posts: input.posts }] : []);
const lang = resolveLang(input.idea || drafts.flatMap((d) => d.posts || []).join('\n'), input.lang || 'auto');

const out = {
  format, lang,
  drafts: drafts.map((d, i) => {
    const posts = (Array.isArray(d.posts) ? d.posts : [d.posts]).map((s) => String(s || '').trim()).filter(Boolean);
    const problems = checkPosts(posts, format, lang);
    return {
      n: i + 1,
      angle: d.angle || '',
      lengths: posts.map(weightedLength),
      ok: problems.length === 0,
      problems,
      // X's share link carries one post; for a thread, post the rest as replies.
      share: posts[0] ? shareLink(posts[0]) : '',
    };
  }),
};
console.log(JSON.stringify(out, null, 2));
