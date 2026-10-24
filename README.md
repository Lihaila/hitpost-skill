# HitPost skill for Claude

Write X (Twitter) posts that earn attention and sound human, right inside Claude.

Give it an idea, a topic, a link or a rough note. You get back **three ready-to-post drafts**, each with a different angle and a one-click **Post on X** link. It writes single posts, threads and long Premium posts, in any tone and in English, Chinese, Japanese, Korean and more.

This is the free version of [HitPost](https://lihaila.si), using the same writing rules HitPost runs in production.

## What it does

- **Hooks first.** Every draft leads with a reader need (useful, money, insider, a surprising number, humor) and ends on a takeaway, not a restated headline.
- **Sounds human.** It keeps out the phrases that mark a post as AI-written ("game-changer", "Let's dive in", 🚨, "Excited to share", 赋能, 重磅, 家人们…).
- **Doesn't make things up.** Numbers, quotes and stories come only from your idea or real research. Research happens only when the post needs current facts, so opinions and tips don't turn into news recaps.
- **Counts length the way X does.** A bundled checker counts CJK characters and emoji as 2, so a single post shows in full without "Show more", and every post in a thread lands in range.
- **Polishes your drafts.** Paste your own tweet to get two rewrites, scored 1–10 on hook, clarity, value, shareability and how human it sounds.

## Install

**Claude Code**

```
/plugin marketplace add Lihaila/hitpost-skill
/plugin install hitpost@hitpost
```

Or copy the skill folder in by hand:

```bash
git clone https://github.com/Lihaila/hitpost-skill
cp -r hitpost-skill/skills/hitpost ~/.claude/skills/
```

**claude.ai**

Download `hitpost.zip` from the [latest release](https://github.com/Lihaila/hitpost-skill/releases/latest). Then open **Settings → Capabilities**, turn on code execution, and upload it under **Skills**.

The length checker needs Node 18 or later. In Claude Code it uses the Node on your machine.

## Try it

```
write a tweet about this: cloudflare now blocks AI crawlers by default for new domains
帮我写一个推文串：独立开发者最大的问题不是技术，是不敢发布。语气犀利一点
make this tweet better: "Excited to share that I've been using Claude Code for 3 months…"
gm tweet pls, it's friday
```

## Want more?

[HitPost](https://lihaila.si) adds what a skill can't do on its own:

- **Live X research:** what X is saying about your topic this week, which posts did best, and which angles are already overdone.
- **Your own voice**, learned from your recent posts.
- **One-click posting** of whole threads, X Articles and images, plus reply drafts for your mentions.

## License

MIT
