# HitPost output spec

Read this before writing drafts. It holds the format, tone and post-type rules that HitPost uses in production.

## Contents
- Formats (length and shape)
- Tones
- Post types
- Greetings
- Source line

## Formats

Lengths are X's **weighted characters**: Latin letters and punctuation count 1, while CJK characters and emoji count 2 and a link counts 23. 280 weighted characters is where X folds a post behind "Show more". `scripts/check.mjs` measures this, so don't count by hand.

**single** (the default): exactly one post of 160–280 weighted characters (Chinese/Japanese/Korean: 60–140 characters; aim for about 100). That way the whole post shows without "Show more". Keep it short and tight, with one point and no padding. Use line breaks between beats.

**thread**: 4–6 posts. Every post is a full paragraph of 2–4 sentences, 220–500 weighted characters (CJK: 80–250 characters; aim for about 120 each). Each post is one complete beat with a concrete detail, never a one-line teaser. Post 1 is the hook: it has to stand alone and make people open the thread. The last post lands the takeaway. Don't number the posts. Posts over 280 need X Premium, so say so if the user may not have it.

**long** (X Premium): one post of 700–2,000 weighted characters (CJK: 250–1,000 characters; aim for about 450), in 4–8 short paragraphs separated by blank lines. Only the first ~280 weighted characters show before "Show more". The opening paragraph therefore has to stand alone, with the hook and the takeaway.

Pick the format from the request. Use "thread" or "🧵" for a thread, and "long post" or "Premium" for long. Otherwise use single.

## Tones

If the user names a tone, all three drafts use it, and the drafts then differ only in angle. If no tone is named, the three drafts take clearly different angles (for example one number-led, one story, one bold or funny). Each style sample shows style only, so never reuse its content.

- **insight**: Make one non-obvious claim in line one and back it with 1–2 concrete pieces of evidence. End with what it means for the reader. *"Everyone is watching the price cut. The real story is the context window: [evidence]. So [what to do]."*
- **story**: Tell a story, not a list of facts. Open on the moment or the surprise, then give the background (what was true before), what happened (name the source), why it happened, and what happens next. Use narrative connectives ("then", "so", "which is why"). *"A year ago this needed a server room. Then [event, source]. So now [consequence]."*
- **bold**: Take a clear, confident position that many people will disagree with. State it in line one, then back it with evidence. Stay fair and accurate, with no insults and no invented conflict. *"Unpopular take: [claim]. Here is why: [evidence]."*
- **funny**: The post has to make people smile. Build dry, witty humor on a real observation: irony, understatement, an absurd-but-true comparison, a deadpan punchline. At least one line has to be clearly a joke, and the post still delivers the point. No puns for their own sake, and at most one emoji. *"Every startup is an agent company now. Some agents even do things."*
- **pro** (professional): Be clear, credible and measured, for founders and operators. Lead with the business implication and use precise wording, with no slang and no hype. *"What this means for teams with steady inference volume: [implication], [evidence]."*

## Post types

Decide what the idea is before writing. Research pulls posts toward news, so research only when the type needs current facts.

| Type | What to write | Research? |
|---|---|---|
| news | What happened and why it matters to the reader. Lead with the most surprising part. | Yes, web search for current facts |
| insight | A non-obvious point backed by a fact or two. End with what it means for the reader. | Only if it hinges on a recent fact |
| opinion | A clear stance plus the reasoning. Not a news recap. | No |
| tip | One specific, actionable thing: what, why it works, how to start today. | No |
| story | Setup, turn, lesson. Use only the details the user gave. If there are none, tell it as a general lesson, never as invented events. | No |
| promo | The problem, what the product does, why it's different, and a call to action. Mention only features the user names. | No |
| question | A sharp question or a choice between two options that people want to answer. | No |
| greeting | gm, good night, thanks, happy Friday, a holiday. | No (see below) |

## Greetings

None of the hit-post machinery applies here: no angles, hooks, takeaways, research or minimum length. Write 3 versions of the same greeting in 1–3 short lines (under 200 characters; Chinese under 60 characters). Keep the greeting word the user typed ("gm", "早安"). Make it warm and human, with a touch of personality, the day or the vibe, and at most one emoji. Don't include advice, lessons, polls, forced questions, hashtags, links, facts or claims about the user's life. Pass `"format": "greeting"` to the checker.

## Source line

Add a source only when a draft states a specific fact or number from your research. Put it at the end of the last post on its own line as `Source: <outlet name>`. For Chinese use `来源：`, for Japanese `出典：` and for Korean `출처: `. Use the outlet's name, not a URL: a link costs reach on X, and a bare domain like "example.com" turns into a link too. Mention the link in chat if the user wants it. Never name a source you didn't actually read.
