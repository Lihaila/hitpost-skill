# HitPost skills for AI agents

Write X (Twitter) posts that earn attention and sound human, right inside your AI agent: Claude Code, Codex, Cursor, Gemini CLI or any agent that supports SKILL.md skills.

Two skills, from the makers of [HitPost](https://lihaila.si):

| | **hitpost** | **hitpost-pro** |
|---|---|---|
| What writes the posts | Your agent, following HitPost's writing rules | HitPost's own pipeline, on your account |
| Live X research (what X is saying this week) | – (web search only) | ✓ Grok reads X live |
| Polish with a blind multi-model judge | Your agent scores its own rewrites | ✓ DeepSeek + Qwen rewrite, Grok judges |
| X Articles | – | ✓ |
| Posting | Share links | ✓ Posts to your X account after you confirm |
| Cost | Free | Free to install; uses [HitPost credits](https://lihaila.si) (free credits on sign-up, then top up) |
| Needs | Nothing | A blue-check X account and a HitPost API key |

## hitpost (free)

Give it an idea, a topic, a link or a rough note. You get back **three ready-to-post drafts**, each with a different angle and a one-click **Post on X** link. It writes single posts, threads and long Premium posts, in any tone and in English, Chinese, Japanese, Korean and more. It uses the same writing rules HitPost runs in production.

- **Hooks first.** Every draft leads with a reader need (useful, money, insider, a surprising number, humor) and ends on a takeaway, not a restated headline.
- **Sounds human.** It keeps out the phrases that mark a post as AI-written ("game-changer", "Let's dive in", 🚨, "Excited to share", 赋能, 重磅, 家人们…).
- **Doesn't make things up.** Numbers, quotes and stories come only from your idea or real research. Research happens only when the post needs current facts, so opinions and tips don't turn into news recaps.
- **Counts length the way X does.** A bundled checker counts CJK characters and emoji as 2, so a single post shows in full without "Show more", and every post in a thread lands in range.
- **Polishes your drafts.** Paste your own tweet to get two rewrites, scored 1–10 on hook, clarity, value, shareability and how human it sounds.

## hitpost-pro (HitPost credits)

Runs the real HitPost on your account from inside your agent: live research, three drafts (or a full X Article), polish, then posting after you confirm the exact text.

1. Sign in with X at [lihaila.si](https://lihaila.si). HitPost is for blue-check accounts.
2. Open the account menu → **Use in AI agents** → **Create a key**.
3. Install the skill (below) and paste the key when your agent asks.

Each craft uses 1 credit; polishing and formatting are free within a daily allowance. New accounts get free credits once, then you top up on the site with Stripe. Credits are shared between the site and the skill, and a craft that fails is refunded. It needs an agent with network access; the claude.ai sandbox may block calls to outside servers.

## Install

**Claude Code**

```
/plugin marketplace add Lihaila/hitpost-skill
/plugin install hitpost@hitpost
```

This installs both skills. Or copy one in by hand:

```bash
git clone https://github.com/Lihaila/hitpost-skill
cp -r hitpost-skill/skills/hitpost ~/.claude/skills/        # free
cp -r hitpost-skill/skills/hitpost-pro ~/.claude/skills/    # HitPost credits
```

**Any other agent that supports SKILL.md skills** (Codex, Cursor, Gemini CLI and others): copy the skill folder from `skills/` into that agent's skills directory (see its docs for the location). The scripts are plain Node with no dependencies, so nothing else is needed. We built and tested these with Claude Code.

**claude.ai**

Download `hitpost.zip` (or `hitpost-pro.zip`) from the [latest release](https://github.com/Lihaila/hitpost-skill/releases/latest). Then open **Settings → Capabilities**, turn on code execution, and upload it under **Skills**.

Both skills need Node 18 or later for their scripts; they use the Node on your machine.

## Try it

```
write a tweet about this: cloudflare now blocks AI crawlers by default for new domains
帮我写一个推文串：独立开发者最大的问题不是技术，是不敢发布。语气犀利一点
make this tweet better: "Excited to share that I've been using Claude Code for 3 months…"
gm tweet pls, it's friday
write a thread on what X is saying about the new Grok model, then post it   # hitpost-pro
```

## License

MIT
