# Mindset backlog

The Mindset map. ~4,400 library entries organised by 16 life categories,
sub-category where applicable, and stuck-on point — plus a 17th
cross-cutting genre section (Section 17: Manifesting & magical) that
overlays mood tags onto entries from any of the 16 life categories.
Drives bulk authoring in Phase 8 (Step 13 sets this up; Step 12-pattern
bulk authoring sessions consume it, with the autopilot prompt at
`docs/autopilot-prompts/mindset.md` doing weighted category selection).

Each entry is a single bullet:

```
- [PRACTICE_TYPE] Title — source code
```

`PRACTICE_TYPE` is one of the eleven `PracticeType` enum values:
TAPPING, ENERGY_STATEMENT, AFFIRMATION, SPELL, RITUAL, ACTIVITY,
JOURNAL_PROMPT, VISUALISATION, MEDITATION, EMBODIMENT, READING. The
title is the working name — the bulk authoring worker may refine it as
the body is drafted, but the working name fixes scope.

## Source legend

The trailing code tells the authoring worker where to pull from. Three
streams, per `docs/mindset-pipeline.md` § "Library content sources":

| Code | Meaning |
|---|---|
| `MONEY-v2/D<n>` | MONEY: A 12-Week Tapping Program — day `n` (1–84). Extracted at `.claude/extracted/mindset-source/MONEY-v2.txt`. |
| `MONEY-Journal/W<n>` | MONEY Journal — week `n` (1–12) ritual + daily reflection prompts. Extracted at `.claude/extracted/mindset-source/MONEY-Journal.txt`. |
| `Money-Zone/Ch<n>` | The Money Zone v1 — chapter `n`. Anchor method. Extracted at `.claude/extracted/mindset-source/The-Money-Zone-v1.txt`. |
| `SLEEP-v2/D<n>` | SLEEP — 30-Day Tapping Intensive — day `n` (1–30). Extracted at `.claude/extracted/mindset-source/SLEEP-v2.txt`. |
| `WEIGHT-LOSS-v2/D<n>` | WEIGHT LOSS: A 12-Week Tapping Program — day `n` (1–84). Extracted at `.claude/extracted/mindset-source/WEIGHT-LOSS-v2.txt`. |
| `MANIFESTING-v2/D<n>` | MANIFESTING: A 12-Week Tapping Program — day `n` (1–84). Extracted at `.claude/extracted/mindset-source/MANIFESTING-v2.txt`. |
| `[PD]` | Public-domain expansion. Authoring worker synthesises in Rebecca's voice from public-domain sources (EFT history, mindfulness traditions, folk magic, perimenopause / menopause clinical material, grief literature, forgiveness research, etc.) per `docs/mindset-pipeline.md` § Stream 2. |
| `[NEW]` | Rebecca-original — net-new content for the app, beyond her existing books. Authoring worker drafts from scratch in Rebecca's voice. |

Many entries cross-tag categories (e.g. "Spouse-money disagreements"
tags Money + Relationships). Primary category sits in this backlog
under the cell most natural for discovery; cross-tags surface at
authoring time via the `practiceTargets[]` field. Don't double-list
the entry under each tag — that's a bulk-authoring decision, not a
backlog one.

Voice rules apply (`feedback_homemade_voice.md` + Mindset-specific
anti-tells in `docs/mindset-pipeline.md` § "Anti-tells"). British
English. No "queen / boss / step into your power" register. Direct,
specific, gentle, real.

---

## 1. Money

84-day arc from `MONEY-v2` plus the 12 named ceremonies from `MONEY-Journal`,
plus stuck-on points not in the 84-day arc (autonomy in marriage, pricing,
asking for raises, inheritance, etc.), plus long-form reading entries
(Money Zone method explained, why huge wealth feels impossible, the feast-
and-famine cycle, the Lottery fantasy as scarcity tell). ~600 entries.

### Phase 1 — Clear Money Stress & Survival Patterns (Days 1–21)

#### Week 1 — Release Money Anxiety

##### Day 1 — Calm daily money panic

- [TAPPING] Tapping for daily money panic — MONEY-v2/D1
- [ENERGY_STATEMENT] I am safe and steady with money today — MONEY-v2/D1
- [AFFIRMATION] Money panic is leaving my body — MONEY-v2/D1
- [RITUAL] Hand on heart, money breath — five rounds — [PD]
- [JOURNAL_PROMPT] Where in my body does money panic sit? — MONEY-Journal/W1
- [VISUALISATION] Watching the panic drain out through my feet — [PD]
- [READING] Why money panic is a survival pattern, not a personality — MONEY-v2/D1 + [PD]

##### Day 2 — Release fear of running out

- [TAPPING] Tapping for "what if it runs out" — MONEY-v2/D2
- [ENERGY_STATEMENT] There has always been enough; there is enough now — MONEY-v2/D2
- [AFFIRMATION] I am safe even when the number is small — MONEY-v2/D2
- [RITUAL] Open the banking app, exhale, close it — [PD]
- [JOURNAL_PROMPT] The earliest "what if we run out" memory I can find — MONEY-Journal/W1
- [VISUALISATION] The reservoir that refills itself — [PD]
- [READING] Why "running out" loops even when the bills are paid — [PD]

##### Day 3 — Let go of "bills always win" stress

- [TAPPING] Tapping for "the bills always win" — MONEY-v2/D3
- [ENERGY_STATEMENT] Bills are met. I am met. There is more coming — MONEY-v2/D3
- [AFFIRMATION] Paying a bill is moving money — not losing it — MONEY-v2/D3
- [RITUAL] Bless-and-pay — touch each bill before clicking send — [PD]
- [JOURNAL_PROMPT] What does "the bills always win" actually mean about me? — MONEY-Journal/W1
- [VISUALISATION] Money flowing out and flowing back, same river — [PD]

##### Day 4 — End the feast/famine cycle

- [TAPPING] Tapping for the feast-or-famine swing — MONEY-v2/D4
- [ENERGY_STATEMENT] I can hold a full account without bracing — MONEY-v2/D4
- [AFFIRMATION] Steady, steady, steady — MONEY-v2/D4
- [ACTIVITY] Leave a £20 note in your wallet for a full week without touching it — [PD]
- [JOURNAL_PROMPT] When the money came in last time, what did I do with it? — MONEY-Journal/W1
- [VISUALISATION] A level pool, not a churning sea — [PD]
- [READING] The feast-and-famine cycle and how to break it — MONEY-v2/D4 + [NEW]

##### Day 5 — Release shame about past mistakes

- [TAPPING] Tapping for past money shame — MONEY-v2/D5
- [ENERGY_STATEMENT] I forgive past me. She did what she could — MONEY-v2/D5
- [AFFIRMATION] My past money choices don't run me anymore — MONEY-v2/D5
- [JOURNAL_PROMPT] The money decision I'd take back — and what I'd do instead — MONEY-Journal/W1
- [VISUALISATION] Writing the regret down and burning the paper — [PD]
- [EMBODIMENT] Hand on chest: "You were doing your best" — [PD]
- [READING] Money shame is not the same as money wisdom — [NEW]

##### Day 6 — Stop obsessing over debt

- [TAPPING] Tapping for debt obsession — MONEY-v2/D6
- [ENERGY_STATEMENT] Debt is a number, not who I am — MONEY-v2/D6
- [AFFIRMATION] I look at the number from steady ground — MONEY-v2/D6
- [ACTIVITY] Look at the balance once at a set time, then close it — [PD]
- [JOURNAL_PROMPT] What does the debt number make me believe about me? — MONEY-Journal/W1
- [VISUALISATION] The debt as a fenced field — visible, not moving in — [PD]
- [READING] Why "watching the number" doesn't change the number — [NEW]

##### Day 7 — Invite peace around paying bills

- [TAPPING] Tapping for peace at bill time — MONEY-v2/D7
- [ENERGY_STATEMENT] I pay bills from steady ground — MONEY-v2/D7
- [AFFIRMATION] Bills met, breath even — MONEY-v2/D7
- [RITUAL] The Calm & Safe Money Reset — full ceremony — MONEY-Journal/W1
- [JOURNAL_PROMPT] One bill that doesn't have to feel hard — MONEY-Journal/W1
- [VISUALISATION] The bills paid, the lights still on, the house quiet — [PD]

#### Week 2 — Break Generational Struggle

##### Day 8 — Acknowledge family money stories

- [TAPPING] Tapping for the family money story I inherited — MONEY-v2/D8
- [ENERGY_STATEMENT] I see the story. I am not the story — MONEY-v2/D8
- [AFFIRMATION] My money line begins with me — MONEY-v2/D8
- [JOURNAL_PROMPT] The first thing I ever heard about money — MONEY-Journal/W2
- [VISUALISATION] The line of women behind me, hands open — [PD]
- [READING] Why family money stories run quietly until they don't — [NEW]

##### Day 9 — Release "we never get ahead" beliefs

- [TAPPING] Tapping for "we never get ahead" — MONEY-v2/D9
- [ENERGY_STATEMENT] I get to be the one who breaks the pattern — MONEY-v2/D9
- [AFFIRMATION] Ahead is allowed. Ahead is safe — MONEY-v2/D9
- [JOURNAL_PROMPT] Who in the family said this — and why? — MONEY-Journal/W2
- [VISUALISATION] Stepping over the line they couldn't cross — [PD]

##### Day 10 — Let go of "money is hard to earn"

- [TAPPING] Tapping for "money is hard to earn" — MONEY-v2/D10
- [ENERGY_STATEMENT] Money can come easily and I am safe to receive it — MONEY-v2/D10
- [AFFIRMATION] Earning can feel light — MONEY-v2/D10
- [JOURNAL_PROMPT] Where did "money is hard" come from? — MONEY-Journal/W2
- [VISUALISATION] Easy money arriving in three forms by Friday — [PD]
- [READING] The "hard work" story and what it costs you — [NEW]

##### Day 11 — Release fear of repeating family patterns

- [TAPPING] Tapping for fear of repeating the family pattern — MONEY-v2/D11
- [ENERGY_STATEMENT] I am not my mother's bank balance — MONEY-v2/D11
- [AFFIRMATION] I get to do this differently — MONEY-v2/D11
- [JOURNAL_PROMPT] The pattern I am most afraid of repeating — MONEY-Journal/W2
- [VISUALISATION] The fork in the road — and choosing the new path — [PD]

##### Day 12 — Forgive ancestors' financial pain

- [TAPPING] Tapping to forgive the women before me — MONEY-v2/D12
- [ENERGY_STATEMENT] I honour what they survived. I get to thrive — MONEY-v2/D12
- [AFFIRMATION] Their fight made my ease possible — MONEY-v2/D12
- [RITUAL] Lighting a candle for the women in your line — [PD]
- [JOURNAL_PROMPT] What did my grandmother believe about money? — MONEY-Journal/W2
- [VISUALISATION] Handing the burden back gently — [PD]
- [READING] Ancestor work and money lineage — [PD]

##### Day 13 — Allow new wealthy lineage

- [TAPPING] Tapping to allow myself to be the wealthy one — MONEY-v2/D13
- [ENERGY_STATEMENT] The wealthy lineage starts here — MONEY-v2/D13
- [AFFIRMATION] My children's grandchildren will say "she changed everything" — MONEY-v2/D13
- [JOURNAL_PROMPT] Who do I become as the start of the new line? — MONEY-Journal/W2
- [VISUALISATION] Looking back from the end of your life at the lineage you started — [PD]

##### Day 14 — Celebrate new family money story

- [TAPPING] Tapping for the new family story — MONEY-v2/D14
- [ENERGY_STATEMENT] The new story is already true — MONEY-v2/D14
- [AFFIRMATION] In this family we hold money well — MONEY-v2/D14
- [RITUAL] The Ancestral Release & Wealth Lineage Activation — full ceremony — MONEY-Journal/W2
- [JOURNAL_PROMPT] What I want my grandchildren to inherit — MONEY-Journal/W2
- [VISUALISATION] The new family story written into the wall of a house you own — [PD]

#### Week 3 — End Self-Sabotage & Scarcity Thinking

##### Day 15 — Release guilt about wanting wealth

- [TAPPING] Tapping for "is it wrong to want this?" — MONEY-v2/D15
- [ENERGY_STATEMENT] My wanting is sacred. I am allowed to want this much — MONEY-v2/D15
- [AFFIRMATION] Wanting wealth is allowed — MONEY-v2/D15
- [JOURNAL_PROMPT] Where did I learn that wanting was wrong? — MONEY-Journal/W3
- [VISUALISATION] Telling your younger self she's allowed — [PD]
- [READING] Why women are taught to apologise for wanting — [NEW]

##### Day 16 — Let go of "others can, not me"

- [TAPPING] Tapping for "this isn't for me" — MONEY-v2/D16
- [ENERGY_STATEMENT] What's available to her is available to me — MONEY-v2/D16
- [AFFIRMATION] I am the woman who has it. Not someday — now — MONEY-v2/D16
- [JOURNAL_PROMPT] Whose money life have I decided isn't allowed to be mine? — MONEY-Journal/W3
- [VISUALISATION] Stepping inside the life you said wasn't yours — [PD]
- [SPELL] Bay-leaf burn — the number that scares you, released into smoke — [PD]

##### Day 17 — Stop expecting struggle and famine

- [TAPPING] Tapping for the expectation of struggle — MONEY-v2/D17
- [ENERGY_STATEMENT] Ease is allowed to be the new pattern — MONEY-v2/D17
- [AFFIRMATION] It can be easier than I expect — MONEY-v2/D17
- [JOURNAL_PROMPT] What would I do if I knew it would be easy? — MONEY-Journal/W3
- [VISUALISATION] The week ahead arriving easier than expected — [PD]

##### Day 18 — Release fear of success or visibility

- [TAPPING] Tapping for the fear of being seen with money — MONEY-v2/D18
- [ENERGY_STATEMENT] I am safe to be seen as wealthy — MONEY-v2/D18
- [AFFIRMATION] Visible is safe. Visible is allowed — MONEY-v2/D18
- [JOURNAL_PROMPT] What am I afraid people will say if I have it? — MONEY-Journal/W3
- [VISUALISATION] Walking into the room wearing the thing you bought yourself — [PD]
- [READING] Why women dim themselves at the income they secretly want — [NEW]

##### Day 19 — End "I'll lose it if I gain it" worry

- [TAPPING] Tapping for "I'll lose it if I get it" — MONEY-v2/D19
- [ENERGY_STATEMENT] I keep what comes to me — MONEY-v2/D19
- [AFFIRMATION] I am a safe place for money to land — MONEY-v2/D19
- [JOURNAL_PROMPT] The last time I had it and lost it — what really happened? — MONEY-Journal/W3
- [VISUALISATION] Money arriving and staying — like guests who decide to live with you — [PD]

##### Day 20 — Clear hidden resistance to wealth

- [TAPPING] Tapping for the secret no to wealth — MONEY-v2/D20
- [ENERGY_STATEMENT] I clear the hidden refusal. Yes is allowed — MONEY-v2/D20
- [AFFIRMATION] I say yes to wealth in every layer of me — MONEY-v2/D20
- [JOURNAL_PROMPT] What part of me doesn't actually want this? — MONEY-Journal/W3
- [VISUALISATION] Finding the no and turning it into a yes — [PD]

##### Day 21 — Anchor a new feeling of safety with money

- [TAPPING] Tapping for safety with money — MONEY-v2/D21
- [ENERGY_STATEMENT] Money is safe. I am safe with money — MONEY-v2/D21
- [AFFIRMATION] Safe, steady, mine — MONEY-v2/D21
- [RITUAL] The Safety & Stability Activation — full ceremony — MONEY-Journal/W3
- [JOURNAL_PROMPT] What does "safe with money" feel like in my body? — MONEY-Journal/W3
- [VISUALISATION] Money in the room, like a calm dog at your feet — [PD]
- [READING] Anchoring safety as a new normal around money — MONEY-v2/D21 + [NEW]

### Phase 2 — Rewrite Core Money Identity (Days 22–42)

#### Week 4 — Step Into Wealthy Identity

##### Day 22 — See myself as someone who has money

- [TAPPING] Tapping to see myself as someone who has it — MONEY-v2/D22
- [ENERGY_STATEMENT] I am her. She is me. We are the same woman — MONEY-v2/D22
- [AFFIRMATION] I am a woman with money — MONEY-v2/D22
- [EMBODIMENT] Dress today as the version of you who already has it — [PD]
- [JOURNAL_PROMPT] What does the woman with money wear on a Tuesday? — MONEY-Journal/W4
- [VISUALISATION] Opening the front door of her house — [PD]

##### Day 23 — Claim the identity of a wise wealth creator

- [TAPPING] Tapping to claim "wise wealth creator" — MONEY-v2/D23
- [ENERGY_STATEMENT] I am wise with what comes through me — MONEY-v2/D23
- [AFFIRMATION] I am a wise wealth creator — MONEY-v2/D23
- [JOURNAL_PROMPT] What does a wise wealth creator do on Monday morning? — MONEY-Journal/W4
- [VISUALISATION] Sitting at the desk where the wealth decisions get made — [PD]

##### Day 24 — Feel worthy of millions

- [TAPPING] Tapping for "worthy of millions" — MONEY-v2/D24
- [ENERGY_STATEMENT] Millions are allowed to be mine — MONEY-v2/D24
- [AFFIRMATION] I am worthy of millions, simply because I am — MONEY-v2/D24
- [SPELL] Write the figure on paper, fold it, tuck it in your bra for 30 days — [PD]
- [JOURNAL_PROMPT] The number I am most afraid to write down — MONEY-Journal/W4
- [VISUALISATION] Opening the bank app and seeing seven figures — [PD]
- [READING] Why huge wealth feels impossible to picture (and what to do about it) — Money-Zone/Ch1 + [NEW]

##### Day 25 — Release fear of owning property & assets

- [TAPPING] Tapping for fear of owning property — MONEY-v2/D25
- [ENERGY_STATEMENT] I am ready to hold property and land — MONEY-v2/D25
- [AFFIRMATION] Houses, land, assets — they're allowed to be mine — MONEY-v2/D25
- [ACTIVITY] The walk-by — drive past the house you want, slowly, twice — [PD]
- [JOURNAL_PROMPT] The house I would buy if I knew I could — MONEY-Journal/W4
- [VISUALISATION] Standing in your own hallway, keys in hand — [PD]

##### Day 26 — Trust that wealth fits my lifestyle

- [TAPPING] Tapping for "wealth fits me" — MONEY-v2/D26
- [ENERGY_STATEMENT] Wealth fits the life I am building — MONEY-v2/D26
- [AFFIRMATION] My life and wealth are the same shape — MONEY-v2/D26
- [JOURNAL_PROMPT] What changes about my day-to-day when the wealth lands? — MONEY-Journal/W4
- [VISUALISATION] Tuesday morning with the money already in — [PD]

##### Day 27 — Feel safe receiving big sums

- [TAPPING] Tapping for safety receiving a big sum — MONEY-v2/D27
- [ENERGY_STATEMENT] I receive without bracing — MONEY-v2/D27
- [AFFIRMATION] Big sums are safe to hold — MONEY-v2/D27
- [RITUAL] The receiving stance — palms up, breath slow, three rounds — [PD]
- [JOURNAL_PROMPT] The last time something good arrived — how did my body react? — MONEY-Journal/W4
- [VISUALISATION] A six-figure deposit notification — and your body staying calm — [PD]

##### Day 28 — Celebrate the wealthy version of me

- [TAPPING] Tapping to celebrate her — MONEY-v2/D28
- [ENERGY_STATEMENT] She is here. I am her. We celebrate — MONEY-v2/D28
- [AFFIRMATION] I love who I am becoming — MONEY-v2/D28
- [RITUAL] The Wealth Identity Embodiment — full ceremony — MONEY-Journal/W4
- [JOURNAL_PROMPT] What does she love most about her life? — MONEY-Journal/W4
- [VISUALISATION] A dinner with the wealthy you and the current you — [PD]

#### Week 5 — Believe in Unlimited Income

##### Day 29 — Release "hard work = only way to earn"

- [TAPPING] Tapping for "hard work is the only way" — MONEY-v2/D29
- [ENERGY_STATEMENT] Money can come through ease as well as effort — MONEY-v2/D29
- [AFFIRMATION] Earning has many shapes — MONEY-v2/D29
- [JOURNAL_PROMPT] Where did "hard work = worth" come from? — MONEY-Journal/W5
- [VISUALISATION] Money arriving while you nap — [PD]
- [READING] The hard-work loop and how to widen it — [NEW]

##### Day 30 — Let go of trading time for money

- [TAPPING] Tapping for "I only earn when I work" — MONEY-v2/D30
- [ENERGY_STATEMENT] My earning is no longer tied to my hours — MONEY-v2/D30
- [AFFIRMATION] Money comes through me, not just from me — MONEY-v2/D30
- [JOURNAL_PROMPT] One way I could earn without trading time — MONEY-Journal/W5
- [VISUALISATION] Income arriving from three sources you didn't have last year — [PD]

##### Day 31 — Open to multiple income streams

- [TAPPING] Tapping to open to multiple streams — MONEY-v2/D31
- [ENERGY_STATEMENT] My income has many doors — MONEY-v2/D31
- [AFFIRMATION] Income flows from many directions — MONEY-v2/D31
- [JOURNAL_PROMPT] List three income streams you've never tried — MONEY-Journal/W5
- [VISUALISATION] The fan of envelopes — each one a different source — [PD]

##### Day 32 — Trust money can come from anywhere

- [TAPPING] Tapping for "it can come from anywhere" — MONEY-v2/D32
- [ENERGY_STATEMENT] The universe has more doors than I can see — MONEY-v2/D32
- [AFFIRMATION] Money finds me — through expected doors and unexpected ones — MONEY-v2/D32
- [JOURNAL_PROMPT] The strangest way money has ever arrived for you — MONEY-Journal/W5
- [VISUALISATION] The door you didn't know was a door — opening — [PD]

##### Day 33 — Welcome surprise windfalls

- [TAPPING] Tapping to welcome windfalls — MONEY-v2/D33
- [ENERGY_STATEMENT] I welcome the unexpected — MONEY-v2/D33
- [AFFIRMATION] Surprise money is on its way — MONEY-v2/D33
- [SPELL] Cinnamon at the threshold — three pinches at the front door — [PD]
- [JOURNAL_PROMPT] The amount that would feel like a real windfall — MONEY-Journal/W5
- [VISUALISATION] The envelope you didn't expect — [PD]

##### Day 34 — Anchor belief in easy, endless earning

- [TAPPING] Tapping for easy, endless earning — MONEY-v2/D34
- [ENERGY_STATEMENT] Earning is allowed to be easy and endless — MONEY-v2/D34
- [AFFIRMATION] My earning is easy. My earning is endless — MONEY-v2/D34
- [JOURNAL_PROMPT] What would I do this week if I knew the money was easy? — MONEY-Journal/W5
- [VISUALISATION] A bank balance that climbs while you sleep — [PD]

##### Day 35 — Celebrate new money opportunities

- [TAPPING] Tapping to celebrate the new opportunities — MONEY-v2/D35
- [ENERGY_STATEMENT] I notice the opportunities. I say yes — MONEY-v2/D35
- [AFFIRMATION] Opportunity finds me ready — MONEY-v2/D35
- [RITUAL] The Infinite Flow Activation — full ceremony — MONEY-Journal/W5
- [JOURNAL_PROMPT] The opportunity I almost said no to last month — MONEY-Journal/W5
- [VISUALISATION] The yes that changes the trajectory — [PD]

#### Week 6 — Welcome Overflow & Savings

##### Day 36 — Feel safe holding large sums

- [TAPPING] Tapping for safety holding large sums — MONEY-v2/D36
- [ENERGY_STATEMENT] I am safe with a full account — MONEY-v2/D36
- [AFFIRMATION] A full account is safe — MONEY-v2/D36
- [JOURNAL_PROMPT] What is the largest amount you've held? What happened next? — MONEY-Journal/W6
- [VISUALISATION] A six-figure balance, your shoulders down — [PD]

##### Day 37 — Release fear of losing money

- [TAPPING] Tapping for fear of losing it — MONEY-v2/D37
- [ENERGY_STATEMENT] What flows in, stays in — MONEY-v2/D37
- [AFFIRMATION] Money stays — MONEY-v2/D37
- [JOURNAL_PROMPT] The "I'll lose it" voice — whose voice is it? — MONEY-Journal/W6
- [VISUALISATION] Money settled, like silt in a calm pond — [PD]

##### Day 38 — Allow savings to grow effortlessly

- [TAPPING] Tapping for effortless savings — MONEY-v2/D38
- [ENERGY_STATEMENT] My savings grow without my effort — MONEY-v2/D38
- [AFFIRMATION] I save easily and joyfully — MONEY-v2/D38
- [ACTIVITY] Set up the small auto-transfer to savings today — [PD]
- [JOURNAL_PROMPT] Saving without making it heavy — what's the smallest step? — MONEY-Journal/W6
- [VISUALISATION] The savings number climbing on its own — [PD]

##### Day 39 — Anchor belief in massive cashflow

- [TAPPING] Tapping for massive cashflow — MONEY-v2/D39
- [ENERGY_STATEMENT] Massive cashflow is allowed and mine — MONEY-v2/D39
- [AFFIRMATION] Cash flows through me in abundance — MONEY-v2/D39
- [JOURNAL_PROMPT] What does cashflow at your dream level feel like? — MONEY-Journal/W6
- [VISUALISATION] Money moving through your account like a river — [PD]

##### Day 40 — See myself as a natural investor

- [TAPPING] Tapping for "I am a natural investor" — MONEY-v2/D40
- [ENERGY_STATEMENT] I invest with clarity. I am allowed to grow money — MONEY-v2/D40
- [AFFIRMATION] I am an investor — MONEY-v2/D40
- [JOURNAL_PROMPT] What I'd invest in if I knew it would work — MONEY-Journal/W6
- [VISUALISATION] Investments compounding — green numbers on a page — [PD]
- [READING] Why "investing isn't for me" is a story, not a fact — [PD]

##### Day 41 — Celebrate building generational wealth

- [TAPPING] Tapping to build generational wealth — MONEY-v2/D41
- [ENERGY_STATEMENT] I am building wealth that outlives me — MONEY-v2/D41
- [AFFIRMATION] I am building a fortune that lasts — MONEY-v2/D41
- [JOURNAL_PROMPT] What I want to leave my children's children — MONEY-Journal/W6
- [VISUALISATION] The fund with your family's name on it — [PD]

##### Day 42 — Feel calm and happy with overflowing accounts

- [TAPPING] Tapping for calm with overflow — MONEY-v2/D42
- [ENERGY_STATEMENT] Overflow feels good in my body — MONEY-v2/D42
- [AFFIRMATION] Overflow is allowed. Overflow is good — MONEY-v2/D42
- [RITUAL] The Overflow Anchoring Ceremony — full ceremony — MONEY-Journal/W6
- [JOURNAL_PROMPT] What does my body do when the number is good? — MONEY-Journal/W6
- [VISUALISATION] Watering the garden with the overflow — [PD]

### Phase 3 — Magnetise Wealth & Opportunities (Days 43–63)

#### Week 7 — Open to Inspired Opportunities

##### Day 43 — Spot profitable ideas easily

- [TAPPING] Tapping to spot profitable ideas — MONEY-v2/D43
- [ENERGY_STATEMENT] Ideas come to me. I am a magnet for the right ones — MONEY-v2/D43
- [AFFIRMATION] I see the opportunities others miss — MONEY-v2/D43
- [JOURNAL_PROMPT] An idea I dismissed last week — was I right to? — MONEY-Journal/W7
- [VISUALISATION] The idea arriving while you walk — [PD]

##### Day 44 — Take bold action without fear

- [TAPPING] Tapping for bold action — MONEY-v2/D44
- [ENERGY_STATEMENT] I move forward even when uncertain — MONEY-v2/D44
- [AFFIRMATION] Bold is safe — MONEY-v2/D44
- [JOURNAL_PROMPT] The bold step I'd take this week if I knew it would land — MONEY-Journal/W7
- [VISUALISATION] Sending the email, the message, the offer — [PD]

##### Day 45 — Release procrastination around money moves

- [TAPPING] Tapping for money-move procrastination — MONEY-v2/D45
- [ENERGY_STATEMENT] I move on the money decisions in front of me — MONEY-v2/D45
- [AFFIRMATION] I act on what's mine to act on — MONEY-v2/D45
- [ACTIVITY] Pick the one money task you've been avoiding. Do five minutes of it. — [PD]
- [JOURNAL_PROMPT] The money decision sitting in my inbox right now — MONEY-Journal/W7
- [VISUALISATION] The "done" stamp on the task you'd been avoiding — [PD]

##### Day 46 — Attract perfect partnerships and clients

- [TAPPING] Tapping to attract the right partnerships — MONEY-v2/D46
- [ENERGY_STATEMENT] The right people find me, and I find them — MONEY-v2/D46
- [AFFIRMATION] My right people are already on their way — MONEY-v2/D46
- [JOURNAL_PROMPT] What does the right client / partner look like to me? — MONEY-Journal/W7
- [VISUALISATION] The meeting where it clicks — [PD]

##### Day 47 — Welcome property and investment chances

- [TAPPING] Tapping to welcome property opportunities — MONEY-v2/D47
- [ENERGY_STATEMENT] The right house finds me — MONEY-v2/D47
- [AFFIRMATION] Property is for me — MONEY-v2/D47
- [ACTIVITY] Walk through one property listing as if you're going to view it — [PD]
- [JOURNAL_PROMPT] The kind of property I keep noticing — MONEY-Journal/W7
- [VISUALISATION] The completion-day handshake — [PD]

##### Day 48 — Trust timing of big opportunities

- [TAPPING] Tapping for trust in timing — MONEY-v2/D48
- [ENERGY_STATEMENT] The timing is correct, even when I can't see it — MONEY-v2/D48
- [AFFIRMATION] I trust the timing — MONEY-v2/D48
- [JOURNAL_PROMPT] When have you been glad it didn't happen sooner? — MONEY-Journal/W7
- [VISUALISATION] The clock that knows what you don't yet know — [PD]

##### Day 49 — Celebrate new flows of income

- [TAPPING] Tapping to celebrate new flows — MONEY-v2/D49
- [ENERGY_STATEMENT] My income has more doors than it had last year — MONEY-v2/D49
- [AFFIRMATION] I am open to all the new ways money is finding me — MONEY-v2/D49
- [RITUAL] The Inspired Opportunity Activation — full ceremony — MONEY-Journal/W7
- [JOURNAL_PROMPT] The new flow that surprised me most this year — MONEY-Journal/W7
- [VISUALISATION] Standing at the place where two flows meet — [PD]

#### Week 8 — Align Daily Habits with Wealth

##### Day 50 — Build consistent wealth habits

- [TAPPING] Tapping for daily wealth habits — MONEY-v2/D50
- [ENERGY_STATEMENT] Consistency is allowed to feel easy — MONEY-v2/D50
- [AFFIRMATION] I am a woman who shows up daily for her money — MONEY-v2/D50
- [ACTIVITY] Five minutes with the money — same time every day for a week — [PD]
- [JOURNAL_PROMPT] What does my daily money rhythm look like? — MONEY-Journal/W8
- [VISUALISATION] A line of small daily actions stacking into a tower — [PD]

##### Day 51 — Enjoy managing and tracking money

- [TAPPING] Tapping for enjoyment in tracking money — MONEY-v2/D51
- [ENERGY_STATEMENT] Tracking is intimacy with my money — MONEY-v2/D51
- [AFFIRMATION] I love knowing where my money is — MONEY-v2/D51
- [RITUAL] The Sunday money date — half an hour with the numbers and a candle — [PD]
- [JOURNAL_PROMPT] What does my money want to be asked about? — MONEY-Journal/W8
- [VISUALISATION] The clean ledger — every line accounted for — [PD]

##### Day 52 — Love saving and investing

- [TAPPING] Tapping to love saving — MONEY-v2/D52
- [ENERGY_STATEMENT] Saving is a love letter to future me — MONEY-v2/D52
- [AFFIRMATION] I love watching savings grow — MONEY-v2/D52
- [JOURNAL_PROMPT] The first thing my savings will buy — MONEY-Journal/W8
- [VISUALISATION] Future you opening the door to the thing the savings paid for — [PD]

##### Day 53 — Release dread around financial admin

- [TAPPING] Tapping for "I hate the admin" — MONEY-v2/D53
- [ENERGY_STATEMENT] Admin is intimacy. I treat it that way — MONEY-v2/D53
- [AFFIRMATION] Admin met with calm — MONEY-v2/D53
- [ACTIVITY] One bill-related task with a cup of tea and the candle on — [PD]
- [JOURNAL_PROMPT] What does admin dread say about me — and is it true? — MONEY-Journal/W8
- [VISUALISATION] The inbox empty and the kettle on — [PD]

##### Day 54 — Make generosity part of wealth

- [TAPPING] Tapping for generosity without fear — MONEY-v2/D54
- [ENERGY_STATEMENT] Giving and receiving are the same river — MONEY-v2/D54
- [AFFIRMATION] Generosity feels good in my body — MONEY-v2/D54
- [ACTIVITY] Buy a coffee for someone in the queue this week — [PD]
- [JOURNAL_PROMPT] What generosity would feel right at my current level? — MONEY-Journal/W8
- [VISUALISATION] Money moving outwards and returning — [PD]

##### Day 55 — Feel proud of organised finances

- [TAPPING] Tapping for pride in organised money — MONEY-v2/D55
- [ENERGY_STATEMENT] Organised money is who I am now — MONEY-v2/D55
- [AFFIRMATION] My money is organised. I am proud of it — MONEY-v2/D55
- [JOURNAL_PROMPT] One area where my money is already tidy — MONEY-Journal/W8
- [VISUALISATION] The drawer where the paperwork lives — calm — [PD]

##### Day 56 — Celebrate daily millionaire habits

- [TAPPING] Tapping for millionaire habits — MONEY-v2/D56
- [ENERGY_STATEMENT] I already live the small habits of the wealthy version of me — MONEY-v2/D56
- [AFFIRMATION] I do the small daily things wealthy women do — MONEY-v2/D56
- [RITUAL] The Wealth Alignment Practice — full ceremony — MONEY-Journal/W8
- [JOURNAL_PROMPT] Three habits the wealthy version of me has that I already have too — MONEY-Journal/W8
- [VISUALISATION] Looking back at the small daily acts that built the empire — [PD]

#### Week 9 — Live in Overflow & Generosity

##### Day 57 — See wealth as endless

- [TAPPING] Tapping for endless wealth — MONEY-v2/D57
- [ENERGY_STATEMENT] Wealth is endless. I draw from the endless — MONEY-v2/D57
- [AFFIRMATION] There is more. There is always more — MONEY-v2/D57
- [JOURNAL_PROMPT] Where do I still think wealth is scarce? — MONEY-Journal/W9
- [VISUALISATION] An ocean — and you drawing one cup, then another, then another — [PD]

##### Day 58 — Give freely without fear

- [TAPPING] Tapping to give without fear — MONEY-v2/D58
- [ENERGY_STATEMENT] Giving doesn't deplete me — MONEY-v2/D58
- [AFFIRMATION] I give from full — MONEY-v2/D58
- [JOURNAL_PROMPT] What am I afraid will happen if I give? — MONEY-Journal/W9
- [VISUALISATION] The bowl that refills as you pour — [PD]

##### Day 59 — Feel joy in circulating money

- [TAPPING] Tapping for joy in spending — MONEY-v2/D59
- [ENERGY_STATEMENT] Spending well is a love note to the world — MONEY-v2/D59
- [AFFIRMATION] Money loves to circulate through me — MONEY-v2/D59
- [ACTIVITY] Pay for one thing today with full attention — touch the money before it leaves — [PD]
- [JOURNAL_PROMPT] One spend this week that felt aligned — MONEY-Journal/W9
- [VISUALISATION] The river of money you are a banks of — [PD]

##### Day 60 — Let abundance ripple through family

- [TAPPING] Tapping for family abundance — MONEY-v2/D60
- [ENERGY_STATEMENT] My abundance lifts the people I love — MONEY-v2/D60
- [AFFIRMATION] My family lives in abundance with me — MONEY-v2/D60
- [JOURNAL_PROMPT] The ripple I want my wealth to make through my family — MONEY-Journal/W9
- [VISUALISATION] The ease your children feel because of what you built — [PD]

##### Day 61 — Anchor belief in constant replenishment

- [TAPPING] Tapping for constant replenishment — MONEY-v2/D61
- [ENERGY_STATEMENT] What goes out comes back. What comes back goes out — MONEY-v2/D61
- [AFFIRMATION] Money replenishes. Always — MONEY-v2/D61
- [JOURNAL_PROMPT] When has money come back to me unexpectedly? — MONEY-Journal/W9
- [VISUALISATION] The well that never runs dry — [PD]

##### Day 62 — Celebrate luxury and simple pleasures together

- [TAPPING] Tapping for luxury alongside simplicity — MONEY-v2/D62
- [ENERGY_STATEMENT] Luxury and simplicity live in the same life — MONEY-v2/D62
- [AFFIRMATION] I get to have both — MONEY-v2/D62
- [ACTIVITY] Eat off the nice plates tonight. For no reason — [PD]
- [JOURNAL_PROMPT] One luxury and one simple thing that bring you the same kind of joy — MONEY-Journal/W9
- [VISUALISATION] The good wine in the everyday glass — [PD]

##### Day 63 — Live daily in the feeling of overflow

- [TAPPING] Tapping to live in overflow — MONEY-v2/D63
- [ENERGY_STATEMENT] Overflow is the air I breathe — MONEY-v2/D63
- [AFFIRMATION] Overflow is my normal — MONEY-v2/D63
- [RITUAL] The Overflow & Circulation Activation — full ceremony — MONEY-Journal/W9
- [JOURNAL_PROMPT] What does daily overflow look like, in the small things? — MONEY-Journal/W9
- [VISUALISATION] The kitchen full, the calendar full, the soul full — [PD]

### Phase 4 — Anchor Abundance & Legacy (Days 64–84)

#### Week 10 — Build Unshakable Money Trust

##### Day 64 — Release all remaining doubts about wealth

- [TAPPING] Tapping for the last doubts — MONEY-v2/D64
- [ENERGY_STATEMENT] I release the last of the doubt — MONEY-v2/D64
- [AFFIRMATION] Doubt is allowed to leave now — MONEY-v2/D64
- [JOURNAL_PROMPT] The last 10% of doubt — what's it made of? — MONEY-Journal/W10
- [VISUALISATION] Watching the last doubt walk to the door — [PD]

##### Day 65 — Trust myself with millions

- [TAPPING] Tapping for self-trust with millions — MONEY-v2/D65
- [ENERGY_STATEMENT] I am trustworthy with great wealth — MONEY-v2/D65
- [AFFIRMATION] I trust me with millions — MONEY-v2/D65
- [JOURNAL_PROMPT] Why am I a good steward of millions? — MONEY-Journal/W10
- [VISUALISATION] The decisions you make at that wealth — wise, considered, kind — [PD]

##### Day 66 — Feel safe as a wealthy person

- [TAPPING] Tapping for safety as a wealthy woman — MONEY-v2/D66
- [ENERGY_STATEMENT] Wealthy is safe — MONEY-v2/D66
- [AFFIRMATION] I am safe to be wealthy — MONEY-v2/D66
- [JOURNAL_PROMPT] Where did "wealthy = unsafe" come from? — MONEY-Journal/W10
- [VISUALISATION] The wealthy version of you, in the world, untouchable in the right way — [PD]

##### Day 67 — Honour money as a neutral, loving tool

- [TAPPING] Tapping to honour money as neutral — MONEY-v2/D67
- [ENERGY_STATEMENT] Money is a tool. It carries my love — MONEY-v2/D67
- [AFFIRMATION] Money is neutral. I direct it — MONEY-v2/D67
- [JOURNAL_PROMPT] What does money want to be used for in my life? — MONEY-Journal/W10
- [VISUALISATION] Money as a kind animal, waiting to be asked where to go — [PD]
- [READING] Money is morally neutral. The story you tell about it is not — [NEW]

##### Day 68 — Keep faith through market ups & downs

- [TAPPING] Tapping for faith through volatility — MONEY-v2/D68
- [ENERGY_STATEMENT] Markets move. My wealth holds — MONEY-v2/D68
- [AFFIRMATION] I stay steady through the swings — MONEY-v2/D68
- [JOURNAL_PROMPT] How do I stay calm when a number drops? — MONEY-Journal/W10
- [VISUALISATION] The deep root of a tree while the branches sway — [PD]

##### Day 69 — Celebrate stable, effortless inflow

- [TAPPING] Tapping for effortless inflow — MONEY-v2/D69
- [ENERGY_STATEMENT] Inflow is constant, steady, effortless — MONEY-v2/D69
- [AFFIRMATION] Inflow finds me without my pushing — MONEY-v2/D69
- [JOURNAL_PROMPT] When has inflow felt easy? — MONEY-Journal/W10
- [VISUALISATION] The wind always at your back — [PD]

##### Day 70 — Anchor lifelong financial ease

- [TAPPING] Tapping for lifelong financial ease — MONEY-v2/D70
- [ENERGY_STATEMENT] Money will be easy for the rest of my life — MONEY-v2/D70
- [AFFIRMATION] Lifelong ease is allowed — MONEY-v2/D70
- [RITUAL] The Trust & Stability Ceremony — full ceremony — MONEY-Journal/W10
- [JOURNAL_PROMPT] What does lifelong financial ease look like at 70? At 80? — MONEY-Journal/W10
- [VISUALISATION] The decades unrolling — and money present, easy, in each one — [PD]

#### Week 11 — Create Generational Wealth Vision

##### Day 71 — Picture my family's future freedom

- [TAPPING] Tapping for family freedom — MONEY-v2/D71
- [ENERGY_STATEMENT] My family lives in freedom because of what I built — MONEY-v2/D71
- [AFFIRMATION] My family is free because I am — MONEY-v2/D71
- [JOURNAL_PROMPT] What does "free" mean for my children's children? — MONEY-Journal/W11
- [VISUALISATION] Your grandchildren's choices, made possible by you — [PD]

##### Day 72 — Trust my ability to build legacy properties

- [TAPPING] Tapping for legacy property building — MONEY-v2/D72
- [ENERGY_STATEMENT] I am building property that lasts beyond me — MONEY-v2/D72
- [AFFIRMATION] I build legacy assets — MONEY-v2/D72
- [JOURNAL_PROMPT] The property I would buy first if I knew it would stay in the family for a century — MONEY-Journal/W11
- [VISUALISATION] The deed with your name on it, becoming the deed with the family's name on it — [PD]

##### Day 73 — Release fear of taxes and inheritance loss

- [TAPPING] Tapping for tax / inheritance fear — MONEY-v2/D73
- [ENERGY_STATEMENT] Tax is part of the system. I plan well — MONEY-v2/D73
- [AFFIRMATION] I am calm about tax. I am calm about inheritance — MONEY-v2/D73
- [JOURNAL_PROMPT] What scares me about tax — and is it actually about tax? — MONEY-Journal/W11
- [VISUALISATION] The advisor who handles this part — calm, on it — [PD]
- [READING] Tax fear is rarely about tax — [NEW]

##### Day 74 — Attract the right advisors and deals

- [TAPPING] Tapping to attract the right advisors — MONEY-v2/D74
- [ENERGY_STATEMENT] The right advisors find me — MONEY-v2/D74
- [AFFIRMATION] My advisors are on my side — MONEY-v2/D74
- [JOURNAL_PROMPT] What does the right advisor relationship feel like? — MONEY-Journal/W11
- [VISUALISATION] The meeting where the right person sits across from you — [PD]

##### Day 75 — Anchor trust in multi-million investments

- [TAPPING] Tapping for trust in big investments — MONEY-v2/D75
- [ENERGY_STATEMENT] I am trusted with big decisions, including by myself — MONEY-v2/D75
- [AFFIRMATION] I am ready to deploy at this scale — MONEY-v2/D75
- [JOURNAL_PROMPT] The investment decision that would have felt mad five years ago — MONEY-Journal/W11
- [VISUALISATION] The line on the contract — your signature, steady — [PD]

##### Day 76 — Celebrate being a wealth steward

- [TAPPING] Tapping to celebrate the steward role — MONEY-v2/D76
- [ENERGY_STATEMENT] I am the steward of this wealth, not its owner — MONEY-v2/D76
- [AFFIRMATION] I am a wise wealth steward — MONEY-v2/D76
- [JOURNAL_PROMPT] What does a wealth steward do that an owner doesn't? — MONEY-Journal/W11
- [VISUALISATION] Tending the wealth like a garden — [PD]

##### Day 77 — Claim a new wealthy family story

- [TAPPING] Tapping to claim the new family story — MONEY-v2/D77
- [ENERGY_STATEMENT] This is the new family money story. It is true now — MONEY-v2/D77
- [AFFIRMATION] In my family, we hold wealth well — MONEY-v2/D77
- [RITUAL] The Legacy Alignment Activation — full ceremony — MONEY-Journal/W11
- [JOURNAL_PROMPT] What does the new family story say at the dinner table? — MONEY-Journal/W11
- [VISUALISATION] The family portrait — the wealth visible, the ease visible — [PD]

#### Week 12 — Live Abundance as My Normal

##### Day 78 — Feel gratitude for present wealth

- [TAPPING] Tapping for present-tense gratitude — MONEY-v2/D78
- [ENERGY_STATEMENT] I am grateful for what is here today — MONEY-v2/D78
- [AFFIRMATION] What is here is already abundant — MONEY-v2/D78
- [JOURNAL_PROMPT] Five things in my life right now that count as wealth — MONEY-Journal/W12
- [VISUALISATION] The home, the cupboard, the bed, the people — all evidence — [PD]

##### Day 79 — Lock in ease around receiving and spending

- [TAPPING] Tapping for ease in receiving and spending — MONEY-v2/D79
- [ENERGY_STATEMENT] Receiving and spending — equally easy — MONEY-v2/D79
- [AFFIRMATION] In and out, easy and clean — MONEY-v2/D79
- [JOURNAL_PROMPT] Which is harder for me — receiving or spending? Why? — MONEY-Journal/W12
- [VISUALISATION] Two equal doors — one in, one out — [PD]

##### Day 80 — Celebrate a daily life of freedom and joy

- [TAPPING] Tapping for daily freedom — MONEY-v2/D80
- [ENERGY_STATEMENT] My day is free. My day is joyful — MONEY-v2/D80
- [AFFIRMATION] Freedom and joy as daily standard — MONEY-v2/D80
- [JOURNAL_PROMPT] The most free hour in my week — MONEY-Journal/W12
- [VISUALISATION] An ordinary Tuesday that feels like the holiday version of you — [PD]

##### Day 81 — See myself as an abundant leader

- [TAPPING] Tapping for "I am an abundant leader" — MONEY-v2/D81
- [ENERGY_STATEMENT] I lead from abundance, not lack — MONEY-v2/D81
- [AFFIRMATION] I lead from full — MONEY-v2/D81
- [JOURNAL_PROMPT] How does an abundant leader make a hard decision? — MONEY-Journal/W12
- [VISUALISATION] You at the head of the table — calm, generous, clear — [PD]

##### Day 82 — Inspire others through my wealth energy

- [TAPPING] Tapping to inspire others through wealth energy — MONEY-v2/D82
- [ENERGY_STATEMENT] My ease is permission for others — MONEY-v2/D82
- [AFFIRMATION] My wealth lifts the room — MONEY-v2/D82
- [JOURNAL_PROMPT] Who in my life would be most freed by my visible wealth? — MONEY-Journal/W12
- [VISUALISATION] The friend whose face lights up at your news — [PD]

##### Day 83 — Commit to continued growth and giving

- [TAPPING] Tapping to commit to growth and giving — MONEY-v2/D83
- [ENERGY_STATEMENT] I will keep growing. I will keep giving — MONEY-v2/D83
- [AFFIRMATION] More room, more reach, more give — MONEY-v2/D83
- [JOURNAL_PROMPT] The next size up — and what I'll give from there — MONEY-Journal/W12
- [VISUALISATION] The growth-and-give cycle at the next level — [PD]

##### Day 84 — Anchor abundance as who I am forever

- [TAPPING] Tapping to anchor abundance forever — MONEY-v2/D84
- [ENERGY_STATEMENT] Abundance is who I am — MONEY-v2/D84
- [AFFIRMATION] Abundant. Forever. As I am — MONEY-v2/D84
- [RITUAL] The Embodiment & Completion Ceremony — full ceremony — MONEY-Journal/W12
- [JOURNAL_PROMPT] The single sentence that names the woman I have become through this — MONEY-Journal/W12
- [VISUALISATION] Looking back from the end of your life — the wealthy woman she was — [PD]
- [READING] What 84 days of money work does (and doesn't do) — [NEW]

### Money — stuck-on points outside the 84-day arc

Each stuck-on below produces 5–9 entries — the same shape used inside the
84-day arc. Sources lean on `Money-Zone/*` and `MONEY-v2/*` cross-refs
plus public-domain expansion.

##### Husband earns; I don't feel autonomous

- [TAPPING] Tapping for "his money isn't my money" — [NEW]
- [ENERGY_STATEMENT] Money in the household is shared. Money in my hands is mine — [NEW]
- [AFFIRMATION] My financial autonomy is mine, regardless of source — [NEW]
- [JOURNAL_PROMPT] Where does the autonomy wobble live in our finances? — [NEW]
- [VISUALISATION] Your own account, your own decisions, his support still here — [NEW]
- [READING] Why autonomy matters even in a happy partnership — [NEW]

##### Money + sex / power taboos

- [TAPPING] Tapping for money, sex, power — the taboo trio — [NEW]
- [ENERGY_STATEMENT] I claim my money and my sexual self at the same time — [NEW]
- [AFFIRMATION] Money and sex are not at war in me — [NEW]
- [JOURNAL_PROMPT] What was I taught about women who have money? About women who own their sex? — [NEW]
- [VISUALISATION] The woman with money and desire — and no apology — [NEW]
- [READING] The cultural pairing of money, sex, and "good women" — [NEW]

##### Money + your kids — what to teach them, what to give them

- [TAPPING] Tapping for "am I spoiling them?" — [NEW]
- [ENERGY_STATEMENT] I give and teach from full — [NEW]
- [AFFIRMATION] My children inherit ease, not anxiety — [NEW]
- [JOURNAL_PROMPT] What did I learn about money before age 10? What will my kids? — [NEW]
- [ACTIVITY] One small money conversation with a child this week — [NEW]
- [READING] Teaching children about money without passing on scarcity — [NEW]

##### Money + ageing parents — care, inheritance, supporting them

- [TAPPING] Tapping for the parent-money tangle — [NEW]
- [ENERGY_STATEMENT] I can support them and still be supported — [NEW]
- [AFFIRMATION] I give to my parents from full, not from depletion — [NEW]
- [JOURNAL_PROMPT] The money conversation I haven't had with my parents — [NEW]
- [VISUALISATION] The care conversation, calm — [NEW]
- [READING] When the money flow reverses — supporting your parents — [PD] + [NEW]

##### Pricing your business / value

- [TAPPING] Tapping for "is this too much?" pricing fear — [NEW]
- [ENERGY_STATEMENT] My price reflects my value, not my wobble — [NEW]
- [AFFIRMATION] I price clearly. I price fully — [NEW]
- [ACTIVITY] Write the price you want next to the price you charge. Sit with the gap — [NEW]
- [JOURNAL_PROMPT] What would I charge if I knew nobody would flinch? — [NEW]
- [READING] Pricing as energy, not strategy — [NEW]

##### Asking for raises / rates / fees

- [TAPPING] Tapping for the salary conversation — [NEW]
- [ENERGY_STATEMENT] I ask for what I am worth, plainly — [NEW]
- [AFFIRMATION] I ask without apology — [NEW]
- [ACTIVITY] Rehearse the ask in the mirror, three times — [PD]
- [JOURNAL_PROMPT] The number I am most afraid to say out loud — [NEW]
- [VISUALISATION] The conversation, with the "yes" already in the room — [NEW]

##### The Lottery / windfall fantasy

- [TAPPING] Tapping for the windfall fantasy — [NEW]
- [ENERGY_STATEMENT] I don't need rescue. The work is the wealth — [NEW]
- [AFFIRMATION] My money comes through me, not to me by accident — [NEW]
- [JOURNAL_PROMPT] What does my Lottery fantasy say I want? — [NEW]
- [READING] The Lottery fantasy as a scarcity tell — [NEW]

##### "People would judge me for being rich"

- [TAPPING] Tapping for the fear of being judged for wealth — [NEW]
- [ENERGY_STATEMENT] Their judgment is not my responsibility — [NEW]
- [AFFIRMATION] I let them think what they think — [NEW]
- [JOURNAL_PROMPT] Whose specific judgment am I bracing for? — [NEW]
- [VISUALISATION] The person whose judgment scares you — and their judgment landing nowhere — [NEW]

##### Spouse-money disagreements

- [TAPPING] Tapping for the money fight on repeat — [NEW]
- [ENERGY_STATEMENT] We are on the same team about the money — [NEW]
- [AFFIRMATION] We figure money out together — [NEW]
- [JOURNAL_PROMPT] What is the money fight actually about? — [NEW]
- [ACTIVITY] The Sunday money date — as a couple — [NEW]
- [READING] When money fights aren't about money — [PD] + [NEW]

##### Receiving money you didn't earn (inheritance, gift, win)

- [TAPPING] Tapping for the unearned money — [NEW]
- [ENERGY_STATEMENT] I am allowed to receive what I did not earn — [NEW]
- [AFFIRMATION] This is mine to hold — [NEW]
- [JOURNAL_PROMPT] What does my guilt about this say about my worthiness story? — [NEW]
- [VISUALISATION] The gift settling, becoming yours — [NEW]
- [READING] The complicated grief of inheritance — [PD] + [NEW]

##### Investments — feeling "not for me"

- [TAPPING] Tapping for "investing isn't for me" — [NEW]
- [ENERGY_STATEMENT] I am allowed in the room where the investments are decided — [NEW]
- [AFFIRMATION] I am an investor in training. I am an investor — [NEW]
- [ACTIVITY] Open one investment article and read it through — [NEW]
- [JOURNAL_PROMPT] Who told me investing wasn't for women like me? — [NEW]
- [READING] The investing-isn't-for-me lie, and where it came from — [NEW]

##### Other women's success triggering you

- [TAPPING] Tapping for the trigger of her win — [NEW]
- [ENERGY_STATEMENT] Her win is evidence — not threat — MONEY-v2/D16-adjacent
- [AFFIRMATION] Her wealth is proof, not theft — [NEW]
- [JOURNAL_PROMPT] Whose success do I struggle to celebrate? Why? — [NEW]
- [VISUALISATION] Her win on the table beside yours — both real — [NEW]
- [READING] When women trigger each other about money — [NEW]

### Money — long-form reading entries

- [READING] The Money Zone method — what it is and how it works — Money-Zone/Ch1
- [READING] The Zone, the Sway, Allowing, Releasing — Rebecca's four anchors — Money-Zone/Ch2
- [READING] Why "earn more" doesn't fix money problems — [NEW]
- [READING] How wealth identity gets built — and why most adults stop at "comfortable" — [NEW]
- [READING] The 84-day arc in `MONEY-v2` — what it does and what it doesn't — [NEW]
- [READING] Money and the nervous system — why panic precedes accounts — [PD] + [NEW]
- [READING] The feast-and-famine cycle and how to widen the floor — [NEW]
- [READING] The "if I had more money I would" trap — [NEW]
- [READING] Money + therapy — when to do which work — [NEW]
- [READING] Money + medication / illness — when wealth work isn't the answer — [PD] + [NEW]
- [READING] Why generational wealth feels like betrayal until it doesn't — [NEW]
- [READING] How to talk to your partner about money without it becoming a fight — [PD] + [NEW]
- [READING] The "I don't deserve" tax on every receiving moment — [NEW]
- [READING] What ancestor work means in the money context — [PD]
- [READING] The reading list for the next layer of money work — [NEW]

### Money — 12 named ceremonies (standalone library entries)

Each is its own library row of `practiceType = RITUAL`. The 84-day arc
references these weekly; they also stand alone.

- [RITUAL] The Calm & Safe Money Reset — Week 1 anchor — MONEY-Journal/W1
- [RITUAL] The Ancestral Release & Wealth Lineage Activation — Week 2 — MONEY-Journal/W2
- [RITUAL] The Safety & Stability Activation — Week 3 — MONEY-Journal/W3
- [RITUAL] The Wealth Identity Embodiment — Week 4 — MONEY-Journal/W4
- [RITUAL] The Infinite Flow Activation — Week 5 — MONEY-Journal/W5
- [RITUAL] The Overflow Anchoring Ceremony — Week 6 — MONEY-Journal/W6
- [RITUAL] The Inspired Opportunity Activation — Week 7 — MONEY-Journal/W7
- [RITUAL] The Wealth Alignment Practice — Week 8 — MONEY-Journal/W8
- [RITUAL] The Overflow & Circulation Activation — Week 9 — MONEY-Journal/W9
- [RITUAL] The Trust & Stability Ceremony — Week 10 — MONEY-Journal/W10
- [RITUAL] The Legacy Alignment Activation — Week 11 — MONEY-Journal/W11
- [RITUAL] The Embodiment & Completion Ceremony — Week 12 — MONEY-Journal/W12

### Money — beginner intros + entry points

- [READING] Where to start with money work — five entry points by what's pressing today — [NEW]
- [TAPPING] First tapping script — three minutes, no jargon — [NEW]
- [ENERGY_STATEMENT] Five money-aligned statements that don't sound mad out loud — [NEW]
- [JOURNAL_PROMPT] The money question you've been avoiding — [NEW]
- [RITUAL] The two-minute money minute — daily, doable — [NEW]
- [READING] How to know when you've hit a money block (vs a money fact) — [NEW]

---

## 2. Sleep & rest

30-day arc from `SLEEP-v2` plus stuck-on points the book doesn't cover
(new-parent deprivation, snoring partner, perimenopause sleep changes,
3am wake, jet lag) plus public-domain expansion (sleep hygiene,
body-scan variants, breathwork techniques, sleep science). ~290 entries.

Sleep leans toward fewer practice types per day than Money — tapping,
visualisation, meditation, ritual, journal prompt is the typical spread.
Spells and activities appear for specific days where they fit (sleep
amulet, sage clearing the bedroom).

### The 30-day arc

##### Day 1 — Begin the reset

- [TAPPING] Tapping to begin the 30-day sleep reset — SLEEP-v2/D1
- [MEDITATION] Three-breath landing — for the start of the practice — [PD]
- [VISUALISATION] The reset switch — small and clean — [PD]
- [JOURNAL_PROMPT] What does my sleep currently look like — and what I want it to look like in 30 days — [NEW]
- [RITUAL] The 30-day sleep reset — opening ritual on night one — [NEW]

##### Day 2 — Calm the racing mind

- [TAPPING] Tapping for the 11pm racing mind — SLEEP-v2/D2
- [VISUALISATION] Each thought a leaf on a river — [PD]
- [MEDITATION] Four-count breath — body slowing — [PD]
- [JOURNAL_PROMPT] Empty the head onto the page — three minutes before bed — [PD]
- [AFFIRMATION] My mind is allowed to stop tonight — SLEEP-v2/D2

##### Day 3 — Calm the body

- [TAPPING] Tapping for body-level wired — SLEEP-v2/D3
- [MEDITATION] Body scan from feet to crown — [PD]
- [VISUALISATION] Each muscle softening one by one — [PD]
- [RITUAL] The legs-up-the-wall five minutes before bed — [PD]
- [AFFIRMATION] My body is allowed to fall — SLEEP-v2/D3

##### Day 4 — Let go of control

- [TAPPING] Tapping for the need to control the night — SLEEP-v2/D4
- [ENERGY_STATEMENT] Sleep is not something I do. It happens to me — SLEEP-v2/D4
- [JOURNAL_PROMPT] What am I trying to control about sleep? — SLEEP-v2/D4
- [VISUALISATION] Setting down the controls — and the lights dim themselves — [PD]
- [MEDITATION] Surrender breath — exhale longer than inhale — [PD]

##### Day 5 — Feel safe in stillness

- [TAPPING] Tapping for safety in stillness — SLEEP-v2/D5
- [AFFIRMATION] Stillness is safe. I am safe — SLEEP-v2/D5
- [MEDITATION] Just-this-room awareness — five minutes — [PD]
- [JOURNAL_PROMPT] Where did "I have to keep moving" come from? — SLEEP-v2/D5
- [VISUALISATION] A still pond — and you allowed to be the surface — [PD]

##### Day 6 — Ease emotional overload

- [TAPPING] Tapping for emotional overload at bedtime — SLEEP-v2/D6
- [JOURNAL_PROMPT] What feeling is asking to be heard tonight? — SLEEP-v2/D6
- [VISUALISATION] The feeling acknowledged, the feeling at rest — [PD]
- [MEDITATION] Hand on heart — naming what's there — [PD]
- [RITUAL] The five-minute evening download — feelings on the page — [PD]

##### Day 7 — Unhook from busyness

- [TAPPING] Tapping for the busy mind unhooking — SLEEP-v2/D7
- [AFFIRMATION] I am allowed to stop, even if not everything is done — SLEEP-v2/D7
- [JOURNAL_PROMPT] What can wait until tomorrow? — SLEEP-v2/D7
- [VISUALISATION] The to-do list parked outside the bedroom door — [PD]
- [ACTIVITY] Write tomorrow's three priorities, close the notebook — [PD]

##### Day 8 — Ground in the present moment

- [TAPPING] Tapping to come back to now — SLEEP-v2/D8
- [MEDITATION] Five things you can feel, four you can hear — [PD]
- [VISUALISATION] The bed under you, the room around you, the night holding you — [PD]
- [AFFIRMATION] Right now is enough — SLEEP-v2/D8
- [JOURNAL_PROMPT] What is true in this present moment? — SLEEP-v2/D8

##### Day 9 — Soothe the body with breath

- [TAPPING] Tapping for breath-led calm — SLEEP-v2/D9
- [MEDITATION] 4-7-8 breath — four rounds — [PD]
- [MEDITATION] Box breathing — equal sides — [PD]
- [VISUALISATION] The breath as a wave settling sand — [PD]
- [READING] The science of slow breathing for sleep — [PD]

##### Day 10 — Anchor calm as the new normal

- [TAPPING] Tapping to anchor calm as the default — SLEEP-v2/D10
- [AFFIRMATION] Calm is who I am at night — SLEEP-v2/D10
- [RITUAL] The calm anchor — same evening cue for 30 days — [NEW]
- [JOURNAL_PROMPT] What does "I'm a person who sleeps well" feel like? — SLEEP-v2/D10
- [VISUALISATION] Future you, asleep within minutes, easy — [PD]

##### Day 11 — Heal the "I can't sleep" story

- [TAPPING] Tapping for "I never sleep" — SLEEP-v2/D11
- [JOURNAL_PROMPT] When did the story start? Whose story is it? — SLEEP-v2/D11
- [AFFIRMATION] I am rewriting my sleep story — SLEEP-v2/D11
- [VISUALISATION] Crossing out the old story; writing the new one — [PD]
- [READING] The "I'm a bad sleeper" identity and how it self-fulfils — [PD] + [NEW]

##### Day 12 — Release fear of the night

- [TAPPING] Tapping for fear of the night — SLEEP-v2/D12
- [AFFIRMATION] The night is safe — SLEEP-v2/D12
- [JOURNAL_PROMPT] What in the dark do I think I have to guard against? — SLEEP-v2/D12
- [VISUALISATION] The dark as a soft blanket, not a threat — [PD]
- [RITUAL] The bedside salt bowl — a folk-protection anchor — [PD]

##### Day 13 — Let go of guilt for rest

- [TAPPING] Tapping to release rest guilt — SLEEP-v2/D13
- [AFFIRMATION] Rest is not laziness — SLEEP-v2/D13
- [JOURNAL_PROMPT] Where did "resting is wasting time" come from? — SLEEP-v2/D13
- [READING] Rest as resistance — the case for sleep as an act, not a passive state — [PD] + [NEW]
- [VISUALISATION] A peaceful rebellion — choosing the bed over the to-do list — [PD]

##### Day 14 — Unwind mental loops

- [TAPPING] Tapping for 3am thought-loops — SLEEP-v2/D14
- [VISUALISATION] Each loop as a thread you set down — [PD]
- [MEDITATION] Noting practice — "thinking, thinking" — [PD]
- [JOURNAL_PROMPT] The loop that visits you most — what is it actually asking? — SLEEP-v2/D14
- [AFFIRMATION] I let this thought through without grabbing it — SLEEP-v2/D14

##### Day 15 — Recode the stress response

- [TAPPING] Tapping to recode the bedtime stress response — SLEEP-v2/D15
- [READING] How the nervous system learns "bed = unsafe" and how to unlearn it — [PD] + [NEW]
- [MEDITATION] Long exhale practice — six rounds — [PD]
- [VISUALISATION] The vagus nerve as a calm rope down your spine — [PD]
- [AFFIRMATION] My body has learned to relax here — SLEEP-v2/D15

##### Day 16 — Forgive the sleepless past

- [TAPPING] Tapping to forgive the bad sleep years — SLEEP-v2/D16
- [JOURNAL_PROMPT] What does the sleepless version of me deserve to hear? — SLEEP-v2/D16
- [AFFIRMATION] I forgive the years I didn't sleep — SLEEP-v2/D16
- [VISUALISATION] Sitting with the exhausted past version of you — kindly — [PD]
- [READING] When the sleepless years leave a mark, and how to soften it — [NEW]

##### Day 17 — Trust my body again

- [TAPPING] Tapping for "I trust my body to sleep" — SLEEP-v2/D17
- [AFFIRMATION] My body knows how to sleep — SLEEP-v2/D17
- [MEDITATION] Body-trust scan — checking in with each part — [PD]
- [JOURNAL_PROMPT] When did I last trust my body fully? — SLEEP-v2/D17
- [VISUALISATION] The body's quiet competence — happening without you — [PD]

##### Day 18 — Feel safe switching off

- [TAPPING] Tapping for "safe to switch off" — SLEEP-v2/D18
- [AFFIRMATION] Safe to stop. Safe to switch off — SLEEP-v2/D18
- [JOURNAL_PROMPT] What am I afraid will happen if I'm not vigilant? — SLEEP-v2/D18
- [VISUALISATION] The switch flicking off — and the room continuing to be safe — [PD]

##### Day 19 — Accept stillness without fear

- [TAPPING] Tapping for stillness without dread — SLEEP-v2/D19
- [MEDITATION] Five minutes of doing nothing — eyes closed — [PD]
- [AFFIRMATION] I am allowed to do nothing here — SLEEP-v2/D19
- [VISUALISATION] The pause between in-breath and out-breath — and you welcoming it — [PD]

##### Day 20 — Redefine my sleep identity

- [TAPPING] Tapping for the new sleep identity — SLEEP-v2/D20
- [AFFIRMATION] I am a person who sleeps well — SLEEP-v2/D20
- [JOURNAL_PROMPT] What sentence describes who I am as a sleeper now? — SLEEP-v2/D20
- [VISUALISATION] Telling a friend "I sleep well now" — easily — [PD]
- [READING] How to rewrite the sleep identity in a way that sticks — [NEW]

##### Day 21 — Let calm lead the morning

- [TAPPING] Tapping for the calm morning rise — SLEEP-v2/D21
- [RITUAL] The slow rise — feet on floor, three breaths before phone — [PD]
- [AFFIRMATION] I rise calm — SLEEP-v2/D21
- [VISUALISATION] The morning unfurling at a slow tempo — [PD]
- [JOURNAL_PROMPT] What makes mornings hard? What would make them softer? — SLEEP-v2/D21

##### Day 22 — Stop trying so hard to sleep

- [TAPPING] Tapping for the trying-too-hard paradox — SLEEP-v2/D22
- [AFFIRMATION] Sleep comes when I stop chasing it — SLEEP-v2/D22
- [READING] Why effort blocks sleep — the paradox of trying — [PD] + [NEW]
- [VISUALISATION] Hands open, not gripping — [PD]
- [JOURNAL_PROMPT] What am I gripping about my sleep? — SLEEP-v2/D22

##### Day 23 — Work with my body, not against it

- [TAPPING] Tapping to work with the body — SLEEP-v2/D23
- [JOURNAL_PROMPT] What is my body telling me about its rhythms? — SLEEP-v2/D23
- [AFFIRMATION] My body and I are on the same team — SLEEP-v2/D23
- [READING] Circadian basics for women in their 40s — [PD]
- [RITUAL] Morning light for ten minutes — circadian anchor — [PD]

##### Day 24 — Let joy soften the system

- [TAPPING] Tapping for joy that softens the body — SLEEP-v2/D24
- [AFFIRMATION] Joy is allowed to be medicine — SLEEP-v2/D24
- [JOURNAL_PROMPT] What small joy did today bring? — SLEEP-v2/D24
- [VISUALISATION] Joy as warm honey down the spine — [PD]
- [ACTIVITY] One pleasure before bed — proper pleasure, three minutes — [PD]

##### Day 25 — Make calm a habit

- [TAPPING] Tapping for the calm habit — SLEEP-v2/D25
- [RITUAL] The same five steps every night — for 30 nights — [NEW]
- [AFFIRMATION] Calm is becoming automatic — SLEEP-v2/D25
- [JOURNAL_PROMPT] Which evening cues already work for me? — SLEEP-v2/D25
- [READING] Habit stacking for the bedtime routine — [PD]

##### Day 26 — Feel rested without guilt

- [TAPPING] Tapping for guilt-free rest — SLEEP-v2/D26
- [AFFIRMATION] Rested is allowed — SLEEP-v2/D26
- [JOURNAL_PROMPT] What does "I'm rested" allow me to do well? — SLEEP-v2/D26
- [VISUALISATION] You — visibly rested — and proud — [PD]

##### Day 27 — Sleep as connection, not escape

- [TAPPING] Tapping for sleep as connection — SLEEP-v2/D27
- [AFFIRMATION] I sleep to meet myself — SLEEP-v2/D27
- [READING] Sleep as a relationship with yourself — [NEW]
- [JOURNAL_PROMPT] What kind of relationship do I have with sleep? — SLEEP-v2/D27
- [VISUALISATION] Going to bed like meeting a friend — [PD]

##### Day 28 — Trust rest as stability

- [TAPPING] Tapping for rest as stability — SLEEP-v2/D28
- [AFFIRMATION] Rest is steady ground — SLEEP-v2/D28
- [JOURNAL_PROMPT] What does rest let me build? — SLEEP-v2/D28
- [VISUALISATION] Rest as the foundation; everything else built on it — [PD]

##### Day 29 — End the battle with sleep

- [TAPPING] Tapping to end the battle — SLEEP-v2/D29
- [JOURNAL_PROMPT] What does the white flag with sleep look like? — SLEEP-v2/D29
- [AFFIRMATION] The battle is over. I am here for the truce — SLEEP-v2/D29
- [VISUALISATION] Sleep and you — on the same side of the room — [PD]
- [RITUAL] The truce ritual — laying down the fight, bedside — [NEW]

##### Day 30 — Claim rest as my birthright

- [TAPPING] Tapping to claim rest as birthright — SLEEP-v2/D30
- [AFFIRMATION] Rest is my birthright — SLEEP-v2/D30
- [JOURNAL_PROMPT] What does claiming rest say about who I am now? — SLEEP-v2/D30
- [RITUAL] The 30-day completion ceremony — bedside, with the candle — [NEW]
- [READING] Looking back at the 30 days — what shifts to notice — [NEW]

### Sleep — stuck-on points outside the 30-day arc

##### New-parent sleep deprivation

- [TAPPING] Tapping for the new-parent sleep grief — [NEW]
- [AFFIRMATION] My sleep will return. I am not broken — [NEW]
- [JOURNAL_PROMPT] What does my body need that the night is asking me to ignore? — [NEW]
- [READING] Surviving (not optimising) sleep in the baby year — [PD] + [NEW]
- [RITUAL] The 20-minute restorative — a substitute for missed sleep — [PD]

##### Snoring partner / pet disturbances

- [TAPPING] Tapping for the partner-noise rage — [NEW]
- [JOURNAL_PROMPT] What's underneath the rage about the noise? — [NEW]
- [READING] Sleep divorce — when separate beds are an act of love — [PD]
- [ACTIVITY] Earplug rotation, white-noise app, separate bed once a week — [PD]
- [VISUALISATION] The noise outside the bubble of your sleep — [PD]

##### Perimenopause / menopause sleep changes

- [TAPPING] Tapping for the 3am hormone wake — [PD] + [NEW]
- [READING] Why perimenopause hits sleep — and what helps — [PD]
- [RITUAL] The cooled-pillow protocol — [PD]
- [AFFIRMATION] My changing sleep is not my failure — [NEW]
- [JOURNAL_PROMPT] What is this season of my body asking of my nights? — [NEW]

##### Anxiety dreams / nightmares

- [TAPPING] Tapping for the recurring nightmare — [PD] + [NEW]
- [READING] Image rehearsal therapy — rewriting nightmares while awake — [PD]
- [JOURNAL_PROMPT] What is the nightmare trying to tell me? — [PD]
- [VISUALISATION] Rewriting the ending while awake — [PD]
- [RITUAL] The dream-clearing bath — bedtime — [PD]

##### Sleep maintenance — waking at 3am

- [TAPPING] Tapping for the 3am wake — [PD] + [NEW]
- [READING] What 3am waking usually means — [PD]
- [MEDITATION] The 3am body scan — slow and accepting — [PD]
- [AFFIRMATION] If I'm awake I am awake. The rest will come — [NEW]
- [RITUAL] The 3am routine — don't pick up the phone — [PD]

##### Travel / jet lag

- [TAPPING] Tapping for the jet-lag spiral — [PD] + [NEW]
- [READING] Light, food, exercise — the jet-lag triangle — [PD]
- [RITUAL] Land in the new time zone — three behavioural moves — [PD]
- [VISUALISATION] Your body clock turning to the new hour — [PD]

##### Sleep in a new home

- [TAPPING] Tapping for the new-bedroom unease — [NEW]
- [JOURNAL_PROMPT] What does this room need to feel like yours? — [NEW]
- [RITUAL] The bedroom-blessing — settling-in ceremony — [PD]
- [AFFIRMATION] This room is mine, and the sleep here is mine — [NEW]

##### Sleep after a hard day with the kids

- [TAPPING] Tapping for the touched-out evening — [NEW]
- [JOURNAL_PROMPT] What part of me needs tending before sleep? — [NEW]
- [RITUAL] The 10-minute reclaim — solitude before bed — [NEW]
- [ACTIVITY] Long shower or bath with the door locked — [PD]

##### Sleep when worried about money

- [TAPPING] Tapping for money-worry insomnia — cross-tag MONEY — [NEW]
- [JOURNAL_PROMPT] What money worry is loudest at 11pm? — [NEW]
- [AFFIRMATION] Tonight, the money rests too — [NEW]
- [VISUALISATION] The money worry parked in tomorrow's lap, not tonight's — [NEW]

##### Sleep when grieving

- [TAPPING] Tapping for the grief-broken sleep — cross-tag GRIEF — [NEW]
- [READING] Why grief disrupts sleep — and what counts as okay — [PD]
- [AFFIRMATION] Even on the broken nights, I am whole — [NEW]
- [JOURNAL_PROMPT] A letter to the one I miss, before lights out — [PD]

##### Sleep through illness / pain

- [TAPPING] Tapping for the pain-disturbed night — cross-tag HEALTH — [NEW]
- [READING] Sleep when the body hurts — [PD]
- [MEDITATION] Body scan that accepts pain — [PD]
- [AFFIRMATION] Some of me sleeps, even when some of me hurts — [NEW]

##### Daytime tiredness despite "enough" sleep

- [TAPPING] Tapping for tired-but-slept — [NEW]
- [READING] When the tired isn't sleep tired — [PD]
- [JOURNAL_PROMPT] What is the tiredness made of? — [NEW]
- [AFFIRMATION] My energy will return as my body asks for what it needs — [NEW]

##### Fear of not sleeping enough before a big day

- [TAPPING] Tapping for the night-before-big-day fear — [NEW]
- [AFFIRMATION] Even an imperfect night still works — [NEW]
- [JOURNAL_PROMPT] What if I do this on less sleep — would I still be okay? — [NEW]
- [VISUALISATION] Tomorrow going well anyway — [PD]

##### Working shifts / odd hours

- [TAPPING] Tapping for shift-work sleep — [PD] + [NEW]
- [READING] Shift-work sleep hygiene — [PD]
- [RITUAL] The cave routine — daytime sleep done well — [PD]

##### Co-sleeping decisions

- [TAPPING] Tapping for the co-sleeping wobble — [NEW]
- [JOURNAL_PROMPT] What does this choice serve in our family right now? — [NEW]
- [READING] Co-sleeping safely vs not at all — [PD]
- [AFFIRMATION] We choose what fits our family — [NEW]

### Sleep — reading entries

- [READING] Why sleep is the foundation of every other mindset practice — [PD] + [NEW]
- [READING] The "I'm a bad sleeper" identity — how to stop telling it — [NEW]
- [READING] Sleep hygiene, basic version, in plain English — [PD]
- [READING] Caffeine, alcohol, and screens — what to know, what to leave — [PD]
- [READING] The bedroom as a sleep room — small changes — [PD]
- [READING] What 30 days of sleep work can shift (and what it can't) — [NEW]
- [READING] When sleep work isn't enough — when to see a doctor — [PD]
- [READING] Naps — when they help, when they hurt — [PD]
- [READING] The myth of "eight hours" — what the research actually says — [PD]
- [READING] Sleep and weight, sleep and mood, sleep and immunity — the connections — [PD]
- [READING] Sleep across the lifespan — what changes — [PD]
- [READING] The case for slow mornings — [NEW]

---

## 3. Body — weight, beauty, energy, hormones, perimenopause, menopause

84-day arc from `WEIGHT-LOSS-v2` (the Weight sub-category core) plus
sub-categories — Beauty, Energy & vitality, Hormonal & cycle,
Perimenopause, Menopause, Post-menopause, Pregnancy & postpartum,
Sexuality & desire, Movement & joy, Chronic illness & pain. ~1,000
entries at full depth.

Body leans heavy on tapping (84 from the book alone), embodiment (mirror
work, body acknowledgement, sensory practices), rituals (morning beauty,
evening winddown, dressing-for, perfume anchor), affirmations, journal
prompts. Spells appear sparingly (body-worship mirror ritual; sacred-bath
self-anointing). Readings on body science, body-neutrality, hormonal
basics.

### Weight — Phase 1: Calm the Stress & Stop the Panic (Days 1–21)

#### Week 1 — Settle the Nervous System

##### Day 1 — Calm stress & accept where I am

- [TAPPING] Tapping to calm body-stress and accept now — WEIGHT-LOSS-v2/D1
- [ENERGY_STATEMENT] I begin from where I am, not where I should be — WEIGHT-LOSS-v2/D1
- [AFFIRMATION] Today, my body is allowed to be exactly as it is — WEIGHT-LOSS-v2/D1
- [EMBODIMENT] Hand on belly, hand on heart, three rounds of breath — [PD]
- [JOURNAL_PROMPT] What does my body want me to know today? — WEIGHT-LOSS-v2/D1
- [READING] Why "where you are" is the only starting place that works — [NEW]

##### Day 2 — Release the urge to fix everything fast

- [TAPPING] Tapping for the urge to fix it all this week — WEIGHT-LOSS-v2/D2
- [AFFIRMATION] My body is not a project to finish — WEIGHT-LOSS-v2/D2
- [JOURNAL_PROMPT] Where did "fast and now" come from? — WEIGHT-LOSS-v2/D2
- [VISUALISATION] The slow road, with you walking calmly down it — [PD]
- [READING] Why fast change rarely sticks — [PD] + [NEW]

##### Day 3 — Breathe away overwhelm

- [TAPPING] Tapping for body-overwhelm — WEIGHT-LOSS-v2/D3
- [MEDITATION] Long exhale, six rounds — [PD]
- [VISUALISATION] The overwhelm leaving with the breath — [PD]
- [EMBODIMENT] Slow stretch — three movements, three minutes — [PD]
- [AFFIRMATION] My body knows how to settle — WEIGHT-LOSS-v2/D3

##### Day 4 — Let go of diet guilt

- [TAPPING] Tapping for diet guilt — WEIGHT-LOSS-v2/D4
- [AFFIRMATION] Yesterday's food is not today's punishment — WEIGHT-LOSS-v2/D4
- [JOURNAL_PROMPT] Where did "I'm bad if I eat X" come from? — WEIGHT-LOSS-v2/D4
- [VISUALISATION] Setting down the diet rulebook for the day — [PD]
- [READING] Diet guilt is not the same as nutrition — [NEW]

##### Day 5 — Ease evening anxiety

- [TAPPING] Tapping for the evening eating spiral — WEIGHT-LOSS-v2/D5
- [JOURNAL_PROMPT] What does the 9pm version of me actually need? — WEIGHT-LOSS-v2/D5
- [RITUAL] The evening anchor — bath, hot drink, slow exhale — [PD]
- [AFFIRMATION] My evenings are calm — WEIGHT-LOSS-v2/D5
- [VISUALISATION] The evening soft, instead of grasping — [PD]

##### Day 6 — Feel safe in my body

- [TAPPING] Tapping for safety in this body, today — WEIGHT-LOSS-v2/D6
- [AFFIRMATION] My body is a safe place to live — WEIGHT-LOSS-v2/D6
- [EMBODIMENT] Lying flat, hands on hips — five minutes — [PD]
- [JOURNAL_PROMPT] Where in my body do I feel safest? — WEIGHT-LOSS-v2/D6
- [VISUALISATION] The body as home — keys in your hand — [PD]

##### Day 7 — Invite peaceful sleep

- [TAPPING] Tapping for peaceful sleep — body version — WEIGHT-LOSS-v2/D7 (cross SLEEP)
- [RITUAL] The body-down winddown — for full body sleep — [PD]
- [AFFIRMATION] My body is allowed to rest fully — WEIGHT-LOSS-v2/D7
- [VISUALISATION] Each cell quietly resting — [PD]

#### Week 2 — Break the Panic-Diet Loop

##### Day 8 — Release "I must lose weight now" pressure

- [TAPPING] Tapping for the "now or never" weight pressure — WEIGHT-LOSS-v2/D8
- [AFFIRMATION] My body has time. So do I — WEIGHT-LOSS-v2/D8
- [JOURNAL_PROMPT] Who told me it had to be now? — WEIGHT-LOSS-v2/D8
- [VISUALISATION] The clock and the calendar — softening — [PD]

##### Day 9 — Let go of all-or-nothing thinking

- [TAPPING] Tapping for all-or-nothing body — WEIGHT-LOSS-v2/D9
- [AFFIRMATION] Some-of-the-time counts — WEIGHT-LOSS-v2/D9
- [JOURNAL_PROMPT] What does "good enough" with my body look like? — WEIGHT-LOSS-v2/D9
- [READING] The all-or-nothing trap — [PD] + [NEW]
- [VISUALISATION] A wide grey middle, instead of two poles — [PD]

##### Day 10 — Release fear of failure

- [TAPPING] Tapping for fear of failing the body work — WEIGHT-LOSS-v2/D10
- [AFFIRMATION] I am not allowed to fail at being kind to myself — WEIGHT-LOSS-v2/D10
- [JOURNAL_PROMPT] What does "failure" with my body mean — and is that fair? — WEIGHT-LOSS-v2/D10
- [VISUALISATION] The path with room for stumbling — [PD]

##### Day 11 — Stop comparing myself to others

- [TAPPING] Tapping for body comparison — WEIGHT-LOSS-v2/D11
- [AFFIRMATION] Her body is not my measure — WEIGHT-LOSS-v2/D11
- [JOURNAL_PROMPT] Whose body do I compare myself to most? Why? — WEIGHT-LOSS-v2/D11
- [READING] The comparison spiral and how to step out — [PD] + [NEW]
- [ACTIVITY] One unfollow on social this week — [PD]

##### Day 12 — Ease morning scale anxiety

- [TAPPING] Tapping for the morning scale — WEIGHT-LOSS-v2/D12
- [RITUAL] Move the scale out of the bathroom — for a week — [PD]
- [AFFIRMATION] The number is information, not identity — WEIGHT-LOSS-v2/D12
- [JOURNAL_PROMPT] What does the scale number make me feel? Why? — WEIGHT-LOSS-v2/D12
- [READING] What the scale measures (and doesn't) — [PD]

##### Day 13 — Calm "I blew it" thoughts after eating

- [TAPPING] Tapping for the "I blew it" thought — WEIGHT-LOSS-v2/D13
- [AFFIRMATION] One meal doesn't write the day — WEIGHT-LOSS-v2/D13
- [JOURNAL_PROMPT] When have I "blown it" and recovered easily? — WEIGHT-LOSS-v2/D13
- [VISUALISATION] The next meal — neutral, calm — [PD]

##### Day 14 — Trust slow, gentle change

- [TAPPING] Tapping for trust in slow change — WEIGHT-LOSS-v2/D14
- [AFFIRMATION] Slow is a real path — WEIGHT-LOSS-v2/D14
- [JOURNAL_PROMPT] Where has slow change worked for me before? — WEIGHT-LOSS-v2/D14
- [READING] Why slow change is the change that lasts — [PD] + [NEW]
- [VISUALISATION] The slow-grown garden, abundantly real — [PD]

#### Week 3 — Soothe Daily Triggers & Cravings

##### Day 15 — Tap before emotional snacking

- [TAPPING] Tapping before the emotional snack — WEIGHT-LOSS-v2/D15
- [JOURNAL_PROMPT] What feeling is the snack standing in for? — WEIGHT-LOSS-v2/D15
- [VISUALISATION] The pause between the urge and the cupboard — [PD]
- [AFFIRMATION] I get to choose what comforts me — WEIGHT-LOSS-v2/D15

##### Day 16 — Reduce afternoon sugar cravings

- [TAPPING] Tapping for the 3pm sugar pull — WEIGHT-LOSS-v2/D16
- [READING] Why afternoon sugar — physiology + emotion — [PD]
- [ACTIVITY] One alternative ready: protein + tea, on standby — [PD]
- [AFFIRMATION] My 3pm self is allowed to ask for something other than sugar — WEIGHT-LOSS-v2/D16

##### Day 17 — Unwind boredom eating

- [TAPPING] Tapping for boredom eating — WEIGHT-LOSS-v2/D17
- [JOURNAL_PROMPT] What is the boredom actually saying? — WEIGHT-LOSS-v2/D17
- [ACTIVITY] Three boredom-substitutes on a card by the fridge — [PD]
- [AFFIRMATION] My time deserves more than the cupboard — WEIGHT-LOSS-v2/D17

##### Day 18 — Release reward-eating urges

- [TAPPING] Tapping for "I deserve this" eating — WEIGHT-LOSS-v2/D18
- [AFFIRMATION] My reward doesn't have to come through food — WEIGHT-LOSS-v2/D18
- [JOURNAL_PROMPT] What else feels like a reward to me? — WEIGHT-LOSS-v2/D18
- [READING] When eating becomes the only reward — [NEW]

##### Day 19 — Calm weekend overeating

- [TAPPING] Tapping for the weekend slip — WEIGHT-LOSS-v2/D19
- [RITUAL] Saturday morning anchor — a body-kind start — [PD]
- [JOURNAL_PROMPT] What does the weekend become when I'm not "off"? — WEIGHT-LOSS-v2/D19
- [AFFIRMATION] Weekends are not a free fall — WEIGHT-LOSS-v2/D19

##### Day 20 — Handle social-event food pressure

- [TAPPING] Tapping for the event-food anxiety — WEIGHT-LOSS-v2/D20
- [JOURNAL_PROMPT] What do I want my food to feel like at events? — WEIGHT-LOSS-v2/D20
- [AFFIRMATION] I eat as I am at events. Steady — WEIGHT-LOSS-v2/D20
- [VISUALISATION] The buffet table — calm, choosing well — [PD]

##### Day 21 — Celebrate small wins & inner calm

- [TAPPING] Tapping to anchor the wins of week three — WEIGHT-LOSS-v2/D21
- [JOURNAL_PROMPT] Three small wins in the body work so far — WEIGHT-LOSS-v2/D21
- [AFFIRMATION] My progress is real — WEIGHT-LOSS-v2/D21
- [RITUAL] The week-three completion bath — salt + lavender + ten minutes — [PD]

### Weight — Phase 2: Release Emotional & Mental Weight (Days 22–42)

#### Week 4 — Heal Past Hurts

##### Day 22 — Release childhood teasing memories

- [TAPPING] Tapping for childhood body comments — WEIGHT-LOSS-v2/D22
- [JOURNAL_PROMPT] The body comment I still remember from a kid — WEIGHT-LOSS-v2/D22
- [AFFIRMATION] That child didn't deserve what was said. Neither did me-now — WEIGHT-LOSS-v2/D22
- [VISUALISATION] Sitting with the small you who heard it — [PD]

##### Day 23 — Heal hurtful body comments

- [TAPPING] Tapping for adult body comments — WEIGHT-LOSS-v2/D23
- [JOURNAL_PROMPT] The most painful body comment from an adult I trusted — WEIGHT-LOSS-v2/D23
- [AFFIRMATION] What they said is not who I am — WEIGHT-LOSS-v2/D23
- [VISUALISATION] Handing the comment back across the room — [PD]

##### Day 24 — Let go of pregnancy / body-change shame

- [TAPPING] Tapping for the post-pregnancy body shame — WEIGHT-LOSS-v2/D24
- [AFFIRMATION] My body changed for good reasons — WEIGHT-LOSS-v2/D24
- [JOURNAL_PROMPT] What did this body do for me, that left a mark? — WEIGHT-LOSS-v2/D24
- [EMBODIMENT] Tracing the marks with kindness — [PD]
- [READING] The body that changed in motherhood is still your body — [NEW]

##### Day 25 — Forgive early dieting failures

- [TAPPING] Tapping for the dieting years — WEIGHT-LOSS-v2/D25
- [JOURNAL_PROMPT] The diet I most regret. What was I looking for? — WEIGHT-LOSS-v2/D25
- [AFFIRMATION] I forgive the years I dieted. I wasn't broken; I was looking for relief — WEIGHT-LOSS-v2/D25
- [READING] The dieting industry and what it cost women — [PD] + [NEW]

##### Day 26 — Clear "I was never athletic" story

- [TAPPING] Tapping for "I'm not sporty" — WEIGHT-LOSS-v2/D26
- [JOURNAL_PROMPT] Who told me I wasn't athletic? Was it true? — WEIGHT-LOSS-v2/D26
- [AFFIRMATION] My body moves — that's enough — WEIGHT-LOSS-v2/D26
- [ACTIVITY] One move you'd never call exercise — five minutes today — [PD]

##### Day 27 — Release old heartbreak tied to eating

- [TAPPING] Tapping for the heartbreak-eating year — WEIGHT-LOSS-v2/D27
- [JOURNAL_PROMPT] When did the eating become a coping shape? — WEIGHT-LOSS-v2/D27
- [AFFIRMATION] I was loving myself the only way I knew — WEIGHT-LOSS-v2/D27
- [VISUALISATION] The heartbroken version of you — held without the food — [PD]

##### Day 28 — Appreciate how my body protected me

- [TAPPING] Tapping to thank the body for protection — WEIGHT-LOSS-v2/D28
- [AFFIRMATION] My body kept me safe with what it knew — WEIGHT-LOSS-v2/D28
- [JOURNAL_PROMPT] What has my body protected me from? — WEIGHT-LOSS-v2/D28
- [EMBODIMENT] Hands on the protected places — slow, kind — [PD]

#### Week 5 — Uncover Protective Reasons for Weight

##### Day 29 — Explore fear of being seen

- [TAPPING] Tapping for "I don't want to be seen" — WEIGHT-LOSS-v2/D29
- [JOURNAL_PROMPT] Where did "being seen" become unsafe? — WEIGHT-LOSS-v2/D29
- [AFFIRMATION] I get to choose how I'm seen — WEIGHT-LOSS-v2/D29
- [VISUALISATION] Walking into a room and choosing visible — [PD]

##### Day 30 — Release fear of attention or criticism

- [TAPPING] Tapping for fear of attention — WEIGHT-LOSS-v2/D30
- [AFFIRMATION] Attention can be safe — WEIGHT-LOSS-v2/D30
- [JOURNAL_PROMPT] When was attention last actually safe for me? — WEIGHT-LOSS-v2/D30
- [VISUALISATION] Receiving a compliment without flinching — [PD]

##### Day 31 — Let go of "extra weight keeps me safe"

- [TAPPING] Tapping for "the weight is the wall" — WEIGHT-LOSS-v2/D31
- [JOURNAL_PROMPT] What does the weight protect me from? — WEIGHT-LOSS-v2/D31
- [AFFIRMATION] I am safe without the wall — WEIGHT-LOSS-v2/D31
- [READING] When weight is armour — [PD] + [NEW]

##### Day 32 — Ease fear of change

- [TAPPING] Tapping for fear of changing — WEIGHT-LOSS-v2/D32
- [AFFIRMATION] Change is allowed to happen slowly — WEIGHT-LOSS-v2/D32
- [JOURNAL_PROMPT] What scares me about being smaller? Or bigger? Or just different? — WEIGHT-LOSS-v2/D32
- [VISUALISATION] Walking through the change as a slow door — [PD]

##### Day 33 — Allow confidence to grow

- [TAPPING] Tapping to allow growing confidence — WEIGHT-LOSS-v2/D33
- [AFFIRMATION] Confidence is allowed to settle in me — WEIGHT-LOSS-v2/D33
- [JOURNAL_PROMPT] Where has my confidence already grown without me noticing? — WEIGHT-LOSS-v2/D33
- [VISUALISATION] You — walking taller — and the room responding — [PD]

##### Day 34 — Welcome healthy visibility

- [TAPPING] Tapping to welcome visibility — WEIGHT-LOSS-v2/D34
- [AFFIRMATION] I am safe to be seen now — WEIGHT-LOSS-v2/D34
- [EMBODIMENT] Stand in front of the mirror for one full minute. Just stand — [PD]
- [JOURNAL_PROMPT] What does healthy visibility feel like? — WEIGHT-LOSS-v2/D34

##### Day 35 — Trust that safety comes from within

- [TAPPING] Tapping for inner safety — WEIGHT-LOSS-v2/D35
- [AFFIRMATION] My safety is mine, not built from layers — WEIGHT-LOSS-v2/D35
- [MEDITATION] Inner-safety scan — five minutes — [PD]
- [JOURNAL_PROMPT] What are the inner places where I am most safe? — WEIGHT-LOSS-v2/D35

#### Week 6 — Quiet the Inner Critic

##### Day 36 — Release "I'm lazy" belief

- [TAPPING] Tapping for the "I'm lazy" story — WEIGHT-LOSS-v2/D36
- [AFFIRMATION] What I called lazy was often exhausted — WEIGHT-LOSS-v2/D36
- [JOURNAL_PROMPT] Who first called me lazy? Were they right? — WEIGHT-LOSS-v2/D36
- [READING] When "lazy" is the label slapped on burnout — [NEW]

##### Day 37 — Release "I have no willpower" belief

- [TAPPING] Tapping for "no willpower" — WEIGHT-LOSS-v2/D37
- [AFFIRMATION] Willpower isn't the answer; system is — WEIGHT-LOSS-v2/D37
- [JOURNAL_PROMPT] Where have I had real willpower — and underestimated it? — WEIGHT-LOSS-v2/D37
- [READING] Why willpower is the wrong frame — [PD] + [NEW]

##### Day 38 — Release "I'll always be big" belief

- [TAPPING] Tapping to release the always-big story — WEIGHT-LOSS-v2/D38
- [AFFIRMATION] My body can change. So can I — WEIGHT-LOSS-v2/D38
- [JOURNAL_PROMPT] Where did "always" come from? — WEIGHT-LOSS-v2/D38
- [VISUALISATION] The version of you in a different shape — neutrally — [PD]

##### Day 39 — Release "I'm not attractive" belief

- [TAPPING] Tapping for "I'm not attractive" — WEIGHT-LOSS-v2/D39
- [AFFIRMATION] Attractive is broader than I was told — WEIGHT-LOSS-v2/D39
- [JOURNAL_PROMPT] Who taught me what attractive looked like? — WEIGHT-LOSS-v2/D39
- [EMBODIMENT] Look at your face — see what someone who loves you sees — [PD]

##### Day 40 — Release "I can't succeed long-term" belief

- [TAPPING] Tapping for "I always fall off" — WEIGHT-LOSS-v2/D40
- [AFFIRMATION] Long-term is allowed for me — WEIGHT-LOSS-v2/D40
- [JOURNAL_PROMPT] Where have I held a habit for a long time without noticing? — WEIGHT-LOSS-v2/D40
- [READING] What "falling off" actually is, and how to step back in — [NEW]

##### Day 41 — Replace harsh voice with compassion

- [TAPPING] Tapping to soften the inner voice — WEIGHT-LOSS-v2/D41
- [AFFIRMATION] I speak to myself as I would speak to a friend — WEIGHT-LOSS-v2/D41
- [JOURNAL_PROMPT] What does my inner voice say at its harshest? — WEIGHT-LOSS-v2/D41
- [ACTIVITY] Catch one harsh thought today. Rewrite it kindly — [PD]
- [READING] Inner-critic dialogue — the basics — [PD]

##### Day 42 — Honour my body's daily effort

- [TAPPING] Tapping to honour the body's daily work — WEIGHT-LOSS-v2/D42
- [AFFIRMATION] My body works for me, every day, all day — WEIGHT-LOSS-v2/D42
- [JOURNAL_PROMPT] List ten things my body did today, automatically — WEIGHT-LOSS-v2/D42
- [EMBODIMENT] Thanking each body part by name — slowly — [PD]

### Weight — Phase 3: Build Body Love & New Habits (Days 43–63)

#### Week 7 — Body Appreciation & Mirror Confidence

##### Day 43 — Appreciate my legs & mobility

- [TAPPING] Tapping to appreciate the legs — WEIGHT-LOSS-v2/D43
- [AFFIRMATION] My legs carry me through my life — WEIGHT-LOSS-v2/D43
- [EMBODIMENT] Hands on each leg — five things they did this week — [PD]
- [JOURNAL_PROMPT] One thing my legs did today that I take for granted — WEIGHT-LOSS-v2/D43

##### Day 44 — Appreciate my arms & strength

- [TAPPING] Tapping to appreciate the arms — WEIGHT-LOSS-v2/D44
- [AFFIRMATION] My arms hold what matters — WEIGHT-LOSS-v2/D44
- [EMBODIMENT] Tracing each arm with gentle attention — [PD]
- [JOURNAL_PROMPT] What did my arms hold today? — WEIGHT-LOSS-v2/D44

##### Day 45 — Appreciate my stomach & core

- [TAPPING] Tapping to make peace with the belly — WEIGHT-LOSS-v2/D45
- [AFFIRMATION] My belly is allowed to be soft — WEIGHT-LOSS-v2/D45
- [EMBODIMENT] Hands on the belly with compassion, not contraction — [PD]
- [JOURNAL_PROMPT] What does my belly hear from me most often? — WEIGHT-LOSS-v2/D45
- [READING] Why women hate their bellies — and what we can do — [NEW]

##### Day 46 — Appreciate my face & expression

- [TAPPING] Tapping to appreciate the face — WEIGHT-LOSS-v2/D46
- [AFFIRMATION] My face shows what I've lived. I love it for that — WEIGHT-LOSS-v2/D46
- [EMBODIMENT] Smiling at yourself in the mirror, no agenda — [PD]
- [JOURNAL_PROMPT] What does my face do well? — WEIGHT-LOSS-v2/D46

##### Day 47 — Appreciate my skin & sensations

- [TAPPING] Tapping to appreciate the skin — WEIGHT-LOSS-v2/D47
- [AFFIRMATION] My skin feels the world — WEIGHT-LOSS-v2/D47
- [RITUAL] Slow body cream — all the time it takes — [PD]
- [JOURNAL_PROMPT] What did my skin feel today that I forgot to notice? — WEIGHT-LOSS-v2/D47

##### Day 48 — Dress for joy at any size

- [TAPPING] Tapping to dress for the woman I am today — WEIGHT-LOSS-v2/D48
- [ACTIVITY] Put on something you love. Even at home. Today — [PD]
- [AFFIRMATION] I dress for me — WEIGHT-LOSS-v2/D48
- [JOURNAL_PROMPT] What do I love that I haven't worn lately? — WEIGHT-LOSS-v2/D48

##### Day 49 — See beauty in the whole picture

- [TAPPING] Tapping for whole-picture beauty — WEIGHT-LOSS-v2/D49
- [AFFIRMATION] I am beautiful as a whole, not a list of parts — WEIGHT-LOSS-v2/D49
- [JOURNAL_PROMPT] What does whole-picture beauty look like in me? — WEIGHT-LOSS-v2/D49
- [READING] Body neutrality — the alternative to "love every inch" — [PD]

#### Week 8 — Joyful Movement & Nourishment

##### Day 50 — Release exercise-as-punishment mindset

- [TAPPING] Tapping for movement as punishment — WEIGHT-LOSS-v2/D50
- [AFFIRMATION] Movement is something I get to do — WEIGHT-LOSS-v2/D50
- [JOURNAL_PROMPT] Where did "exercise = punishment" come from? — WEIGHT-LOSS-v2/D50
- [READING] Movement-for-joy vs movement-for-shrinking — [PD] + [NEW]

##### Day 51 — Tap into desire for gentle movement

- [TAPPING] Tapping for the desire to move gently — WEIGHT-LOSS-v2/D51
- [ACTIVITY] Ten minutes of a gentle movement you actually enjoy — [PD]
- [AFFIRMATION] Gentle counts — WEIGHT-LOSS-v2/D51
- [JOURNAL_PROMPT] What kind of movement does my body want? — WEIGHT-LOSS-v2/D51

##### Day 52 — Enjoy movement that feels good

- [TAPPING] Tapping for movement that feels good — WEIGHT-LOSS-v2/D52
- [JOURNAL_PROMPT] When was the last time movement felt good in my body? — WEIGHT-LOSS-v2/D52
- [AFFIRMATION] My body knows what movement loves it — WEIGHT-LOSS-v2/D52
- [ACTIVITY] Move to one song fully, no rules — [PD]

##### Day 53 — Release guilt about rest days

- [TAPPING] Tapping for rest-day guilt — WEIGHT-LOSS-v2/D53
- [AFFIRMATION] Rest is part of strength — WEIGHT-LOSS-v2/D53
- [JOURNAL_PROMPT] Why does rest still feel like cheating? — WEIGHT-LOSS-v2/D53
- [READING] Why rest days do more than movement days — [PD]

##### Day 54 — Celebrate my body after moving

- [TAPPING] Tapping for post-move appreciation — WEIGHT-LOSS-v2/D54
- [EMBODIMENT] After moving, lie still for one minute. Thank the body — [PD]
- [AFFIRMATION] My body did it. My body is mine — WEIGHT-LOSS-v2/D54
- [JOURNAL_PROMPT] How does my body feel after moving today? — WEIGHT-LOSS-v2/D54

##### Day 55 — Choose food that loves me back

- [TAPPING] Tapping for food-that-loves-me-back — WEIGHT-LOSS-v2/D55
- [AFFIRMATION] My food gets to be kind to me — WEIGHT-LOSS-v2/D55
- [JOURNAL_PROMPT] What does food that loves me back feel like? — WEIGHT-LOSS-v2/D55
- [READING] Eating for steady energy, not punishment — [PD] + [NEW]

##### Day 56 — Listen to true hunger & fullness

- [TAPPING] Tapping to hear hunger and fullness clearly — WEIGHT-LOSS-v2/D56
- [MEDITATION] Three minutes before eating — body check — [PD]
- [AFFIRMATION] My body knows. I get to listen — WEIGHT-LOSS-v2/D56
- [JOURNAL_PROMPT] Where did I stop trusting my hunger? — WEIGHT-LOSS-v2/D56

#### Week 9 — Pleasure & Self-Care

##### Day 57 — Allow myself to enjoy food without guilt

- [TAPPING] Tapping for guilt-free pleasure with food — WEIGHT-LOSS-v2/D57
- [AFFIRMATION] Food can be pleasure without consequence — WEIGHT-LOSS-v2/D57
- [JOURNAL_PROMPT] When did food become guilty? — WEIGHT-LOSS-v2/D57
- [ACTIVITY] Eat one meal slowly today. Taste it — [PD]

##### Day 58 — Give myself permission to rest

- [TAPPING] Tapping to give myself permission to rest — WEIGHT-LOSS-v2/D58
- [AFFIRMATION] Rest is mine to take — WEIGHT-LOSS-v2/D58
- [ACTIVITY] One nap, one bath, or one half-hour of sitting still — [PD]
- [JOURNAL_PROMPT] What do I need permission to rest for? — WEIGHT-LOSS-v2/D58

##### Day 59 — Welcome compliments with ease

- [TAPPING] Tapping to receive compliments — WEIGHT-LOSS-v2/D59
- [AFFIRMATION] Compliments are gifts. I receive them — WEIGHT-LOSS-v2/D59
- [ACTIVITY] Today, just say "thank you" to one compliment. Don't deflect — [PD]
- [JOURNAL_PROMPT] What's the compliment I'd most like to hear about my body? — WEIGHT-LOSS-v2/D59

##### Day 60 — Create simple daily rituals of pleasure

- [TAPPING] Tapping for daily pleasure — WEIGHT-LOSS-v2/D60
- [RITUAL] One ritual of pleasure, every day — your choice — [NEW]
- [AFFIRMATION] Pleasure is daily, not earned — WEIGHT-LOSS-v2/D60
- [JOURNAL_PROMPT] Three small daily pleasures I'd love — WEIGHT-LOSS-v2/D60

##### Day 61 — Release fear of indulgence

- [TAPPING] Tapping for fear of indulgence — WEIGHT-LOSS-v2/D61
- [AFFIRMATION] Indulgence is a fine word for "enough joy" — WEIGHT-LOSS-v2/D61
- [JOURNAL_PROMPT] What was I taught about women who indulge? — WEIGHT-LOSS-v2/D61
- [READING] When indulgence is the medicine — [NEW]

##### Day 62 — Claim time for myself without guilt

- [TAPPING] Tapping for "I am allowed time" — WEIGHT-LOSS-v2/D62
- [AFFIRMATION] My time is mine to spend — WEIGHT-LOSS-v2/D62
- [ACTIVITY] One hour this week, locked in for you — [PD]
- [JOURNAL_PROMPT] What would I do with a whole hour of mine? — WEIGHT-LOSS-v2/D62

##### Day 63 — Feel worthy of beauty & luxury now

- [TAPPING] Tapping for worthy of beauty and luxury now — WEIGHT-LOSS-v2/D63
- [AFFIRMATION] I am worthy of beauty now — not at a future weight — WEIGHT-LOSS-v2/D63
- [JOURNAL_PROMPT] One luxury that's actually accessible now — WEIGHT-LOSS-v2/D63
- [ACTIVITY] Light the good candle on a Tuesday — [PD]

### Weight — Phase 4: Anchor the New Identity (Days 64–84)

#### Week 10 — Consistency & Daily Rhythm

##### Day 64 — Commit to gentle daily self-care

- [TAPPING] Tapping for daily gentleness — WEIGHT-LOSS-v2/D64
- [AFFIRMATION] Daily kindness is who I am now — WEIGHT-LOSS-v2/D64
- [RITUAL] One small body act every day — [NEW]
- [JOURNAL_PROMPT] What does daily kindness look like in my actual life? — WEIGHT-LOSS-v2/D64

##### Day 65 — Release "I'll fall off track" fear

- [TAPPING] Tapping for "I always fall off" — WEIGHT-LOSS-v2/D65
- [AFFIRMATION] Falling off isn't failing. It's information — WEIGHT-LOSS-v2/D65
- [JOURNAL_PROMPT] What "falling off" stories do I carry? — WEIGHT-LOSS-v2/D65

##### Day 66 — Find calm in my morning routine

- [TAPPING] Tapping for the calm morning — WEIGHT-LOSS-v2/D66
- [RITUAL] The same three morning anchors — every day — [NEW]
- [AFFIRMATION] My mornings are mine — WEIGHT-LOSS-v2/D66
- [JOURNAL_PROMPT] What does my ideal morning feel like? — WEIGHT-LOSS-v2/D66

##### Day 67 — Let go of evening overeating triggers

- [TAPPING] Tapping for the evening trigger — WEIGHT-LOSS-v2/D67
- [JOURNAL_PROMPT] What's the cue that starts the spiral? — WEIGHT-LOSS-v2/D67
- [RITUAL] The evening replacement ritual — different cue, different outcome — [NEW]

##### Day 68 — Celebrate each tiny step

- [TAPPING] Tapping to celebrate the tiny — WEIGHT-LOSS-v2/D68
- [AFFIRMATION] Tiny steps count. They count most — WEIGHT-LOSS-v2/D68
- [JOURNAL_PROMPT] Three tiny things that have already changed — WEIGHT-LOSS-v2/D68

##### Day 69 — Trust my inner guidance

- [TAPPING] Tapping for body intuition — WEIGHT-LOSS-v2/D69
- [AFFIRMATION] I trust what my body says — WEIGHT-LOSS-v2/D69
- [MEDITATION] Five minutes asking the body, "what do you need?" — [PD]
- [JOURNAL_PROMPT] What is my body asking for, even quietly? — WEIGHT-LOSS-v2/D69

##### Day 70 — Honour the body I'm creating

- [TAPPING] Tapping to honour the becoming body — WEIGHT-LOSS-v2/D70
- [AFFIRMATION] I honour what I am becoming — WEIGHT-LOSS-v2/D70
- [JOURNAL_PROMPT] What kind of body am I becoming? — WEIGHT-LOSS-v2/D70

#### Week 11 — Future Self & Vision

##### Day 71 — Meet my future calm, healthy self

- [TAPPING] Tapping to meet the future calm body — WEIGHT-LOSS-v2/D71
- [VISUALISATION] Dinner with the future body — what does she order? — [PD]
- [JOURNAL_PROMPT] Three things future me has, that current me wants — WEIGHT-LOSS-v2/D71

##### Day 72 — Feel the confidence of that future self

- [TAPPING] Tapping for future-self confidence — WEIGHT-LOSS-v2/D72
- [EMBODIMENT] Stand the way she stands. For one minute — [PD]
- [AFFIRMATION] I move through the world the way she does — WEIGHT-LOSS-v2/D72

##### Day 73 — Align my habits with that vision

- [TAPPING] Tapping for habit alignment — WEIGHT-LOSS-v2/D73
- [JOURNAL_PROMPT] Which of my habits already match her? Which don't? — WEIGHT-LOSS-v2/D73
- [AFFIRMATION] My habits are the path to her — WEIGHT-LOSS-v2/D73

##### Day 74 — Welcome an abundant, active life

- [TAPPING] Tapping to welcome the active, abundant life — WEIGHT-LOSS-v2/D74
- [AFFIRMATION] My life is allowed to be abundant and active — WEIGHT-LOSS-v2/D74
- [JOURNAL_PROMPT] What does an abundant, active life look like in my actual life? — WEIGHT-LOSS-v2/D74

##### Day 75 — Trust that my body can keep changing

- [TAPPING] Tapping for trust in continued change — WEIGHT-LOSS-v2/D75
- [AFFIRMATION] My body is not stuck — WEIGHT-LOSS-v2/D75
- [READING] Why bodies change forever — [PD] + [NEW]

##### Day 76 — Radiate joy and body confidence

- [TAPPING] Tapping to radiate body confidence — WEIGHT-LOSS-v2/D76
- [EMBODIMENT] Walk down the hallway tall, today — [PD]
- [AFFIRMATION] Body joy is allowed to be visible — WEIGHT-LOSS-v2/D76

##### Day 77 — Anchor a peaceful food relationship

- [TAPPING] Tapping for the peace at the table — WEIGHT-LOSS-v2/D77
- [AFFIRMATION] My relationship with food is at peace — WEIGHT-LOSS-v2/D77
- [JOURNAL_PROMPT] What does "at peace with food" actually feel like? — WEIGHT-LOSS-v2/D77

#### Week 12 — Gratitude & Integration

##### Day 78 — Thank my body for all it does

- [TAPPING] Tapping to thank the body — WEIGHT-LOSS-v2/D78
- [AFFIRMATION] My body, thank you — WEIGHT-LOSS-v2/D78
- [EMBODIMENT] Hand on each part, "thank you" to each — [PD]

##### Day 79 — Appreciate my mind's growth

- [TAPPING] Tapping to honour the mind's growth — WEIGHT-LOSS-v2/D79
- [JOURNAL_PROMPT] What does my mind know now that it didn't 84 days ago? — WEIGHT-LOSS-v2/D79
- [AFFIRMATION] My mind grew, alongside my body — WEIGHT-LOSS-v2/D79

##### Day 80 — Honour my heart's courage

- [TAPPING] Tapping to honour the heart's work — WEIGHT-LOSS-v2/D80
- [AFFIRMATION] My heart kept going. I see it — WEIGHT-LOSS-v2/D80
- [JOURNAL_PROMPT] What did my heart move through to be here now? — WEIGHT-LOSS-v2/D80

##### Day 81 — Celebrate my new self-talk

- [TAPPING] Tapping for the new self-talk — WEIGHT-LOSS-v2/D81
- [JOURNAL_PROMPT] One phrase I no longer say to myself. One I say now — WEIGHT-LOSS-v2/D81
- [AFFIRMATION] My new voice is becoming the louder one — WEIGHT-LOSS-v2/D81

##### Day 82 — Celebrate my emotional freedom

- [TAPPING] Tapping to celebrate the emotional shifts — WEIGHT-LOSS-v2/D82
- [JOURNAL_PROMPT] What used to spiral that doesn't anymore? — WEIGHT-LOSS-v2/D82
- [AFFIRMATION] I am freer than I was at the start — WEIGHT-LOSS-v2/D82

##### Day 83 — Celebrate my physical changes

- [TAPPING] Tapping to celebrate the body changes — WEIGHT-LOSS-v2/D83
- [AFFIRMATION] My body has shifted, however quietly — WEIGHT-LOSS-v2/D83
- [JOURNAL_PROMPT] Three small body changes I can feel, even if not see — WEIGHT-LOSS-v2/D83

##### Day 84 — Commit to lifelong self-love

- [TAPPING] Tapping to commit lifelong — WEIGHT-LOSS-v2/D84
- [AFFIRMATION] Lifelong self-love is mine — WEIGHT-LOSS-v2/D84
- [RITUAL] The 84-day completion ceremony — bath, candle, journal, and the woman in the mirror — [NEW]
- [READING] What 84 days of body work changes (and what stays your work for life) — [NEW]

### Body — Beauty (sub-category)

##### Going grey — embracing vs colouring vs the in-between

- [TAPPING] Tapping for the grey decision — [NEW]
- [AFFIRMATION] My hair is allowed to be its colour — [NEW]
- [JOURNAL_PROMPT] What would I do if I knew no one would judge me for it? — [NEW]
- [VISUALISATION] You with the natural colour — and your face holding it well — [NEW]
- [READING] The grey transition — practical and emotional — [PD] + [NEW]

##### Hair loss / thinning

- [TAPPING] Tapping for hair-thinning grief — [PD] + [NEW]
- [AFFIRMATION] My hair changes do not change my worth — [NEW]
- [JOURNAL_PROMPT] What does my hair mean to me? Where did that come from? — [NEW]
- [READING] Hair loss in women — what's normal, what to check — [PD]
- [RITUAL] Scalp oil massage — five minutes, weekly — [PD]

##### Wrinkles and lines

- [TAPPING] Tapping for the new wrinkle — [NEW]
- [AFFIRMATION] My face holds the years I've lived — [NEW]
- [EMBODIMENT] Tracing each line in the mirror with kindness — [PD]
- [JOURNAL_PROMPT] What did the laughter line cost? Was it worth it? — [NEW]
- [READING] When wrinkles aren't the problem (the wrinkles-mean-X story is) — [NEW]

##### Skin ageing — what's vanity, what's grief, what's joy

- [TAPPING] Tapping for ageing skin — [NEW]
- [JOURNAL_PROMPT] Which feelings about my skin are vanity, grief, or joy? — [NEW]
- [READING] Skin science basics in mid-life — [PD]
- [AFFIRMATION] My skin is allowed to age — [NEW]
- [RITUAL] The slow oil ritual at night — [PD]

##### The morning beauty ritual as practice

- [TAPPING] Tapping for permission to take time in the morning — [NEW]
- [RITUAL] The 15-minute beauty ritual — slow, devotional — [NEW]
- [AFFIRMATION] Time on my face is time well spent — [NEW]
- [JOURNAL_PROMPT] What does morning beauty time give me besides looking good? — [NEW]

##### Dressing for yourself vs dressing for others

- [TAPPING] Tapping for "what will they think" of the outfit — [NEW]
- [AFFIRMATION] I dress for me, today — [NEW]
- [ACTIVITY] Wear the thing you love. Just because it's Tuesday — [PD]
- [JOURNAL_PROMPT] What would I wear if no one was going to comment? — [NEW]

##### Beauty without buying anything

- [TAPPING] Tapping for the beauty-doesn't-need-buying truth — [NEW]
- [AFFIRMATION] My beauty doesn't depend on the cart — [NEW]
- [JOURNAL_PROMPT] What beauty rituals cost nothing? — [NEW]
- [ACTIVITY] One free beauty act — sun on your face, slow shower, etc. — [PD]

##### Beauty as daily devotional

- [TAPPING] Tapping for beauty as devotion — [NEW]
- [AFFIRMATION] My beauty is a quiet devotion — [NEW]
- [READING] Beauty as a practice, not a product — [NEW]
- [RITUAL] Five minutes at the mirror with the good cream and a candle — [NEW]

### Body — Sexuality & desire (sub-category)

##### Libido changes

- [TAPPING] Tapping for the libido shift — [PD] + [NEW]
- [AFFIRMATION] My desire returns in its own time — [NEW]
- [READING] Why libido changes with hormones, life, motherhood — [PD]
- [JOURNAL_PROMPT] What does my body want, that isn't sex? — [NEW]
- [READING] Spontaneous vs responsive desire — [PD]

##### Desire after children

- [TAPPING] Tapping for desire after kids — [NEW]
- [AFFIRMATION] My desire isn't gone. It's somewhere else — [NEW]
- [JOURNAL_PROMPT] When does desire flicker now? — [NEW]
- [READING] Sex after children — the long redrawing of desire — [PD] + [NEW]

##### Desire after a long marriage

- [TAPPING] Tapping for desire in a long marriage — [NEW]
- [AFFIRMATION] We can find each other again — [NEW]
- [JOURNAL_PROMPT] What does desire look like at our age, with our history? — [NEW]
- [READING] Long-marriage desire — the realistic version — [PD]

##### Body as sensual (not just functional)

- [TAPPING] Tapping for body as sensual — [NEW]
- [AFFIRMATION] My body is sensual, not just useful — [NEW]
- [EMBODIMENT] Body oil — slow, all over, no end goal — [PD]
- [JOURNAL_PROMPT] When did my body become only functional? — [NEW]

##### Reclaiming sexuality post-trauma

- [TAPPING] Tapping for the sexual self post-trauma — [PD] + [NEW]
- [AFFIRMATION] My body is mine, in pleasure and in safety — [NEW]
- [READING] Sexual reclaiming — the gentle, slow path — [PD]
- [JOURNAL_PROMPT] What does safety in pleasure look like for me? — [NEW]

##### Sex and ageing

- [TAPPING] Tapping for sex in mid-life — [NEW]
- [READING] Sex through the decades — what changes, what gets better — [PD]
- [AFFIRMATION] Sex at this age has its own depth — [NEW]
- [JOURNAL_PROMPT] What does sex mean now, vs ten years ago? — [NEW]

### Body — Energy & vitality (sub-category)

##### The afternoon energy crash

- [TAPPING] Tapping for the 3pm crash — cross-tag ENERGY — [NEW]
- [READING] Why the 3pm crash — physiology + habit — [PD]
- [ACTIVITY] One 20-minute reset — air, water, light — [PD]
- [AFFIRMATION] My energy is allowed to dip and return — [NEW]

##### Chronic tiredness — the doctor says nothing's wrong

- [TAPPING] Tapping for "but I'm so tired" — [NEW]
- [READING] When the doctor finds nothing but you're still tired — [PD] + [NEW]
- [JOURNAL_PROMPT] What does the tiredness actually need? — [NEW]
- [AFFIRMATION] My tiredness is real, even when unmeasured — [NEW]

##### Body and burnout

- [TAPPING] Tapping for body-level burnout — [NEW]
- [READING] How burnout lives in the body — [PD]
- [JOURNAL_PROMPT] Where is the burnout sitting in me? — [NEW]
- [RITUAL] The 20-minute restorative — daily, until something shifts — [PD]

##### Energy and hormones

- [TAPPING] Tapping for the energy-and-cycle dance — [NEW]
- [READING] Why women's energy isn't linear — [PD]
- [JOURNAL_PROMPT] What does each phase of my cycle do to my energy? — [PD]

### Body — Cycle / hormonal (pre-perimenopause)

##### Cycle awareness and tracking

- [READING] Cycle 101 — what each phase does — [PD]
- [ACTIVITY] One cycle tracked, on paper or app, for a month — [PD]
- [JOURNAL_PROMPT] How does my mood change across the cycle? — [PD]
- [RITUAL] Day-1 honouring — the start of a new cycle — [PD]

##### PMS and PMDD

- [TAPPING] Tapping for the PMS week — [PD] + [NEW]
- [READING] PMS vs PMDD — the difference, and what to do — [PD]
- [AFFIRMATION] My PMS feelings are real and not me — [NEW]
- [JOURNAL_PROMPT] What does my PMS try to tell me? — [NEW]

##### Periods (heavy, painful, irregular)

- [TAPPING] Tapping for period pain — [PD] + [NEW]
- [READING] When period pain isn't normal — [PD]
- [RITUAL] The period care ritual — hot water, herbal tea, rest — [PD]
- [AFFIRMATION] My body is allowed to slow during this — [NEW]

##### Hormonal contraception side-effects

- [TAPPING] Tapping for the contraception body changes — [NEW]
- [READING] Side-effects worth tracking on contraception — [PD]
- [JOURNAL_PROMPT] What's changed in my body since starting? — [PD]

##### Coming off the pill

- [TAPPING] Tapping for coming-off-the-pill body shifts — [NEW]
- [READING] What to expect coming off — [PD]
- [AFFIRMATION] My body is finding its own rhythm — [NEW]
- [RITUAL] The cycle-return honouring — [PD]

### Body — Perimenopause (sub-category)

The perimenopause cluster — ~30 stuck-on points × 5 practices ≈ 150
entries. Sources: public-domain perimenopause clinical guidelines, the
broader perimenopause literature where principles repeat across many
sources, Rebecca-original framing of how it feels.

##### "Am I going mad" — sudden mood changes

- [TAPPING] Tapping for the perimenopause mood swings — [PD] + [NEW]
- [READING] Why mood changes in perimenopause (the neurotransmitter version) — [PD]
- [AFFIRMATION] I am not mad. I am hormonal — [NEW]
- [JOURNAL_PROMPT] Whose voice tells me I'm "too much"? — [NEW]

##### Anxiety appearing for the first time

- [TAPPING] Tapping for the new perimenopause anxiety — [PD] + [NEW]
- [READING] Why anxiety hits women in their 40s for the first time — [PD]
- [AFFIRMATION] This anxiety is new because my hormones are. Not because I am broken — [NEW]
- [MEDITATION] Long-exhale breath for the new anxiety — [PD]

##### Rage out of nowhere

- [TAPPING] Tapping for perimenopause rage — [PD] + [NEW]
- [READING] Rage as a feature, not a bug, of perimenopause — [PD] + [NEW]
- [JOURNAL_PROMPT] What is the rage actually pointing at? — [NEW]
- [AFFIRMATION] My rage is information. I get to listen — [NEW]

##### Sudden tearfulness

- [TAPPING] Tapping for the unprompted tears — [PD] + [NEW]
- [AFFIRMATION] Tears are allowed to come up unannounced — [NEW]
- [JOURNAL_PROMPT] What is moving in me that wants out as tears? — [NEW]

##### Brain fog / forgetting words

- [TAPPING] Tapping for perimenopause brain fog — [PD] + [NEW]
- [READING] Why brain fog hits in perimenopause — [PD]
- [AFFIRMATION] My brain is changing, not failing — [NEW]
- [ACTIVITY] Write it down — externalise to ease the fog — [PD]

##### The "is this me or my hormones" question

- [TAPPING] Tapping for "is it me or hormones?" — [NEW]
- [JOURNAL_PROMPT] What feels chemical vs what feels real? — [NEW]
- [AFFIRMATION] I can be both — me and hormonal. They're not opposites — [NEW]

##### Cycle becoming unpredictable

- [TAPPING] Tapping for the unpredictable cycle — [PD] + [NEW]
- [READING] What changes in the perimenopause cycle — [PD]
- [AFFIRMATION] My body is in transition. I am allowed to not know — [NEW]
- [RITUAL] The "no-pattern" honouring — letting the calendar surprise you — [NEW]

##### Heavier periods / flooding

- [TAPPING] Tapping for the flooding period — [PD] + [NEW]
- [READING] When heavy periods need medical attention — [PD]
- [RITUAL] The flood-day care ritual — [PD] + [NEW]
- [AFFIRMATION] My body knows how to handle this. I will support it — [NEW]

##### Lighter / skipped periods

- [TAPPING] Tapping for the skipped period — [PD] + [NEW]
- [JOURNAL_PROMPT] What does it feel like when my body skips a beat? — [NEW]
- [AFFIRMATION] Skipped is also normal in this season — [NEW]

##### Sleep disruption — waking at 3am specifically

- [TAPPING] Tapping for the 3am hormone wake — cross-tag SLEEP — [PD] + [NEW]
- [READING] The perimenopause 3am wake explained — [PD]
- [RITUAL] The 3am no-phone routine — [PD]

##### Night sweats

- [TAPPING] Tapping for the night-sweat shame — [PD] + [NEW]
- [READING] Night sweats — physiology + comfort — [PD]
- [RITUAL] The cool-bed routine — fabrics, fans, water — [PD]
- [AFFIRMATION] My body is regulating. The sweats are a sign, not a punishment — [NEW]

##### Hot flushes

- [TAPPING] Tapping for the unexpected hot flush — [PD] + [NEW]
- [READING] Hot flushes — what's happening + what helps — [PD]
- [AFFIRMATION] My body is doing the thing it does. I am safe to ride it — [NEW]
- [ACTIVITY] The five-second cooling reset — [PD]

##### Weight redistribution — the midsection thing

- [TAPPING] Tapping for the new midsection — [PD] + [NEW]
- [READING] Why fat moves to the middle in perimenopause — [PD]
- [AFFIRMATION] My body is rearranging. I get to make peace with it — [NEW]
- [JOURNAL_PROMPT] What does my body want me to know about the change? — [NEW]

##### Joint aches

- [TAPPING] Tapping for the new joint aches — [PD] + [NEW]
- [READING] Why perimenopause hits the joints — [PD]
- [RITUAL] Daily slow movement — [PD]

##### Hair changes

- [TAPPING] Tapping for the hair changing texture / quantity — [PD] + [NEW]
- [READING] Hair in perimenopause — [PD]
- [RITUAL] Scalp oil weekly — [PD]
- [AFFIRMATION] My hair is allowed to change. I am still me — [NEW]

##### Skin changes

- [TAPPING] Tapping for the skin shift — [PD] + [NEW]
- [READING] Perimenopause skin — what changes — [PD]
- [RITUAL] Layered hydration — slow, daily — [PD]

##### Libido drop

- [TAPPING] Tapping for the libido drop — cross-tag SEX — [PD] + [NEW]
- [READING] Hormones, libido, and the perimenopause years — [PD]
- [JOURNAL_PROMPT] What does my body want in pleasure now? — [NEW]

##### Vaginal dryness / discomfort

- [TAPPING] Tapping for the body change "down there" — [PD] + [NEW]
- [READING] Vaginal atrophy — facts, options, no shame — [PD]
- [AFFIRMATION] This is medical, not personal — [NEW]

##### Sex becoming different

- [TAPPING] Tapping for the new sex — [NEW]
- [JOURNAL_PROMPT] What does my body want to keep, change, or stop in our sex life? — [NEW]
- [AFFIRMATION] My sex is allowed to evolve — [NEW]

##### Energy crashes

- [TAPPING] Tapping for the perimenopause energy crash — [PD] + [NEW]
- [READING] Energy in perimenopause — what shifts — [PD]
- [ACTIVITY] The 20-minute window of slow before energy returns — [PD]

##### The "I'm not myself" identity wobble

- [TAPPING] Tapping for the perimenopause identity wobble — [NEW]
- [JOURNAL_PROMPT] Who am I becoming through this? — [NEW]
- [AFFIRMATION] I am becoming her. She is also me — [NEW]
- [READING] The identity work no one warns you about in perimenopause — [NEW]

##### HRT decision (yes / no / when)

- [TAPPING] Tapping for the HRT decision — [PD] + [NEW]
- [READING] HRT in 2026 — what the research says — [PD]
- [JOURNAL_PROMPT] What information do I still need to decide? — [PD]
- [AFFIRMATION] My HRT decision is mine. It can be revisited — [NEW]

##### Doctor dismissal of symptoms

- [TAPPING] Tapping for the dismissive-doctor frustration — [PD] + [NEW]
- [READING] How to be taken seriously about perimenopause — [PD]
- [AFFIRMATION] My symptoms are not in my head — [NEW]
- [ACTIVITY] Symptom log — for the next appointment — [PD]

##### Partner not understanding what's happening

- [TAPPING] Tapping for the unseen partner moment — [NEW]
- [JOURNAL_PROMPT] What do I want my partner to understand? — [NEW]
- [READING] How to bring your partner along through perimenopause — [PD] + [NEW]
- [AFFIRMATION] I am allowed to ask for what I need — [NEW]

##### Kids noticing the change in mum

- [TAPPING] Tapping for the "mum is different" comment — [NEW]
- [JOURNAL_PROMPT] What do I want my children to learn from watching me through this? — [NEW]
- [READING] Modelling perimenopause well for daughters and sons — [NEW]

##### Career impact — brain fog at work

- [TAPPING] Tapping for brain fog in meetings — cross-tag CAREER — [PD] + [NEW]
- [READING] Perimenopause and the workplace — [PD]
- [ACTIVITY] Pre-meeting notes, post-meeting notes — externalise — [PD]

##### Mid-life crisis overlay

- [TAPPING] Tapping for the mid-life mix — perimenopause + life stage — [NEW]
- [JOURNAL_PROMPT] What's hormones, what's life — and does it matter? — [NEW]
- [AFFIRMATION] Both are real. Both deserve attention — [NEW]

##### Grief for fertile years (even if you didn't want more children)

- [TAPPING] Tapping for the closing of the fertile years — [NEW]
- [JOURNAL_PROMPT] What am I grieving, even quietly? — [NEW]
- [READING] Grief for fertility, without wanting children — [NEW]
- [RITUAL] A goodbye ceremony to the fertile years — [NEW]

##### The "old before my time" feeling

- [TAPPING] Tapping for "I feel older than I am" — [NEW]
- [JOURNAL_PROMPT] What's making me feel old? Is it hormones, lifestyle, story? — [NEW]
- [AFFIRMATION] My years are mine. The story isn't fixed — [NEW]

##### The "everyone's gone through this and no one warned me" anger

- [TAPPING] Tapping for the anger at the silence — [NEW]
- [JOURNAL_PROMPT] What do I want my daughters / friends / younger women to know? — [NEW]
- [AFFIRMATION] I get to break the silence — [NEW]
- [READING] The history of perimenopause silence — and why women are speaking now — [PD] + [NEW]

### Body — Menopause (sub-category)

~25 stuck-on points × 5 practices ≈ 125 entries.

##### Adjusting to no more periods (grief / relief / both)

- [TAPPING] Tapping for the end of the periods — [NEW]
- [JOURNAL_PROMPT] What ended for me when my periods did? — [NEW]
- [AFFIRMATION] I am allowed to feel both relief and grief — [NEW]
- [RITUAL] The menopause threshold ceremony — [NEW]

##### Identity beyond reproductive years

- [TAPPING] Tapping for "who am I now?" — [NEW]
- [READING] Menopause as a doorway into the next self — [PD] + [NEW]
- [JOURNAL_PROMPT] What does the post-fertile me get to be? — [NEW]
- [AFFIRMATION] I am still becoming — [NEW]

##### Sexuality post-menopause

- [TAPPING] Tapping for sex after menopause — [NEW]
- [READING] Post-menopause sex — the long, real version — [PD]
- [JOURNAL_PROMPT] What does pleasure mean for me now? — [NEW]
- [AFFIRMATION] My sexual self is not retiring — [NEW]

##### Body shape changes — the "menopause middle"

- [TAPPING] Tapping for the menopause body shape — [PD] + [NEW]
- [READING] Body shape in menopause — the physiology — [PD]
- [AFFIRMATION] My body's shape is allowed to land where it lands — [NEW]
- [EMBODIMENT] Mirror time — looking with kind eyes — [PD]

##### Bone density worries

- [TAPPING] Tapping for the bone-density fear — [NEW]
- [READING] Bone health in menopause — basics — [PD]
- [ACTIVITY] Weight-bearing movement — daily, gently — [PD]
- [AFFIRMATION] My bones are still building — [NEW]

##### Heart-health awareness

- [TAPPING] Tapping for the heart-health awareness — [NEW]
- [READING] Heart health for women after menopause — [PD]
- [ACTIVITY] Walk for 20 minutes today — [PD]

##### The hot-flush era

- [TAPPING] Tapping for late hot flushes — [PD] + [NEW]
- [READING] When hot flushes persist post-menopause — [PD]
- [RITUAL] The cooling routine — [PD]

##### Sleep work (continues from perimenopause)

- [TAPPING] Tapping for menopause sleep — cross-tag SLEEP — [PD] + [NEW]
- [READING] Sleep in the menopause years — [PD]

##### HRT decisions (start / continue / stop)

- [TAPPING] Tapping for the HRT decision in menopause — [PD] + [NEW]
- [READING] HRT after menopause — [PD]
- [JOURNAL_PROMPT] Is this decision still mine to revisit? — [NEW]

##### Vaginal atrophy and intimate health

- [TAPPING] Tapping for the intimate-health conversation — [PD] + [NEW]
- [READING] Vaginal atrophy — facts, options, kindness — [PD]
- [AFFIRMATION] This is medical care. It deserves attention — [NEW]

##### The "invisibility" some women feel

- [TAPPING] Tapping for the menopause invisibility — [NEW]
- [JOURNAL_PROMPT] When did I last feel seen? By whom? — [NEW]
- [AFFIRMATION] I see myself, even when the world isn't looking — [NEW]
- [READING] The invisibility myth — and the freedom hiding inside it — [NEW]

##### The freedom some women feel

- [TAPPING] Tapping into the post-menopause freedom — [NEW]
- [JOURNAL_PROMPT] What am I freer for, post-menopause? — [NEW]
- [AFFIRMATION] My new freedom is allowed — [NEW]

##### Career in this era

- [TAPPING] Tapping for the post-menopause career chapter — [NEW]
- [JOURNAL_PROMPT] What does my career look like now I have all this clarity? — [NEW]

##### Partnership in this era

- [TAPPING] Tapping for the post-menopause partnership — [NEW]
- [JOURNAL_PROMPT] What does my marriage need now? — [NEW]
- [READING] Long-marriage in post-menopause — [PD] + [NEW]

##### Adult children watching you go through it

- [TAPPING] Tapping for the kids-watching feeling — [NEW]
- [JOURNAL_PROMPT] What do I want my adult kids to see in how I move through this? — [NEW]
- [AFFIRMATION] I am modelling the woman-who-ages-well — [NEW]

##### Becoming the "older woman" in rooms

- [TAPPING] Tapping for "I'm the older woman now" — [NEW]
- [JOURNAL_PROMPT] When did I first notice the room shift? — [NEW]
- [AFFIRMATION] Older woman is a powerful kind of woman — [NEW]

##### Mortality awareness

- [TAPPING] Tapping for the new mortality awareness — cross-tag AGEING — [NEW]
- [READING] Mortality and menopause — the quiet shift — [PD] + [NEW]
- [JOURNAL_PROMPT] What does mortality awareness change for how I live? — [NEW]

##### Re-blooming after the shift

- [TAPPING] Tapping for the re-bloom — [NEW]
- [AFFIRMATION] I am re-blooming — [NEW]
- [JOURNAL_PROMPT] What is unfurling in me now? — [NEW]

##### "Second spring"

- [TAPPING] Tapping for the second-spring energy — [NEW]
- [READING] Second spring — the East Asian frame of post-menopause — [PD]
- [AFFIRMATION] My second spring is real — [NEW]

##### Late-life love and dating

- [TAPPING] Tapping for dating after menopause / divorce — [NEW]
- [READING] Dating in your 50s and 60s — [PD] + [NEW]
- [JOURNAL_PROMPT] What kind of love would I welcome now? — [NEW]

##### The body you have now vs the body you had

- [TAPPING] Tapping for body grief — [NEW]
- [JOURNAL_PROMPT] What do I miss? What do I have now that I didn't? — [NEW]
- [READING] Body-grief as a healthy stage — [NEW]

##### Younger women not understanding

- [TAPPING] Tapping for the generation-gap moment — [NEW]
- [JOURNAL_PROMPT] What I wish I'd known at her age, about my age — [NEW]
- [AFFIRMATION] My understanding doesn't need her understanding — [NEW]

##### Telling your story to younger women

- [TAPPING] Tapping for telling the menopause truth — [NEW]
- [JOURNAL_PROMPT] What do I want younger women to know? — [NEW]
- [ACTIVITY] Tell one younger woman one honest thing this month — [NEW]
- [READING] The case for women telling each other the truth about menopause — [NEW]

### Body — Pregnancy & postpartum

##### TTC body anxiety

- [TAPPING] Tapping for the TTC body anxiety — cross-tag MOTHERHOOD — [NEW]
- [READING] Body care during TTC, when the body feels broken — [PD] + [NEW]
- [JOURNAL_PROMPT] What does my body need to hear during this — [NEW]
- [AFFIRMATION] My body is not failing me — [NEW]

##### Pregnancy body changes

- [TAPPING] Tapping for the pregnancy body — [NEW]
- [READING] The body in pregnancy — what to expect — [PD]
- [JOURNAL_PROMPT] Letter to my pregnant body — [NEW]
- [EMBODIMENT] Slow, daily belly-cream ritual — [PD]

##### Birth recovery

- [TAPPING] Tapping for the postpartum body — [NEW]
- [READING] Birth recovery — the realistic timeline — [PD]
- [AFFIRMATION] My body delivered. It is allowed to recover slowly — [NEW]
- [RITUAL] The slow postpartum recovery ritual — [PD] + [NEW]

##### Postpartum hair loss / skin changes

- [TAPPING] Tapping for postpartum hair loss — [NEW]
- [READING] Postpartum body changes — [PD]
- [AFFIRMATION] My hair is regrowing on its own time — [NEW]

##### Stretch marks / scars / loose skin

- [TAPPING] Tapping for the marks pregnancy left — [NEW]
- [EMBODIMENT] Tracing each mark with kindness — [PD]
- [AFFIRMATION] My body kept the story. I am allowed to love it — [NEW]
- [READING] When marks are medals, not flaws — [NEW]

##### The "body I had before kids" grief

- [TAPPING] Tapping for the body-before-kids grief — [NEW]
- [JOURNAL_PROMPT] What did the pre-baby body know that this one does too? — [NEW]
- [AFFIRMATION] The pre-baby body is gone. This body is here — [NEW]
- [READING] The grief for the body before kids — [NEW]

### Body — Cross-cutting & chronic

##### Surgery / scars / medical body changes

- [TAPPING] Tapping for the body after surgery — cross-tag HEALTH — [NEW]
- [READING] Body identity after a surgical change — [PD] + [NEW]
- [EMBODIMENT] Tracing the scar — kindly — [PD]
- [AFFIRMATION] My body kept me alive. The scars are proof — [NEW]

##### Body in motion vs body at rest

- [TAPPING] Tapping for resistance to stillness — [NEW]
- [READING] The dance between motion and rest — [PD] + [NEW]
- [ACTIVITY] One day, prioritise stillness over move — [PD]

##### Body and clothes — style for current body

- [TAPPING] Tapping for "nothing fits" — [NEW]
- [ACTIVITY] Try on three things you avoid. Buy one new piece for the current body — [PD]
- [JOURNAL_PROMPT] What do I want my clothes to do for me? — [NEW]
- [READING] Dressing the body you have, not the body you want — [PD] + [NEW]

##### Pelvic floor / women's intimate health

- [TAPPING] Tapping for the pelvic-floor conversation — [NEW]
- [READING] Pelvic floor basics — what every woman needs to know — [PD]
- [ACTIVITY] Three minutes of pelvic-floor work daily for a week — [PD]
- [AFFIRMATION] My pelvic floor is part of me. I tend to it — [NEW]

##### Pain as constant companion

- [TAPPING] Tapping for the pain that doesn't leave — cross-tag HEALTH — [PD] + [NEW]
- [READING] Living with chronic pain — the mindset side — [PD] + [NEW]
- [MEDITATION] Body scan that accepts pain — [PD]
- [AFFIRMATION] I am bigger than my pain — [NEW]

### Body — Movement & joy (sub-category)

##### Movement for pleasure rather than punishment

- [TAPPING] Tapping for movement as pleasure — [NEW]
- [READING] The case for joy-led movement — [PD] + [NEW]
- [ACTIVITY] Move to one song fully today — [PD]
- [AFFIRMATION] My body moves because it likes to — [NEW]

##### Body-in-motion practices

- [TAPPING] Tapping for daily small motion — [NEW]
- [ACTIVITY] Walk for 20 minutes today — no destination — [PD]
- [READING] Why daily small motion outperforms big workouts — [PD]
- [AFFIRMATION] Small motion counts — [NEW]

### Body — Reading entries (long-form)

- [READING] Why body work is mindset work — [NEW]
- [READING] The body-image story you inherited — and how to spot it — [NEW]
- [READING] Body neutrality vs body positivity vs body acceptance — [PD]
- [READING] Why "love your body" rarely lands — and what to try instead — [NEW]
- [READING] The history of female body shame — the very short version — [PD] + [NEW]
- [READING] How to look in the mirror without bracing — [NEW]
- [READING] The diet years — what they cost, what to do now — [NEW]
- [READING] Hormones across the lifespan — basic literacy — [PD]
- [READING] When body work isn't enough — the medical / therapy boundary — [PD] + [NEW]
- [READING] The case for getting dressed, even on the slow days — [NEW]
- [READING] Beauty as practice — the long view — [NEW]
- [READING] Why women's bodies are political — and how to opt out of the noise — [NEW]

---

## 4. Self-worth & identity

~50 stuck-on points × 6 practice types ≈ 400 entries. Sources: cross-book
identity work (`MANIFESTING-v2` Phase 4, `MONEY-v2` Phase 2,
`WEIGHT-LOSS-v2` Phase 4, `Money-Zone` "It is yours" thread) plus
public-domain expansion (self-talk, worthiness, shame, attachment).

### Worthiness — the core

##### Feeling fundamentally not enough

- [TAPPING] Tapping for "I am not enough" — [PD] + [NEW]
- [ENERGY_STATEMENT] I am already enough. I have always been — [NEW]
- [AFFIRMATION] I am enough as I am, today — [NEW]
- [JOURNAL_PROMPT] Where did "not enough" first start? — [NEW]
- [VISUALISATION] Younger you, being told the truth — [PD]
- [READING] The "not enough" wound and where it starts — [NEW]

##### The "who am I to want this" hesitation

- [TAPPING] Tapping for "who am I to want this?" — [NEW]
- [AFFIRMATION] I am her. I am allowed to want this — [NEW]
- [JOURNAL_PROMPT] Who taught me wanting was the problem? — [NEW]
- [READING] Why women apologise for wanting — [NEW]

##### Apologising for taking up space

- [TAPPING] Tapping for the space-shrink — [NEW]
- [AFFIRMATION] I am allowed to take up the space I take up — [NEW]
- [EMBODIMENT] Sit fully — feet flat, shoulders down — for one minute — [PD]
- [JOURNAL_PROMPT] Where do I shrink? With whom? Why? — [NEW]

##### Apologising for wanting

- [TAPPING] Tapping for the apologetic want — [NEW]
- [AFFIRMATION] My wanting is sacred — [NEW]
- [JOURNAL_PROMPT] What do I want, in plain English, with no caveats? — [NEW]
- [READING] The case for unapologetic wanting — [NEW]

##### Feeling worthy of millions

- [TAPPING] Tapping for worthy of millions — MONEY-v2/D24
- [AFFIRMATION] I am worthy of millions — MONEY-v2/D24
- [JOURNAL_PROMPT] What does "worthy of millions" feel like? — [NEW]

##### Feeling worthy of beauty & luxury now

- [TAPPING] Tapping for worthy of beauty now — WEIGHT-LOSS-v2/D63
- [AFFIRMATION] I am worthy of beauty now, not at some future weight — WEIGHT-LOSS-v2/D63
- [ACTIVITY] One small luxury today — for no reason — [PD]
- [JOURNAL_PROMPT] What luxury have I been waiting to "earn"? — [NEW]

##### Feeling completely worthy of every dream

- [TAPPING] Tapping for worthy of every dream — MANIFESTING-v2/D68
- [AFFIRMATION] I am worthy of every dream I hold — MANIFESTING-v2/D68
- [JOURNAL_PROMPT] The dream I think I'm not worthy of — and why — [NEW]
- [VISUALISATION] Receiving the dream — easily — [PD]

##### Receiving compliments without deflecting

- [TAPPING] Tapping for receiving compliments — [NEW]
- [AFFIRMATION] Thank you, full stop — [NEW]
- [ACTIVITY] Today, just say "thank you" to one compliment — [PD]
- [JOURNAL_PROMPT] What does deflection protect me from? — [NEW]

##### Receiving gifts without minimising

- [TAPPING] Tapping for receiving gifts — [NEW]
- [AFFIRMATION] I receive what's offered, fully — [NEW]
- [JOURNAL_PROMPT] When did receiving become uncomfortable? — [NEW]
- [VISUALISATION] Receiving a gift — and the joy staying — [PD]

##### Receiving help without guilt

- [TAPPING] Tapping for "I should be able to do it alone" — [NEW]
- [AFFIRMATION] Asking for help is not weakness — [NEW]
- [JOURNAL_PROMPT] Whose voice told me asking was bad? — [NEW]
- [ACTIVITY] Ask for help on one thing this week — [PD]

##### The "good girl" wound — being worth more than being helpful

- [TAPPING] Tapping for the "helpful = worthy" loop — [NEW]
- [AFFIRMATION] My worth isn't measured in my usefulness — [NEW]
- [JOURNAL_PROMPT] What am I if I'm not the helpful one? — [NEW]
- [READING] The good-girl wound — how to spot it, how to soften it — [PD] + [NEW]

### Identity — who you are

##### Stepping into wealthy identity

- [TAPPING] Tapping into the wealthy identity — MONEY-v2 Phase 2
- [AFFIRMATION] I am a wealthy woman — MONEY-v2/D22
- [JOURNAL_PROMPT] How does the wealthy version of me wake up? — [NEW]

##### Becoming the woman who already has it

- [TAPPING] Tapping to become her — MANIFESTING-v2/D64
- [AFFIRMATION] She is me. I am her — MANIFESTING-v2/D64
- [EMBODIMENT] Stand the way she stands. Speak the way she speaks — [PD]
- [VISUALISATION] A day in her life — uncensored — [PD]

##### Anchoring the new identity

- [TAPPING] Tapping for the new identity in the body — WEIGHT-LOSS-v2 Phase 4
- [AFFIRMATION] The new me is here, daily — [NEW]
- [JOURNAL_PROMPT] What anchors the new identity for me? — [NEW]

##### Letting future self guide present choices

- [TAPPING] Tapping for letting her lead — MANIFESTING-v2/D65
- [JOURNAL_PROMPT] What would future me choose this morning? — MANIFESTING-v2/D65
- [AFFIRMATION] My future self has good answers I haven't asked — [NEW]
- [VISUALISATION] Future you, beside you, all day — [PD]

##### Speaking and acting from the fulfilled place

- [TAPPING] Tapping for speaking from already-arrived — MANIFESTING-v2/D66
- [AFFIRMATION] I act as if it has already arrived — [NEW]
- [JOURNAL_PROMPT] What would I do today if it had already happened? — [NEW]

##### Loving the person I've become

- [TAPPING] Tapping to love who I've become — MANIFESTING-v2/D76
- [AFFIRMATION] I love who I've become — MANIFESTING-v2/D76
- [JOURNAL_PROMPT] Three things I love about who I am now — [NEW]

##### Trust my desires as extensions of who I am

- [TAPPING] Tapping to trust my desires — MANIFESTING-v2/D67
- [AFFIRMATION] My desires are clues to who I am — MANIFESTING-v2/D67
- [JOURNAL_PROMPT] What does my desire point me toward, that's already true? — [NEW]

##### Releasing the identity of struggle

- [TAPPING] Tapping to release the "I always struggle" identity — [NEW]
- [AFFIRMATION] Struggle is not who I am — [NEW]
- [JOURNAL_PROMPT] Who would I be without the struggle story? — [NEW]
- [READING] When struggle becomes identity — and how to unhook — [NEW]

##### Releasing the identity of the one-who-tries-hard

- [TAPPING] Tapping for the try-hard identity — [NEW]
- [AFFIRMATION] I get to be effective without effort being the proof — [NEW]
- [JOURNAL_PROMPT] What does "tried hard" earn me — and from whom? — [NEW]

##### Releasing the identity of the good-girl / people-pleaser

- [TAPPING] Tapping for the people-pleaser identity — [NEW]
- [AFFIRMATION] I please me first — [NEW]
- [JOURNAL_PROMPT] What does my no protect? — [NEW]
- [READING] The people-pleasing trap and where it comes from — [PD] + [NEW]

##### Releasing the perfectionist identity

- [TAPPING] Tapping for the perfectionist identity — [NEW]
- [AFFIRMATION] Good enough is allowed to be the new bar — [NEW]
- [READING] Perfectionism as a survival strategy — [PD] + [NEW]
- [JOURNAL_PROMPT] What would I do if "good enough" was enough? — [NEW]

### The voice in your head

##### Quieting the inner critic

- [TAPPING] Tapping to quiet the inner critic — [NEW]
- [AFFIRMATION] My inner voice is becoming kinder — [NEW]
- [ACTIVITY] Write down one harsh inner sentence. Rewrite it as a friend would — [PD]
- [JOURNAL_PROMPT] What is my inner critic actually trying to protect? — [NEW]
- [READING] How the inner critic forms — and how to befriend it — [PD] + [NEW]

##### Speaking to yourself the way you'd speak to a friend

- [TAPPING] Tapping to speak kindly to myself — [NEW]
- [AFFIRMATION] I speak to me as I would to my dearest friend — [NEW]
- [ACTIVITY] All day: catch one harsh thought, rephrase it. No effort, just notice — [PD]

##### Catching yourself mid-self-attack

- [TAPPING] Tapping for the self-attack catch — [NEW]
- [AFFIRMATION] I am allowed to interrupt myself — [NEW]
- [ACTIVITY] Note one self-attack today. Just notice — [PD]

##### Reframing "I'm not [X] enough"

- [TAPPING] Tapping for the "not enough" reframe — [NEW]
- [AFFIRMATION] I am enough as I am — [NEW]
- [JOURNAL_PROMPT] Which "not enough" sentence runs the loudest? — [NEW]

##### Releasing perfectionism as a survival strategy

- [TAPPING] Tapping to release perfectionist survival — [NEW]
- [JOURNAL_PROMPT] What was I keeping safe by being perfect? — [NEW]
- [READING] When you stop needing perfection to feel safe — [NEW]

##### The internalised mother / father voice

- [TAPPING] Tapping for the mother-voice in my head — [NEW]
- [TAPPING] Tapping for the father-voice in my head — [NEW]
- [JOURNAL_PROMPT] Whose voice is my inner voice, really? — [NEW]
- [READING] How parent-voices live on in the inner critic — [PD] + [NEW]

##### The internalised teacher / boss / partner voice

- [TAPPING] Tapping for the boss-voice in my head — [NEW]
- [JOURNAL_PROMPT] Whose words have I made my inner critic? — [NEW]
- [AFFIRMATION] My voice is mine. The others can leave — [NEW]

##### Self-talk as a daily practice

- [TAPPING] Tapping to anchor kinder self-talk — [NEW]
- [RITUAL] One sentence to yourself, every morning — [NEW]
- [JOURNAL_PROMPT] What sentence would change my day if I really believed it? — [NEW]
- [READING] Self-talk that actually changes things — [PD] + [NEW]

### Comparison and visibility

##### Other women's success triggering you

- [TAPPING] Tapping for "her success makes me feel worse" — [NEW]
- [AFFIRMATION] Her win is evidence — [NEW]
- [JOURNAL_PROMPT] Whose win triggers me most? Why? — [NEW]
- [READING] When other women's success triggers you — [NEW]

##### The Instagram comparison spiral

- [TAPPING] Tapping for the IG spiral — [NEW]
- [ACTIVITY] One unfollow this week. Of someone whose content makes you smaller — [PD]
- [AFFIRMATION] Her feed is her highlight reel — [NEW]
- [READING] The comparison machine and how to opt out — [PD] + [NEW]

##### The school-gate comparison spiral

- [TAPPING] Tapping for the school-gate compare — [NEW]
- [AFFIRMATION] My life is not a competition with hers — [NEW]
- [JOURNAL_PROMPT] Who at the school gate triggers me — and what is it actually about? — [NEW]

##### Wanting visibility but fearing it

- [TAPPING] Tapping for the want-visibility-fear-visibility split — [NEW]
- [AFFIRMATION] I am safe to be seen — [NEW]
- [JOURNAL_PROMPT] What does visibility cost me, in my story? — [NEW]
- [VISUALISATION] Walking onto the stage — and the room safe — [PD]

##### Welcoming healthy visibility

- [TAPPING] Tapping to welcome visibility — WEIGHT-LOSS-v2/D34
- [AFFIRMATION] Healthy visibility is allowed — [NEW]
- [JOURNAL_PROMPT] Where do I want to be more visible? — [NEW]

##### Being seen as you actually are

- [TAPPING] Tapping for being seen as you are — [NEW]
- [AFFIRMATION] I let the real me be seen — [NEW]
- [JOURNAL_PROMPT] What about me am I hiding most? — [NEW]
- [READING] The cost of staying hidden — [NEW]

##### Stopping the dimming-yourself-down

- [TAPPING] Tapping to stop dimming — [NEW]
- [AFFIRMATION] I am allowed to shine fully — [NEW]
- [JOURNAL_PROMPT] Whose comfort am I dimming for? — [NEW]

##### The "what will they think" loop

- [TAPPING] Tapping for "what will they think?" — [NEW]
- [AFFIRMATION] Their thinking is theirs. Mine is mine — [NEW]
- [JOURNAL_PROMPT] Whose specific thoughts run me? Should they? — [NEW]
- [READING] When you stop performing for the opinions you imagined — [NEW]

### Story you tell about yourself

##### The story of being "behind" in life

- [TAPPING] Tapping for "I'm behind" — [NEW]
- [AFFIRMATION] I am exactly where I am. There is no behind — [NEW]
- [JOURNAL_PROMPT] Behind whose timeline? — [NEW]

##### The story of being "too much" / "too little"

- [TAPPING] Tapping for "too much" — [NEW]
- [TAPPING] Tapping for "too little" — [NEW]
- [AFFIRMATION] I am the right amount of me — [NEW]
- [JOURNAL_PROMPT] When did "too much" or "too little" first land? — [NEW]
- [READING] The "too much / too little" dance women learn — [NEW]

##### The story of "this isn't for me"

- [TAPPING] Tapping for "this isn't for me" — cross-tag MONEY — [NEW]
- [AFFIRMATION] If I want it, it's for me — [NEW]
- [JOURNAL_PROMPT] What have I decided isn't for me — and is that true? — [NEW]

##### The story of "I always mess it up"

- [TAPPING] Tapping for "I always mess up" — [NEW]
- [JOURNAL_PROMPT] Where have I not messed up, and overlooked? — [NEW]
- [AFFIRMATION] I get to be a person who handles things — [NEW]

##### The story of "I don't deserve it"

- [TAPPING] Tapping for "I don't deserve it" — [NEW]
- [AFFIRMATION] Deserving was never the question — [NEW]
- [JOURNAL_PROMPT] Who told me I had to deserve before I could have? — [NEW]
- [READING] The deserving trap — and the alternative — [NEW]

##### The story of being the family's [X]

- [TAPPING] Tapping for the family role I got cast in — [NEW]
- [JOURNAL_PROMPT] What was my role in my family? Is it still mine to play? — [NEW]
- [AFFIRMATION] I am not my childhood role — [NEW]
- [READING] How family roles travel into adulthood — [PD] + [NEW]

##### Letting old stories die

- [TAPPING] Tapping to let the old stories die — [NEW]
- [RITUAL] Write the old story; burn it (safely) — [PD]
- [AFFIRMATION] The old story is allowed to end — [NEW]

### Permission and choice

##### Giving yourself permission to want what you want

- [TAPPING] Tapping for permission to want — [NEW]
- [AFFIRMATION] My wanting is permission enough — [NEW]
- [JOURNAL_PROMPT] What do I want — without justifying it? — [NEW]

##### Giving yourself permission to choose differently

- [TAPPING] Tapping for permission to choose differently — [NEW]
- [AFFIRMATION] I can choose differently. Today, even — [NEW]
- [JOURNAL_PROMPT] One choice I'd remake, given the chance — [NEW]

##### Giving yourself permission to rest

- [TAPPING] Tapping for rest permission — WEIGHT-LOSS-v2/D58
- [AFFIRMATION] Rest is mine to take — [NEW]
- [ACTIVITY] Take the rest today. No earning it first — [PD]

##### Giving yourself permission to be wrong

- [TAPPING] Tapping for permission to be wrong — [NEW]
- [AFFIRMATION] Being wrong is allowed. It teaches me — [NEW]
- [JOURNAL_PROMPT] What am I afraid being wrong will cost me? — [NEW]

##### Giving yourself permission to change your mind

- [TAPPING] Tapping for permission to change my mind — [NEW]
- [AFFIRMATION] My mind is allowed to change — [NEW]
- [JOURNAL_PROMPT] What have I outgrown that I still claim to want? — [NEW]

### Self-worth — reading entries

- [READING] What worthiness is, and what it isn't — [NEW]
- [READING] The "good girl" wound — origin and exit — [PD] + [NEW]
- [READING] Why self-worth doesn't come from achievement — [PD] + [NEW]
- [READING] Mirror work — practical and personal — [PD]
- [READING] Inner-critic dialogue — the basics — [PD]
- [READING] The "I'm not enough" tax on every decision — [NEW]
- [READING] How identity work and money work intersect — [NEW]
- [READING] The future-self practice — what it is, what it isn't — [PD] + [NEW]
- [READING] When self-talk practice doesn't land — and when it does — [NEW]
- [READING] Self-worth and the women in your line — [NEW]

---

## 5. Relationships

~42 stuck-on points × 5 practices ≈ 210 entries. Sources: public-domain
attachment / family-systems / communication research, plus Rebecca-
original content for sections that touch other categories (e.g. money
fights, intimacy after kids).

### Partner / marriage

##### Distance / disconnection in marriage

- [TAPPING] Tapping for the marriage drift — [NEW]
- [JOURNAL_PROMPT] When did the drift start, quietly? — [NEW]
- [AFFIRMATION] We can come back to each other — [NEW]
- [ACTIVITY] One small reach this week — a touch, a question, a coffee together — [PD]
- [READING] Marriage drift — what to notice, what to do — [PD] + [NEW]

##### Communication breakdowns

- [TAPPING] Tapping for "we can't talk anymore" — [NEW]
- [JOURNAL_PROMPT] What does the talking break down on? — [NEW]
- [READING] When you've stopped talking — communication basics for adults — [PD]
- [AFFIRMATION] We can learn to talk again — [NEW]

##### The same fight on repeat

- [TAPPING] Tapping for the same fight, again — [NEW]
- [JOURNAL_PROMPT] What is this fight actually about? — [NEW]
- [READING] The same fight on repeat — diagnosis — [PD] + [NEW]
- [AFFIRMATION] The pattern can break — [NEW]

##### Sex / intimacy gone quiet

- [TAPPING] Tapping for the quiet bedroom — cross-tag BODY — [NEW]
- [JOURNAL_PROMPT] What stopped first — sex or the closeness it lived in? — [NEW]
- [READING] When intimacy goes quiet in a long relationship — [PD]
- [AFFIRMATION] We can find each other again, slowly — [NEW]

##### Resentment buildup

- [TAPPING] Tapping for resentment in the marriage — [NEW]
- [JOURNAL_PROMPT] What am I resenting? What do I want different? — [NEW]
- [READING] Resentment as information — [PD] + [NEW]
- [AFFIRMATION] Resentment is allowed to be named, then released — [NEW]

##### Money fights

- [TAPPING] Tapping for the money fight — cross-tag MONEY — [NEW]
- [JOURNAL_PROMPT] What is the money fight actually about? — [NEW]
- [READING] When money fights aren't about money — [PD] + [NEW]
- [ACTIVITY] The Sunday money date for couples — [NEW]

##### Parenting disagreements

- [TAPPING] Tapping for the "we parent differently" tension — [NEW]
- [JOURNAL_PROMPT] What value drives my parenting choice? What drives theirs? — [NEW]
- [READING] Parenting from two different blueprints — [PD] + [NEW]

##### Mental-load imbalance

- [TAPPING] Tapping for "I hold it all" — cross-tag TIME — [NEW]
- [JOURNAL_PROMPT] What am I tracking that nobody else is? — [NEW]
- [READING] The mental load — what it is, how to redistribute it — [PD] + [NEW]
- [AFFIRMATION] I am allowed to share the load — [NEW]

##### Loneliness inside marriage

- [TAPPING] Tapping for loneliness inside the marriage — [NEW]
- [JOURNAL_PROMPT] What kind of company am I missing, even with him here? — [NEW]
- [READING] When marriage doesn't cure loneliness — [PD] + [NEW]
- [AFFIRMATION] My loneliness is real, and not my fault — [NEW]

##### Wishing partner was different

- [TAPPING] Tapping for "I wish he was different" — [NEW]
- [JOURNAL_PROMPT] What would change if I accepted him as he is? — [NEW]
- [READING] Acceptance in marriage — what it is, and isn't — [PD] + [NEW]

##### The "is this still love" wobble

- [TAPPING] Tapping for the love-wobble — [NEW]
- [JOURNAL_PROMPT] What kind of love is this, today? Is it enough? — [NEW]
- [READING] When love-the-feeling wavers — and what to do — [PD] + [NEW]

##### Affair — yours or theirs

- [TAPPING] Tapping for the betrayal — [PD] + [NEW]
- [JOURNAL_PROMPT] What does staying / going actually require of me? — [NEW]
- [READING] After an affair — the long, slow choice — [PD]
- [AFFIRMATION] I am allowed to decide carefully — [NEW]

##### Considering separation

- [TAPPING] Tapping for the "should we?" question — [NEW]
- [JOURNAL_PROMPT] If I weren't afraid, what would I want? — [NEW]
- [READING] Considering separation — clarity, not panic — [PD] + [NEW]

##### Post-affair rebuilding

- [TAPPING] Tapping for the rebuilding stage — [NEW]
- [READING] Rebuilding after the rupture — [PD] + [NEW]
- [AFFIRMATION] We can build something new from the broken — [NEW]

##### The "should I stay" question

- [TAPPING] Tapping for the staying question — [NEW]
- [JOURNAL_PROMPT] What do I need to know — that I'm not yet letting myself see? — [NEW]
- [READING] How to know when it's time to leave — [PD] + [NEW]

### Kids

##### The difficult child / particular dynamic with one

- [TAPPING] Tapping for the hard dynamic with one child — [NEW]
- [JOURNAL_PROMPT] What does this child need that I struggle to give? — [NEW]
- [AFFIRMATION] My love for them isn't measured in ease — [NEW]
- [READING] When one child is harder than the others — [PD] + [NEW]

##### The favourite-child guilt

- [TAPPING] Tapping for favourite-child guilt — [NEW]
- [JOURNAL_PROMPT] What is the "favourite" feeling actually about? — [NEW]
- [READING] When you secretly find one child easier — [PD] + [NEW]

##### Adult children — the relationship shift

- [TAPPING] Tapping for the adult-child shift — cross-tag MOTHERHOOD — [NEW]
- [JOURNAL_PROMPT] What kind of relationship do I want with them now? — [NEW]
- [READING] Mothering grown children — [PD] + [NEW]

##### Adult children — distance / cutting contact

- [TAPPING] Tapping for the estranged-child grief — cross-tag GRIEF — [PD] + [NEW]
- [READING] When an adult child cuts contact — the long view — [PD]
- [AFFIRMATION] I am allowed to grieve and hope at the same time — [NEW]

##### Worry about your adult children

- [TAPPING] Tapping for the adult-child worry — [NEW]
- [JOURNAL_PROMPT] What am I tracking that they would rather I let go? — [NEW]

##### Mothering teenagers

- [TAPPING] Tapping for the teen-mother gap — [NEW]
- [READING] Mothering teenagers — the long survey — [PD] + [NEW]
- [AFFIRMATION] Teenagers test the foundation. The foundation holds — [NEW]

##### Letting go as they grow

- [TAPPING] Tapping for the letting-go ache — [NEW]
- [JOURNAL_PROMPT] What does letting-go look like at this stage? — [NEW]
- [READING] The slow practice of letting go — [PD] + [NEW]

### Parents

##### The mother wound

- [TAPPING] Tapping for the mother wound — [PD] + [NEW]
- [READING] What the mother wound is, and isn't — [PD] + [NEW]
- [JOURNAL_PROMPT] What did I not get from my mother? What did I get? — [NEW]
- [AFFIRMATION] I am allowed to grieve what I didn't get — [NEW]

##### The father wound

- [TAPPING] Tapping for the father wound — [PD] + [NEW]
- [READING] The father wound and how it travels — [PD] + [NEW]
- [JOURNAL_PROMPT] What did my father give that I underestimated? What did he not? — [NEW]

##### Critical parent dynamics

- [TAPPING] Tapping for the still-critical parent — [NEW]
- [READING] Adult children of critical parents — [PD] + [NEW]
- [AFFIRMATION] Their criticism is theirs to keep — [NEW]

##### Absent parent grief

- [TAPPING] Tapping for the absent-parent grief — cross-tag GRIEF — [NEW]
- [JOURNAL_PROMPT] What did the absence shape in me? — [NEW]
- [READING] Living with an absent parent — [PD]

##### Estrangement — chosen or imposed

- [TAPPING] Tapping for the estrangement — [NEW]
- [JOURNAL_PROMPT] What does estrangement give me that contact didn't? — [NEW]
- [READING] Adult-child estrangement — the cost and the freedom — [PD] + [NEW]

##### Caring for ageing parents

- [TAPPING] Tapping for caring for the parents — cross-tag AGEING — [NEW]
- [READING] Caring for parents in their decline — [PD]
- [AFFIRMATION] I am allowed to care without losing myself — [NEW]

##### The role-reversal

- [TAPPING] Tapping for the role-reversal — [NEW]
- [JOURNAL_PROMPT] What does the reversal ask of me, that wasn't taught? — [NEW]
- [READING] When you become the parent — [PD] + [NEW]

##### Inheritance dynamics

- [TAPPING] Tapping for the inheritance tangle — cross-tag MONEY — [NEW]
- [READING] Inheritance + siblings + family of origin — [PD] + [NEW]
- [JOURNAL_PROMPT] What does the inheritance mean to me, separate from the money? — [NEW]

##### Becoming your mother — the fear / the recognition

- [TAPPING] Tapping for "I'm becoming her" — [NEW]
- [JOURNAL_PROMPT] What of her am I afraid of? What of her am I grateful for? — [NEW]
- [READING] Becoming your mother — and choosing what to keep — [PD] + [NEW]

### Friends + extended family + toxic

##### Friends who drifted

- [TAPPING] Tapping for the lost friendships — [NEW]
- [JOURNAL_PROMPT] Why did this one drift? Was it the right time to let it? — [NEW]
- [AFFIRMATION] Friendships have seasons — [NEW]
- [READING] Why adult friendships drift — [PD] + [NEW]

##### The mom-friend search

- [TAPPING] Tapping for the mum-friend search — [NEW]
- [JOURNAL_PROMPT] What kind of mum-friends do I actually want? — [NEW]
- [READING] How to make mum-friends as an adult — [PD] + [NEW]
- [ACTIVITY] One coffee invitation this month — [PD]

##### The competitive friend

- [TAPPING] Tapping for the competitive friendship — [NEW]
- [JOURNAL_PROMPT] What does this friendship cost me? — [NEW]
- [READING] When a friendship turns competitive — [PD] + [NEW]

##### Saying no to invitations

- [TAPPING] Tapping for the no — cross-tag TIME — [NEW]
- [AFFIRMATION] No is allowed — [NEW]
- [JOURNAL_PROMPT] Whose invitations am I avoiding declining? — [NEW]
- [READING] The art of the no — [PD] + [NEW]

##### In-law dynamics

- [TAPPING] Tapping for the in-law tension — [NEW]
- [JOURNAL_PROMPT] What does my relationship with my in-laws cost / give? — [NEW]
- [READING] In-laws — boundaries and warmth, both — [PD] + [NEW]

##### The toxic relative

- [TAPPING] Tapping for the difficult family member — [NEW]
- [READING] Limited contact with family — [PD] + [NEW]
- [AFFIRMATION] My distance is allowed — [NEW]

##### Boundary-setting in family

- [TAPPING] Tapping for setting a family boundary — [NEW]
- [JOURNAL_PROMPT] What boundary am I avoiding setting? — [NEW]
- [READING] Boundaries with family — scripts and steady ground — [PD] + [NEW]

##### The estrangement decision

- [TAPPING] Tapping for the estrangement decision — [NEW]
- [READING] When estrangement is the loving choice — [PD] + [NEW]
- [JOURNAL_PROMPT] What does my body know that my head is still deciding? — [NEW]

##### Friendship after a falling out

- [TAPPING] Tapping for the fallen-out friendship — [NEW]
- [READING] Repair after rupture in adult friendship — [PD] + [NEW]
- [JOURNAL_PROMPT] Is this one for repair, or release? — [NEW]

##### Loneliness in a full life

- [TAPPING] Tapping for "lonely in a full life" — [NEW]
- [JOURNAL_PROMPT] What kind of connection am I missing? — [NEW]
- [READING] Loneliness that isn't about being alone — [PD] + [NEW]

##### Making new friends in mid-life

- [TAPPING] Tapping for the mid-life friendship hunt — [NEW]
- [READING] How to make friends in your 40s — [PD] + [NEW]
- [ACTIVITY] One brave first message this month — [PD]

### Relationships — reading entries

- [READING] Adult friendship — why it's harder, how to make it work — [PD] + [NEW]
- [READING] When the marriage gets quiet — what to look at — [NEW]
- [READING] Parenting a child you find hard — without shame — [NEW]
- [READING] Boundaries in family — beyond the buzzword — [PD] + [NEW]
- [READING] The mother wound and what to do with it — [PD] + [NEW]
- [READING] Estrangement — chosen, imposed, in between — [PD] + [NEW]

---

## 6. Motherhood

~43 stuck-on points × 5 practices ≈ 215 entries. Sources: public-domain
maternal-mental-health research, attachment theory, modern-motherhood
discourse, plus Rebecca-original framing where it crosses into
self-worth and identity.

### Stuck-on points

##### The identity loss in early motherhood

- [TAPPING] Tapping for "who am I now?" early motherhood — [NEW]
- [JOURNAL_PROMPT] Who was I before the baby? Where is she? — [NEW]
- [READING] Matrescence — the identity rewrite no one warns you about — [PD] + [NEW]
- [AFFIRMATION] I am becoming her — the new her — [NEW]

##### Mom guilt

- [TAPPING] Tapping for mum guilt — [PD] + [NEW]
- [AFFIRMATION] Guilt is not the measure of good mothering — [NEW]
- [JOURNAL_PROMPT] What does my mum guilt actually want from me? — [NEW]
- [READING] Mum guilt — what it is, what to do with it — [PD] + [NEW]

##### Mom rage

- [TAPPING] Tapping for mum rage — [PD] + [NEW]
- [AFFIRMATION] My rage is information, not failure — [NEW]
- [JOURNAL_PROMPT] What is my rage actually telling me I need? — [NEW]
- [READING] Mum rage — the underlying truth — [PD] + [NEW]

##### Touched-out / sensory overload

- [TAPPING] Tapping for the touched-out evening — [NEW]
- [READING] Touched-out — the science and the soft answer — [PD] + [NEW]
- [RITUAL] The 10-minute reclaim — for the touched-out mum — [NEW]
- [AFFIRMATION] My body is allowed to want space — [NEW]

##### The "good mother" pressure

- [TAPPING] Tapping for the good-mother pressure — [NEW]
- [JOURNAL_PROMPT] What does a "good mother" do that I think I'm not? — [NEW]
- [AFFIRMATION] I get to redefine what good mothering means — [NEW]
- [READING] The "good mother" myth — [PD] + [NEW]

##### Comparison to other mothers

- [TAPPING] Tapping for the mother-comparison spiral — [NEW]
- [JOURNAL_PROMPT] Which mother do I compare myself to most? Why? — [NEW]
- [AFFIRMATION] My mothering is mine — [NEW]

##### Working-mum guilt

- [TAPPING] Tapping for working-mum guilt — [NEW]
- [AFFIRMATION] Working is part of how I love them — [NEW]
- [JOURNAL_PROMPT] What does my work give my children, that I overlook? — [NEW]
- [READING] Working-mum guilt — the long view — [PD] + [NEW]

##### Stay-at-home-mum guilt

- [TAPPING] Tapping for stay-at-home guilt — [NEW]
- [AFFIRMATION] My presence is the work — [NEW]
- [JOURNAL_PROMPT] What does staying home give them, that I underestimate? — [NEW]

##### Going back to work after baby

- [TAPPING] Tapping for the back-to-work transition — [NEW]
- [READING] Returning to work after maternity leave — emotionally — [PD] + [NEW]
- [AFFIRMATION] I can do both. They will be okay. So will I — [NEW]

##### The "I love them but don't always like them" honesty

- [TAPPING] Tapping for "I don't always like my kids" — [NEW]
- [AFFIRMATION] Love and like are different things, and both real — [NEW]
- [READING] Loving them and not liking them in this moment — [NEW]

##### Breastfeeding struggles

- [TAPPING] Tapping for the feeding grief — [NEW]
- [READING] When breastfeeding doesn't go to plan — [PD] + [NEW]
- [AFFIRMATION] Fed is the metric. I am a good mother either way — [NEW]
- [RITUAL] A goodbye ritual to the feeding journey, however it ended — [NEW]

##### Sleep deprivation specifically

- [TAPPING] Tapping for the sleep-deprived mother — cross-tag SLEEP — [PD] + [NEW]
- [READING] Surviving the baby sleep years — [PD]
- [AFFIRMATION] My sleep will return. I am not broken — [NEW]
- [RITUAL] The 20-minute restorative — when sleep can't be the answer — [PD]

##### The "I'm becoming my mother" fear

- [TAPPING] Tapping for "becoming my mother" — cross-tag PARENTS — [NEW]
- [JOURNAL_PROMPT] What of her do I fear becoming? What am I already? — [NEW]
- [READING] Becoming your mother — fear, fact, choice — [PD] + [NEW]

##### Your mother criticising your mothering

- [TAPPING] Tapping for being criticised about how I mother — [NEW]
- [READING] When your mother won't stop critiquing — [PD] + [NEW]
- [AFFIRMATION] My mothering is mine to choose — [NEW]

##### Mother-in-law dynamics

- [TAPPING] Tapping for the mother-in-law dynamic — cross-tag RELATIONSHIPS — [NEW]
- [READING] Mother-in-law as another mother — [PD] + [NEW]

##### Wanting another vs not

- [TAPPING] Tapping for the another-baby question — [NEW]
- [JOURNAL_PROMPT] What does my body say? What does my life say? — [NEW]
- [READING] Deciding on another child — [PD] + [NEW]

##### Secondary infertility

- [TAPPING] Tapping for secondary infertility — [PD] + [NEW]
- [READING] Secondary infertility — the quieter grief — [PD]
- [AFFIRMATION] My grief is real, even with one already here — [NEW]

##### Miscarriage / loss

- [TAPPING] Tapping for the miscarriage grief — cross-tag GRIEF — [PD] + [NEW]
- [READING] Pregnancy loss — the body and the heart — [PD]
- [RITUAL] A naming-and-honouring ritual for a lost pregnancy — [NEW]
- [AFFIRMATION] My loss is real and mine — [NEW]

##### Birth trauma

- [TAPPING] Tapping for the birth trauma — cross-tag FEAR — [PD] + [NEW]
- [READING] Birth trauma — what to know, what to do — [PD]
- [AFFIRMATION] My birth doesn't define my mothering — [NEW]
- [JOURNAL_PROMPT] Writing the birth story I'd want to read — [NEW]

##### Postnatal depression / anxiety

- [TAPPING] Tapping for postnatal anxiety — [PD] + [NEW]
- [READING] Postnatal depression and anxiety — basics — [PD]
- [AFFIRMATION] This is not who I am. This is something happening — [NEW]
- [READING] When to call the doctor — postnatal edition — [PD]

##### The friend-loss of new motherhood

- [TAPPING] Tapping for losing your single-life friends — [NEW]
- [JOURNAL_PROMPT] Which friendships are dormant vs gone? — [NEW]
- [READING] Friendship shifts in new motherhood — [PD] + [NEW]

##### Pregnancy after loss

- [TAPPING] Tapping for the pregnancy-after-loss fear — [PD] + [NEW]
- [READING] Pregnancy after loss — emotionally — [PD]
- [AFFIRMATION] My fear is fair. So is hope — [NEW]

##### Older mothers / younger mothers

- [TAPPING] Tapping for being an older / younger mother — [NEW]
- [READING] The mother-age experience — at any age — [PD] + [NEW]
- [JOURNAL_PROMPT] What does my age give my children, specifically? — [NEW]

##### Single motherhood by choice / circumstance

- [TAPPING] Tapping for the single-mother weight — [NEW]
- [READING] Single mothering well — [PD] + [NEW]
- [AFFIRMATION] My family is whole — [NEW]

##### Co-parenting after separation

- [TAPPING] Tapping for the co-parenting handover — [NEW]
- [JOURNAL_PROMPT] What does good co-parenting look like for our kids? — [NEW]
- [READING] Co-parenting after separation — [PD]

##### Step-mother identity

- [TAPPING] Tapping for the step-mother role — [NEW]
- [READING] Being a step-mother — the long, careful path — [PD] + [NEW]
- [AFFIRMATION] I get to find my place in their lives — [NEW]

##### Blended-family dynamics

- [TAPPING] Tapping for the blended-family tension — [NEW]
- [READING] Blended families — the long version — [PD] + [NEW]

##### The "am I doing enough" loop

- [TAPPING] Tapping for "am I doing enough?" — [NEW]
- [JOURNAL_PROMPT] What does "enough" actually mean here? — [NEW]
- [AFFIRMATION] Showing up is most of it — [NEW]

##### Discipline doubts

- [TAPPING] Tapping for the discipline wobble — [NEW]
- [READING] Discipline that works without breaking them — [PD] + [NEW]
- [JOURNAL_PROMPT] What do I want my discipline to teach them? — [NEW]

##### Teen mothering — the disconnect

- [TAPPING] Tapping for the teen disconnect — [NEW]
- [READING] Mothering a teenager well — [PD] + [NEW]
- [AFFIRMATION] The disconnect is the work, not the failure — [NEW]

##### The "they don't need me anymore" grief

- [TAPPING] Tapping for "they don't need me" — cross-tag GRIEF — [NEW]
- [JOURNAL_PROMPT] What did I love most about being needed? — [NEW]
- [READING] The grief of being less needed — [PD] + [NEW]

##### Empty nest

- [TAPPING] Tapping for the empty-nest grief — [NEW]
- [READING] Empty nest — what to expect, what to do — [PD] + [NEW]
- [RITUAL] The first night they're gone — a soft, honoured ritual — [NEW]

##### Adult-child relationship strain

- [TAPPING] Tapping for the strained adult-child relationship — cross-tag RELATIONSHIPS — [NEW]
- [READING] Adult-child strain — repair when possible — [PD] + [NEW]

##### Becoming a grandmother

- [TAPPING] Tapping for becoming a granny — [NEW]
- [READING] Grandmothering — the new role — [PD] + [NEW]
- [JOURNAL_PROMPT] What kind of grandmother do I want to be? — [NEW]

##### Grandmother boundaries

- [TAPPING] Tapping for the grandmother boundary — [NEW]
- [READING] Grandparent boundaries — how to honour your role — [PD] + [NEW]

##### Wanting grandchildren and not getting them

- [TAPPING] Tapping for the grandchild grief — [NEW]
- [JOURNAL_PROMPT] What was I expecting? What do I get to have instead? — [NEW]
- [READING] When grandchildren don't come — [PD] + [NEW]

##### The mothering you didn't get

- [TAPPING] Tapping for the mothering you didn't get — cross-tag PARENTS — [NEW]
- [JOURNAL_PROMPT] Re-mothering yourself — where to start? — [NEW]
- [READING] Re-mothering — the work of giving yourself what wasn't given — [PD] + [NEW]

##### Generational patterns you're trying to break

- [TAPPING] Tapping for the patterns I am breaking — [NEW]
- [JOURNAL_PROMPT] Which pattern have I broken already? Which is hardest? — [NEW]
- [READING] Generational pattern breaking — [PD] + [NEW]
- [AFFIRMATION] I am breaking what wasn't mine to keep — [NEW]

##### Anger at your kids

- [TAPPING] Tapping for anger at the kids — [NEW]
- [READING] Anger as part of mothering, well — [PD] + [NEW]
- [JOURNAL_PROMPT] What does my anger want me to know? — [NEW]

##### Resentment of their needs

- [TAPPING] Tapping for resenting their needs — [NEW]
- [JOURNAL_PROMPT] What is my resentment really aimed at? — [NEW]
- [READING] When you resent your children's needs — and how to handle it — [PD] + [NEW]

##### Loving stay-at-home life but feeling unseen

- [TAPPING] Tapping for the unseen home work — [NEW]
- [AFFIRMATION] I am seen. The work I do is the work — [NEW]
- [JOURNAL_PROMPT] Where would I most like to be seen — and by whom? — [NEW]

##### Loving career and feeling guilty about it

- [TAPPING] Tapping for loving-the-job guilt — cross-tag BUSINESS — [NEW]
- [READING] Mother + career as a both — [PD] + [NEW]
- [AFFIRMATION] My loving my career doesn't take from them — [NEW]

##### The "mothering forever" weight

- [TAPPING] Tapping for "I'm always the mother" — [NEW]
- [JOURNAL_PROMPT] When do I get to not be the mother? — [NEW]
- [READING] Mothering forever — and the version of you that exists outside it — [NEW]

### Motherhood — reading entries

- [READING] Matrescence — what it is and why it matters — [PD] + [NEW]
- [READING] Mum guilt — the long answer — [PD] + [NEW]
- [READING] Mum rage — and what's underneath — [PD] + [NEW]
- [READING] Re-mothering yourself — the slow work — [PD] + [NEW]
- [READING] Generational pattern breaking — [PD] + [NEW]
- [READING] Modelling well for daughters and sons — [PD] + [NEW]
- [READING] The grief of every motherhood stage ending — [NEW]
- [READING] Mothering as the spiritual practice no one names — [NEW]

---

## 7. Business & purpose

~39 stuck-on points × 5 practices ≈ 195 entries. Sources: partial overlap
with `TRADING A 12-Week Tapping Program` (business decision work),
public-domain career / purpose / business literature, Rebecca-original
framing.

### Stuck-on points

##### Knowing your purpose

- [TAPPING] Tapping for "I don't know my purpose" — [NEW]
- [JOURNAL_PROMPT] What activity makes me lose track of time? — [NEW]
- [READING] Purpose as a practice, not a destination — [PD] + [NEW]
- [AFFIRMATION] My purpose unfolds as I move — [NEW]

##### Not feeling called to anything

- [TAPPING] Tapping for the not-called feeling — [NEW]
- [READING] When you don't feel "called" — and that's fine — [NEW]
- [JOURNAL_PROMPT] What if there's no calling — just choices? — [NEW]

##### The "what am I doing with my life" wall

- [TAPPING] Tapping for the mid-life wall — [NEW]
- [JOURNAL_PROMPT] What would I do this year if I knew it was the last? — [NEW]
- [READING] The mid-life "what am I doing" — and what to do with it — [PD] + [NEW]

##### Imposter syndrome

- [TAPPING] Tapping for imposter syndrome — [PD] + [NEW]
- [AFFIRMATION] I am qualified to be here — [NEW]
- [READING] Imposter syndrome — origin, exit — [PD] + [NEW]
- [JOURNAL_PROMPT] What evidence do I have that I belong here? — [NEW]

##### Visibility fear

- [TAPPING] Tapping for the visibility fear — cross-tag SELF_WORTH — [NEW]
- [READING] Visibility as a skill, not a personality — [PD] + [NEW]
- [JOURNAL_PROMPT] What does visible cost me, in my story? — [NEW]

##### Pricing your work

- [TAPPING] Tapping for pricing — cross-tag MONEY — [NEW]
- [AFFIRMATION] My price reflects my value, not my wobble — [NEW]
- [JOURNAL_PROMPT] What would I charge if I knew nobody would flinch? — [NEW]
- [READING] Pricing as energy, not strategy — [NEW]

##### Selling without feeling salesy

- [TAPPING] Tapping for "selling feels icky" — [NEW]
- [READING] Sales as service — [PD] + [NEW]
- [AFFIRMATION] Selling well is helping well — [NEW]
- [JOURNAL_PROMPT] When was a sale a service to me? — [NEW]

##### Boundaries with clients

- [TAPPING] Tapping for client boundaries — [NEW]
- [READING] Boundaries in client work — [PD] + [NEW]
- [AFFIRMATION] My boundaries serve the work — [NEW]

##### Difficult boss

- [TAPPING] Tapping for the difficult boss — [NEW]
- [JOURNAL_PROMPT] What does this boss need from me, that I'm not giving? Or what am I tolerating? — [NEW]
- [READING] Navigating a difficult boss — [PD] + [NEW]

##### Toxic workplace

- [TAPPING] Tapping for the toxic workplace — [NEW]
- [READING] When the job is harming you — [PD]
- [JOURNAL_PROMPT] What's the cost of staying? What's the cost of leaving? — [NEW]
- [AFFIRMATION] My wellbeing is not negotiable — [NEW]

##### Career break — returning after mat leave, illness, etc.

- [TAPPING] Tapping for the back-to-work return — [NEW]
- [READING] Returning to work after a break — [PD] + [NEW]
- [JOURNAL_PROMPT] What is the same about me now? What is different? — [NEW]

##### Going back to work post-break

- [TAPPING] Tapping for the post-break return — [NEW]
- [AFFIRMATION] I can re-enter and still be me — [NEW]

##### Starting a business — the fear

- [TAPPING] Tapping for "starting feels mad" — [NEW]
- [READING] Starting a business — the realistic start — [PD] + [NEW]
- [JOURNAL_PROMPT] What's the smallest first step that wouldn't terrify me? — [NEW]

##### The doubt spiral

- [TAPPING] Tapping for the business doubt spiral — [NEW]
- [READING] Doubt as a feature, not a stop sign — [NEW]
- [AFFIRMATION] My doubt is allowed to be loud and I keep moving — [NEW]

##### Comparison with peers in your field

- [TAPPING] Tapping for industry peer comparison — [NEW]
- [JOURNAL_PROMPT] Whose path triggers me? What of mine is enough? — [NEW]
- [READING] Comparison in your industry — [PD] + [NEW]

##### Late-bloomer pressure

- [TAPPING] Tapping for "I'm late" — cross-tag AGEING — [NEW]
- [AFFIRMATION] My timeline is mine — [NEW]
- [READING] The late-bloomer life and why it works — [PD] + [NEW]

##### Creative blocks

- [TAPPING] Tapping for the creative block — [NEW]
- [READING] Creative blocks — what they often actually are — [PD] + [NEW]
- [ACTIVITY] One small unblocking move — write 100 words, sketch, sing — [PD]

##### Burnout recovery

- [TAPPING] Tapping for the burnout recovery — cross-tag HEALTH — [NEW]
- [READING] Burnout recovery — the slow truth — [PD] + [NEW]
- [AFFIRMATION] My body deserves recovery, not productivity — [NEW]

##### Hating your job but needing the money

- [TAPPING] Tapping for the job I'm stuck in — [NEW]
- [JOURNAL_PROMPT] What's the smallest thing that would change in my day if it shifted? — [NEW]
- [READING] When you can't leave the job — [PD] + [NEW]

##### Quitting fear

- [TAPPING] Tapping for the quitting fear — [NEW]
- [READING] How to know when to quit — [PD] + [NEW]
- [JOURNAL_PROMPT] What does my body say about staying? — [NEW]

##### Building an audience

- [TAPPING] Tapping for the audience build — [NEW]
- [READING] Audience-building without the soul cost — [PD] + [NEW]
- [AFFIRMATION] My audience finds me. I show up. We meet — [NEW]

##### Niche-finding

- [TAPPING] Tapping for the niche question — [NEW]
- [JOURNAL_PROMPT] What do I keep talking about, even when no one asks? — [NEW]
- [READING] Finding the niche by following your own questions — [NEW]

##### Authenticity vs marketing

- [TAPPING] Tapping for the authenticity tension — [NEW]
- [READING] Marketing and not losing yourself — [PD] + [NEW]
- [JOURNAL_PROMPT] What can I say in my marketing that's still me? — [NEW]

##### Saying no to opportunities

- [TAPPING] Tapping for the no to opportunity — [NEW]
- [READING] Why "no" to good things is part of yes to great ones — [PD] + [NEW]
- [AFFIRMATION] My yes is sacred. So is my no — [NEW]

##### Letting go of the old career

- [TAPPING] Tapping to release the old career — cross-tag GRIEF — [NEW]
- [JOURNAL_PROMPT] What did the old career give me? What did it cost? — [NEW]
- [READING] Career grief — and the new shape it makes — [NEW]

##### Mid-life career pivot

- [TAPPING] Tapping for the mid-life pivot — [NEW]
- [READING] Pivoting in mid-life — [PD] + [NEW]

##### The artist's permission problem

- [TAPPING] Tapping for "I'm allowed to be an artist" — [NEW]
- [AFFIRMATION] My work is allowed to be art — [NEW]
- [READING] The artist's permission to be one — [PD] + [NEW]

##### Charging your worth

- [TAPPING] Tapping for "charging my worth" — cross-tag MONEY — [NEW]
- [READING] Worth and what it has to do with rates — [NEW]
- [AFFIRMATION] My price is allowed to honour my worth — [NEW]

##### Asking for raises

- [TAPPING] Tapping for the raise ask — cross-tag MONEY — [NEW]
- [ACTIVITY] Rehearse the ask aloud — three times — [PD]
- [JOURNAL_PROMPT] The number I am most afraid to say — [NEW]

##### The promotion vs principles dilemma

- [TAPPING] Tapping for the promotion-vs-principles question — [NEW]
- [JOURNAL_PROMPT] What does this promotion cost beyond hours? — [NEW]
- [READING] When the promotion isn't yes — [PD] + [NEW]

##### Working with toxic colleagues

- [TAPPING] Tapping for the difficult colleague — [NEW]
- [READING] Working with toxic colleagues without absorbing it — [PD] + [NEW]

##### The "what if I fail" loop

- [TAPPING] Tapping for the failure fear — [NEW]
- [AFFIRMATION] Failure teaches. Failure refines. Failure is not the end — [NEW]
- [READING] Failure as information — [PD] + [NEW]

##### The "what if I succeed" loop

- [TAPPING] Tapping for the success fear — [NEW]
- [JOURNAL_PROMPT] What does success cost me? Whom? — [NEW]
- [READING] When success scares you — [PD] + [NEW]

##### Stay-at-home identity — the claim

- [TAPPING] Tapping to claim the stay-at-home identity — [NEW]
- [AFFIRMATION] My work at home is the work — [NEW]
- [JOURNAL_PROMPT] What does my staying home build? — [NEW]

##### The "do I even want this?" honesty

- [TAPPING] Tapping for the "do I want this?" question — [NEW]
- [JOURNAL_PROMPT] If I knew it was okay to leave, would I? — [NEW]
- [READING] Wanting and not wanting — clarity practice — [NEW]

##### Side-hustle guilt

- [TAPPING] Tapping for side-hustle guilt — [NEW]
- [READING] Side-hustles in the time you have — without it owning you — [PD] + [NEW]

##### Multi-passionate identity

- [TAPPING] Tapping for "I have too many things" — [NEW]
- [AFFIRMATION] My many passions belong together — [NEW]
- [READING] The multi-passionate life — [PD] + [NEW]

##### The "I should have been further by now" comparison

- [TAPPING] Tapping for "further by now" — [NEW]
- [JOURNAL_PROMPT] Further by whose measure? — [NEW]
- [AFFIRMATION] Where I am is information, not a verdict — [NEW]

##### Tax / admin / business overwhelm

- [TAPPING] Tapping for business admin overwhelm — [NEW]
- [ACTIVITY] One admin task with a candle and tea — [PD]
- [READING] Tax / admin / spreadsheets — the soft entry — [NEW]

### Business & purpose — reading entries

- [READING] Purpose as a practice, not a destination — [PD] + [NEW]
- [READING] Imposter syndrome — origin and exit — [PD] + [NEW]
- [READING] Pricing as energy, not strategy — [NEW]
- [READING] The artist's permission problem — [PD] + [NEW]
- [READING] Late-bloomer life — and why it works — [PD] + [NEW]
- [READING] Career grief — the part no one names — [NEW]
- [READING] When success scares you — [PD] + [NEW]
- [READING] Tax / admin / spreadsheets — without dread — [NEW]

---

## 8. Home & lifestyle

~30 stuck-on points × 5 practices ≈ 150 entries. Sources: public-domain
slow-living, intentional living, seasonal living, homemaker-revival
writing, plus Rebecca-original framing because Homemade IS this category.

### Stuck-on points

##### The dream house you can see specifically

- [TAPPING] Tapping for the specific dream house — [NEW]
- [VISUALISATION] Standing in the hallway of the dream house — keys in hand — [PD]
- [ACTIVITY] Drive past the house. Once a week. For a year — [PD]
- [JOURNAL_PROMPT] Describe the dream house in 200 words — [NEW]
- [SPELL] The house spell — write the address, fold, tuck in your kitchen drawer — [PD]

##### The "if I had a bigger house" trap

- [TAPPING] Tapping for the bigger-house trap — [NEW]
- [JOURNAL_PROMPT] What would the bigger house actually fix? — [NEW]
- [AFFIRMATION] My home is enough today, while I build toward more — [NEW]
- [READING] The bigger-house illusion — [NEW]

##### Making your current home feel aspirational

- [TAPPING] Tapping for "this home, today" — [NEW]
- [ACTIVITY] One small upgrade in one room this week — [PD]
- [READING] How to make today's home feel like the dream — [NEW]
- [RITUAL] Light the candles even on Tuesday — [PD]

##### Decorating without spending

- [TAPPING] Tapping for "I can't afford to decorate" — [NEW]
- [READING] Decorating with what you have — [PD] + [NEW]
- [ACTIVITY] Rearrange one shelf today — [PD]
- [AFFIRMATION] Beauty doesn't have a price tag — [NEW]

##### Comparing your home to Instagram homes

- [TAPPING] Tapping for the home-comparison spiral — [NEW]
- [READING] The Instagram-home performance — and the cost — [NEW]
- [ACTIVITY] One unfollow this week — [PD]
- [AFFIRMATION] My home is lived in. It's allowed to be — [NEW]

##### Hosting fear / pressure

- [TAPPING] Tapping for hosting anxiety — [NEW]
- [READING] Hosting well, not perfectly — [PD] + [NEW]
- [AFFIRMATION] My friends come for me, not the cushions — [NEW]
- [ACTIVITY] One small dinner this month — [PD]

##### The kids-vs-aesthetic tension

- [TAPPING] Tapping for the lived-in vs beautiful tension — [NEW]
- [JOURNAL_PROMPT] What does a home with kids actually look like? — [NEW]
- [READING] Beautiful homes with children in them — real version — [NEW]

##### The "perfect home" myth

- [TAPPING] Tapping for the perfect-home myth — [NEW]
- [AFFIRMATION] Perfect is a trap. Real is the win — [NEW]
- [READING] The perfect-home myth — [NEW]

##### Wanting beautiful AND lived-in

- [TAPPING] Tapping for the both-and home — [NEW]
- [JOURNAL_PROMPT] What does beautiful-and-lived-in look like, in my home? — [NEW]
- [READING] Beautiful and lived-in — at once — [NEW]

##### Daily home rituals — the candle, the music

- [TAPPING] Tapping for the daily home ritual — [NEW]
- [RITUAL] Light the candle when you walk in — every day — [NEW]
- [READING] Small daily home rituals that change everything — [NEW]
- [ACTIVITY] Put on the playlist while you cook — [PD]

##### Weekly rituals — Sunday slow morning, Friday pizza

- [TAPPING] Tapping for the weekly anchor — [NEW]
- [RITUAL] The Sunday slow morning — anchor for the week — [NEW]
- [RITUAL] The Friday pizza ritual — anchor for the weekend — [NEW]
- [JOURNAL_PROMPT] What weekly anchor would shape my whole week? — [NEW]

##### Seasonal rituals

- [TAPPING] Tapping for "I want to live seasonally" — [NEW]
- [RITUAL] The first-day-of-each-season ritual — [NEW]
- [READING] Living seasonally — the gentle version — [PD] + [NEW]

##### Christmas / holiday-season home

- [TAPPING] Tapping for the Christmas pressure — [NEW]
- [RITUAL] One non-negotiable Christmas tradition — yours, intentionally — [NEW]
- [READING] Christmas without performance — [NEW]

##### The homemaker identity — claiming it without shame

- [TAPPING] Tapping for "I am a homemaker" — [NEW]
- [AFFIRMATION] My homemaking is my work, and my art — [NEW]
- [READING] Reclaiming homemaker as a feminist identity — [NEW]

##### The "anti-feminist" trap of loving homemaking

- [TAPPING] Tapping for the "is this anti-feminist?" anxiety — [NEW]
- [JOURNAL_PROMPT] What's the difference between conditioned home love and chosen home love? — [NEW]
- [READING] Loving homemaking, freely chosen — [NEW]

##### Slow living vs productivity guilt

- [TAPPING] Tapping for "I should be doing more" — cross-tag TIME — [NEW]
- [AFFIRMATION] My slow is productive in its own way — [NEW]
- [READING] Slow living as protest — [PD] + [NEW]

##### Cooking from scratch identity

- [TAPPING] Tapping for the cook-from-scratch life — [NEW]
- [READING] Cooking from scratch as identity, not chore — [NEW]
- [AFFIRMATION] What I make is part of how I love them — [NEW]

##### The clean-home cycle

- [TAPPING] Tapping for the clean-home guilt cycle — [NEW]
- [READING] When clean enough is the goal — [NEW]
- [RITUAL] The 15-minute tidy — once a day, no more — [PD]

##### Decluttering / minimising

- [TAPPING] Tapping for the decluttering paralysis — [NEW]
- [READING] Decluttering without the cult — [PD] + [NEW]
- [ACTIVITY] One drawer this week — [PD]

##### Maximalism permission

- [TAPPING] Tapping for the love of stuff — [NEW]
- [AFFIRMATION] My beautiful things are allowed — [NEW]
- [READING] Maximalism as joy, not failure — [NEW]

##### Living seasonally

- [TAPPING] Tapping for the seasonal pace — [NEW]
- [READING] Living with the seasons — practical steps — [PD] + [NEW]
- [RITUAL] One seasonal-shift ritual at each turn — [NEW]

##### Garden as part of home

- [TAPPING] Tapping for the garden-as-home truth — cross-tag GARDEN — [NEW]
- [READING] The home extends outside — [NEW]

##### The "home as work" exhaustion

- [TAPPING] Tapping for "the home is too much" — [NEW]
- [JOURNAL_PROMPT] What about my home is most heavy? — [NEW]
- [READING] When the home becomes the work — and how to ease that — [NEW]

##### Home as sanctuary

- [TAPPING] Tapping for "my home is my sanctuary" — [NEW]
- [JOURNAL_PROMPT] What does sanctuary mean to me, at home? — [NEW]
- [READING] Sanctuary at home — what it actually requires — [NEW]
- [RITUAL] The "home is sanctuary" doorway ritual — [NEW]

##### Moving / wanting to move

- [TAPPING] Tapping for the moving question — [NEW]
- [JOURNAL_PROMPT] What does this house no longer give us? — [NEW]
- [READING] When to move — the readiness signals — [PD] + [NEW]

##### Renting feeling temporary

- [TAPPING] Tapping for the rental home — [NEW]
- [AFFIRMATION] My rented home is still mine — [NEW]
- [ACTIVITY] One change that makes this rental feel like yours — [PD]
- [READING] Loving a rental — [PD] + [NEW]

##### The "this isn't my forever house" emotional weight

- [TAPPING] Tapping for the forever-house ache — [NEW]
- [JOURNAL_PROMPT] How can I love this house, even as I plan the next? — [NEW]

##### Home + ageing parents

- [TAPPING] Tapping for parents-in-the-house — cross-tag RELATIONSHIPS — [NEW]
- [READING] Multi-generational homes — the modern version — [PD] + [NEW]

##### Home + adult children returning

- [TAPPING] Tapping for the boomerang-child homecoming — [NEW]
- [JOURNAL_PROMPT] What needs to be different when they come back? — [NEW]
- [READING] When the adult children move home — [PD] + [NEW]

##### Building / extending / renovating overwhelm

- [TAPPING] Tapping for the build overwhelm — [NEW]
- [READING] Surviving the build / renovation — emotionally — [PD] + [NEW]
- [RITUAL] One thing in the half-renovated house that stays beautiful through it — [NEW]

### Home & lifestyle — reading entries

- [READING] Living seasonally — the gentle, gentle version — [PD] + [NEW]
- [READING] Homemaker reclaimed — what it means now — [NEW]
- [READING] Beautiful and lived-in — at once — [NEW]
- [READING] Slow living as protest — [PD] + [NEW]
- [READING] The Sunday slow morning — anatomy and rationale — [NEW]
- [READING] Decluttering without the cult — [PD] + [NEW]
- [READING] Maximalism as joy — [NEW]
- [READING] When the home becomes the work — [NEW]

---

## 9. Fear / blocks / trauma

~36 stuck-on points × 5 practices ≈ 180 entries. Sources: public-domain
trauma literature, nervous-system regulation research, somatic-experiencing
principles, polyvagal basics, plus Rebecca-original framing for the
overlap with everyday women's lives.

### Stuck-on points

##### The specific fear you can name

- [TAPPING] Tapping for the specific fear — [PD] + [NEW]
- [JOURNAL_PROMPT] Name the fear. Sit with it. What is it asking for? — [NEW]
- [AFFIRMATION] My fear is allowed to speak. I am the one who listens — [NEW]

##### Generalised dread without source

- [TAPPING] Tapping for the unnamed dread — [PD] + [NEW]
- [READING] When fear is everywhere and nowhere — [PD] + [NEW]
- [MEDITATION] Body scan to find where the dread lives — [PD]
- [JOURNAL_PROMPT] What is my body trying to tell me? — [NEW]

##### Fear of being seen

- [TAPPING] Tapping for fear of being seen — cross-tag SELF_WORTH — [NEW]
- [AFFIRMATION] Visible is safe — [NEW]

##### Fear of being alone

- [TAPPING] Tapping for the fear of being alone — [NEW]
- [READING] The fear of being alone — origin and exit — [PD] + [NEW]
- [JOURNAL_PROMPT] When was I last actually alone — and what happened? — [NEW]

##### Fear of being judged

- [TAPPING] Tapping for fear of judgment — [NEW]
- [AFFIRMATION] Their judgment is theirs to keep — [NEW]
- [READING] The cost of living to avoid judgment — [NEW]

##### Fear of failure

- [TAPPING] Tapping for fear of failure — cross-tag BUSINESS — [NEW]
- [AFFIRMATION] Failure teaches. I can survive it — [NEW]

##### Fear of success

- [TAPPING] Tapping for fear of success — [NEW]
- [JOURNAL_PROMPT] What does success cost me, in my story? — [NEW]
- [READING] Fear of success — origin and exit — [PD] + [NEW]

##### Fear of conflict / confrontation

- [TAPPING] Tapping for conflict avoidance — [NEW]
- [READING] Healthy conflict — the basics — [PD] + [NEW]
- [JOURNAL_PROMPT] What does conflict avoidance cost me? — [NEW]

##### Fear of disappointment

- [TAPPING] Tapping for fear of being disappointed — [NEW]
- [JOURNAL_PROMPT] Whose disappointment shaped me? — [NEW]

##### Fear of disappointing others

- [TAPPING] Tapping for fear of disappointing — cross-tag SELF_WORTH — [NEW]
- [AFFIRMATION] I am allowed to disappoint people sometimes — [NEW]

##### Fear of losing what you have

- [TAPPING] Tapping for the fear of losing — [NEW]
- [JOURNAL_PROMPT] What am I bracing to lose? — [NEW]
- [READING] When fear of loss runs the show — [PD] + [NEW]

##### Fear of getting what you want then losing it

- [TAPPING] Tapping for "I'll lose it if I get it" — cross-tag MONEY — [NEW]
- [AFFIRMATION] What's mine is allowed to stay — [NEW]

##### Fear of being abandoned

- [TAPPING] Tapping for abandonment fear — [PD] + [NEW]
- [READING] Abandonment fear — attachment basics — [PD] + [NEW]
- [JOURNAL_PROMPT] When did "they leave" first become a fear? — [NEW]

##### Fear of being trapped

- [TAPPING] Tapping for the trapped feeling — [NEW]
- [JOURNAL_PROMPT] What does freedom look like, that I'm not allowing? — [NEW]

##### The unnamed fear that runs your life

- [TAPPING] Tapping for the unnamed driver — [NEW]
- [JOURNAL_PROMPT] What am I doing on autopilot — and what's underneath? — [NEW]
- [READING] When fear runs your life invisibly — [NEW]

##### A specific past event you can't shake

- [TAPPING] Tapping for the event that won't leave — [PD] + [NEW]
- [READING] When the past stays in the body — [PD] + [NEW]
- [JOURNAL_PROMPT] What does this memory still need from me? — [NEW]

##### Sexual trauma

- [TAPPING] Tapping for sexual trauma — gentle entry — [PD] + [NEW]
- [READING] Sexual trauma — care first, work after — [PD]
- [AFFIRMATION] My body is mine — [NEW]

##### Medical trauma

- [TAPPING] Tapping for the medical trauma — [PD] + [NEW]
- [READING] Medical trauma — recognising it, healing it — [PD] + [NEW]
- [JOURNAL_PROMPT] What happened in that room, that still lives in me? — [NEW]

##### Birth trauma

- [TAPPING] Tapping for birth trauma — cross-tag MOTHERHOOD — [PD] + [NEW]
- [READING] Birth trauma basics — [PD]

##### Loss trauma

- [TAPPING] Tapping for traumatic loss — cross-tag GRIEF — [PD] + [NEW]
- [READING] When loss becomes trauma — [PD] + [NEW]

##### Self-sabotage as protection

- [TAPPING] Tapping for the self-sabotage as protection — [NEW]
- [JOURNAL_PROMPT] What is the sabotage trying to protect me from? — [NEW]
- [READING] Self-sabotage as a survival strategy — [PD] + [NEW]

##### The freeze response

- [TAPPING] Tapping for the freeze response — [PD] + [NEW]
- [READING] Freeze — what it is, how to thaw — [PD] + [NEW]
- [MEDITATION] Small movement to come out of freeze — [PD]

##### The fawn response — people-pleasing

- [TAPPING] Tapping for the fawn response — [PD] + [NEW]
- [READING] Fawn as a trauma response — [PD] + [NEW]
- [AFFIRMATION] My yes is honest, or it's not yes — [NEW]

##### Perfectionism as trauma response

- [TAPPING] Tapping for perfectionism-as-protection — cross-tag SELF_WORTH — [NEW]
- [READING] Perfectionism and trauma — [PD] + [NEW]

##### Hypervigilance

- [TAPPING] Tapping for the always-alert system — [PD] + [NEW]
- [READING] Hypervigilance — what it is, what helps — [PD] + [NEW]
- [MEDITATION] Five minutes of doing nothing — for the hypervigilant — [PD]

##### Generational trauma

- [TAPPING] Tapping for the inherited trauma — [PD] + [NEW]
- [READING] Generational trauma — basics — [PD] + [NEW]
- [JOURNAL_PROMPT] What lives in me that isn't mine? — [NEW]

##### Body-held trauma

- [TAPPING] Tapping for the body-held trauma — [PD] + [NEW]
- [READING] Trauma in the body — what to know — [PD]
- [MEDITATION] Body scan with kindness — [PD]

##### The "I should be over this" frustration

- [TAPPING] Tapping for "I should be over this by now" — [NEW]
- [AFFIRMATION] Healing has its own time — [NEW]
- [READING] When healing takes longer than expected — [PD] + [NEW]

##### Healing taking longer than expected

- [TAPPING] Tapping for the long heal — [NEW]
- [JOURNAL_PROMPT] What has actually shifted, even quietly? — [NEW]
- [AFFIRMATION] My healing is not on a clock — [NEW]

##### Trauma + relationships

- [TAPPING] Tapping for the trauma showing up in relationship — [NEW]
- [READING] Trauma in adult relationships — [PD] + [NEW]
- [JOURNAL_PROMPT] When does the old wound speak in this relationship? — [NEW]

##### Trauma + sex

- [TAPPING] Tapping for trauma + intimacy — cross-tag BODY — [PD] + [NEW]
- [READING] Sexual reclaiming after trauma — [PD]
- [AFFIRMATION] My body is allowed to go slow — [NEW]

##### Trauma + parenting — passing it on or not

- [TAPPING] Tapping for "I don't want to pass it on" — cross-tag MOTHERHOOD — [NEW]
- [READING] Generational pattern breaking in parenting — [PD] + [NEW]
- [AFFIRMATION] I am breaking what wasn't mine to keep — [NEW]

##### Trauma + work

- [TAPPING] Tapping for trauma in work — [NEW]
- [READING] When the workplace activates the old wound — [PD] + [NEW]

##### The therapy / no-therapy decision

- [TAPPING] Tapping for the therapy decision — [NEW]
- [READING] Therapy — when it's the right next step — [PD]
- [JOURNAL_PROMPT] What am I hoping therapy will do? — [NEW]

##### Medication decisions

- [TAPPING] Tapping for the medication decision — [PD] + [NEW]
- [READING] Medication for anxiety / depression — basics — [PD]
- [AFFIRMATION] Medication is a tool. I get to choose — [NEW]

##### The trauma triggered by current events / news

- [TAPPING] Tapping for the news-triggered fear — [NEW]
- [READING] News-cycle fear — when it crosses into trauma — [PD] + [NEW]
- [ACTIVITY] One day off the news this week — [PD]

### Fear — reading entries

- [READING] What fear actually is — the polyvagal basics — [PD] + [NEW]
- [READING] When fear is the body talking, not the mind — [PD] + [NEW]
- [READING] Trauma as a noun and a verb — what each means — [PD] + [NEW]
- [READING] The trauma responses — fight, flight, freeze, fawn — [PD] + [NEW]
- [READING] Healing in the body, the mind, the spirit — three layers — [PD] + [NEW]
- [READING] When tapping isn't enough — and when therapy is the path — [PD] + [NEW]
- [READING] Generational trauma — basics for women in the middle generation — [PD] + [NEW]

---

## 10. Time & overwhelm

~30 stuck-on points × 5 practices ≈ 150 entries. Sources: public-domain
calm / productivity-as-protest / slow-living, women's time-poverty
research, plus Rebecca-original framing.

### Stuck-on points

##### Never enough hours

- [TAPPING] Tapping for "never enough hours" — [NEW]
- [JOURNAL_PROMPT] What gets cut when there isn't enough? — [NEW]
- [AFFIRMATION] My time is allowed to be enough — [NEW]
- [READING] Why "not enough time" is rarely about time — [PD] + [NEW]

##### Always-catching-up feeling

- [TAPPING] Tapping for "I'm always behind" — [NEW]
- [JOURNAL_PROMPT] Behind whose schedule? — [NEW]
- [AFFIRMATION] I am where I am. There's no "behind" — [NEW]

##### Saying yes to too much

- [TAPPING] Tapping for the over-promised week — [NEW]
- [READING] Why women say yes — origin and exit — [PD] + [NEW]
- [ACTIVITY] Cancel one thing this week. With kindness — [PD]

##### Saying no without guilt

- [TAPPING] Tapping for the no — [NEW]
- [AFFIRMATION] No is allowed. No is whole — [NEW]
- [READING] The art of the no — [PD] + [NEW]

##### The mental load

- [TAPPING] Tapping for the mental load — cross-tag RELATIONSHIPS — [NEW]
- [JOURNAL_PROMPT] What am I tracking that nobody else is? — [NEW]
- [READING] The mental load — what it costs, how to share it — [PD] + [NEW]

##### Decision fatigue

- [TAPPING] Tapping for the decision-fatigued evening — [NEW]
- [READING] Decision fatigue — how it works — [PD] + [NEW]
- [ACTIVITY] Pre-decide tomorrow's three big decisions tonight — [PD]

##### "I'll do it when..." trap

- [TAPPING] Tapping for the "I'll do it when" loop — [NEW]
- [JOURNAL_PROMPT] What am I postponing until conditions are perfect? — [NEW]
- [AFFIRMATION] Now is also allowed — [NEW]

##### Procrastination

- [TAPPING] Tapping for the procrastination — [NEW]
- [READING] What procrastination actually is — [PD] + [NEW]
- [ACTIVITY] Five minutes on the thing you've avoided — [PD]

##### The Sunday-evening dread

- [TAPPING] Tapping for the Sunday-evening drop — [NEW]
- [READING] Sunday-evening dread — what it tells you — [NEW]
- [RITUAL] The Sunday wind-up — small gentle anchors before Monday — [NEW]

##### Monday-morning dread

- [TAPPING] Tapping for Monday-morning dread — [NEW]
- [JOURNAL_PROMPT] What about Monday is hardest? What's underneath? — [NEW]
- [RITUAL] The Monday morning anchor — soft, slow — [NEW]

##### Holiday-season overwhelm

- [TAPPING] Tapping for the Christmas overwhelm — [NEW]
- [READING] Surviving December — without performance — [NEW]
- [ACTIVITY] Cancel one non-essential thing on the December calendar — [PD]

##### School-year rhythm overwhelm

- [TAPPING] Tapping for the school-year tempo — [NEW]
- [JOURNAL_PROMPT] What about the school year is loudest? — [NEW]
- [READING] The school-year rhythm — surviving it well — [PD] + [NEW]

##### Half-term / summer childcare juggle

- [TAPPING] Tapping for the half-term juggle — cross-tag MOTHERHOOD — [NEW]
- [READING] Holidays with kids — without the burnout — [PD] + [NEW]

##### Mother / wife / worker / self balance

- [TAPPING] Tapping for the woman-of-many-roles weight — [NEW]
- [JOURNAL_PROMPT] Which role is loudest today? Which is starved? — [NEW]
- [READING] When you wear too many hats — [PD] + [NEW]

##### Body needs vs schedule

- [TAPPING] Tapping for body-needs vs calendar — cross-tag BODY — [NEW]
- [AFFIRMATION] My body's needs are not negotiable — [NEW]

##### Rest as resistance

- [TAPPING] Tapping for rest-as-protest — [NEW]
- [READING] Rest as resistance — [PD] + [NEW]
- [AFFIRMATION] My rest is not laziness. It is necessary — [NEW]

##### The "if I had more time I would" loop

- [TAPPING] Tapping for "if I had more time" — [NEW]
- [JOURNAL_PROMPT] What would I do with one extra hour today? — [NEW]
- [READING] Why "more time" rarely changes what we do with it — [NEW]

##### Phone / screen time as time-vampire

- [TAPPING] Tapping for the phone-time loss — [NEW]
- [READING] The phone as time thief — [PD] + [NEW]
- [ACTIVITY] One hour phone-free this evening — [PD]

##### Daily rhythm vs chaos

- [TAPPING] Tapping for the chaos-to-rhythm shift — [NEW]
- [READING] Daily rhythm — what's actually negotiable — [PD] + [NEW]
- [RITUAL] Three daily anchors — [NEW]

##### Morning routine guilt

- [TAPPING] Tapping for the "should I have a 5am routine" guilt — [NEW]
- [READING] The myth of the perfect morning routine — [PD] + [NEW]
- [AFFIRMATION] My morning can be whatever it needs to be — [NEW]

##### Evening winddown work

- [TAPPING] Tapping for the evening transition — [NEW]
- [RITUAL] The 20-minute evening winddown — [NEW]

##### Weekend recovery from the week

- [TAPPING] Tapping for "the weekend is for recovering" — [NEW]
- [JOURNAL_PROMPT] If weekends weren't recovery, what would they be? — [NEW]
- [READING] Weekends as life, not recovery — [NEW]

##### Burnout from sustained overwhelm

- [TAPPING] Tapping for sustained overwhelm — cross-tag HEALTH — [NEW]
- [READING] Burnout — recognising it, recovering from it — [PD] + [NEW]
- [AFFIRMATION] My body is asking. I am listening — [NEW]

##### The "I'm too busy" identity

- [TAPPING] Tapping for "I'm too busy" — [NEW]
- [JOURNAL_PROMPT] What does "busy" protect me from? — [NEW]
- [READING] Busy as identity — [NEW]

##### Calendar tetris

- [TAPPING] Tapping for the calendar-tetris life — [NEW]
- [READING] Stop playing calendar tetris — [PD] + [NEW]

##### Saying yes for the wrong reasons

- [TAPPING] Tapping for the unwise yes — [NEW]
- [JOURNAL_PROMPT] Which recent yes was for the wrong reason? — [NEW]

##### Reclaiming time after kids

- [TAPPING] Tapping for the post-baby time reclaim — cross-tag MOTHERHOOD — [NEW]
- [JOURNAL_PROMPT] What would I do with one hour all to myself? — [NEW]

##### Reclaiming time in a marriage

- [TAPPING] Tapping for time-with-partner reclaim — cross-tag RELATIONSHIPS — [NEW]
- [READING] Time as a love language in marriage — [PD] + [NEW]

##### Time for yourself — claiming it, defending it

- [TAPPING] Tapping for the defended hour — [NEW]
- [AFFIRMATION] My time is mine to defend — [NEW]
- [ACTIVITY] Block one hour this week. Defend it as if it were a meeting with the Queen — [PD]

##### The "I'll relax when..." trap

- [TAPPING] Tapping for "I'll relax when" — [NEW]
- [JOURNAL_PROMPT] What am I waiting for, that may never arrive? — [NEW]
- [READING] The "I'll relax when" trap — [PD] + [NEW]

### Time & overwhelm — reading entries

- [READING] Why time feels short for women — [PD] + [NEW]
- [READING] Rest as resistance — [PD] + [NEW]
- [READING] The mental load — what it is, how to lift it — [PD] + [NEW]
- [READING] The art of the no — [PD] + [NEW]
- [READING] Daily rhythm — what works, what doesn't — [PD] + [NEW]
- [READING] The "I'll relax when" trap — [NEW]

---

## 11. Joy & pleasure & play

~27 stuck-on points × 5 practices ≈ 135 entries. Sources: MANIFESTING
Phase 3, WEIGHT-LOSS Week 9, public-domain joy-as-practice, pleasure
activism, science of play.

### Stuck-on points

##### Forgetting what brings you joy

- [TAPPING] Tapping for "I don't know what brings me joy" — [NEW]
- [JOURNAL_PROMPT] When was the last time I was lost in joy? — [NEW]
- [ACTIVITY] Try one thing this week that used to make you happy as a teen — [PD]
- [AFFIRMATION] My joy is mine to remember — [NEW]

##### Guilt about pleasure

- [TAPPING] Tapping for pleasure guilt — [NEW]
- [READING] The guilt that women carry about pleasure — [PD] + [NEW]
- [AFFIRMATION] Pleasure is not theft — [NEW]

##### The "selfish" label on enjoyment

- [TAPPING] Tapping for "is it selfish to enjoy this?" — [NEW]
- [AFFIRMATION] My enjoyment is not selfish. It is generous — [NEW]
- [JOURNAL_PROMPT] Whose voice calls my pleasure selfish? — [NEW]

##### Pleasure deprivation as self-punishment

- [TAPPING] Tapping for self-imposed pleasure deprivation — [NEW]
- [READING] When you stop letting yourself enjoy — [PD] + [NEW]
- [JOURNAL_PROMPT] What am I punishing myself for, with deprivation? — [NEW]

##### Permission to play as an adult

- [TAPPING] Tapping for permission to play — [NEW]
- [ACTIVITY] Ten minutes of play today. No purpose. No outcome — [PD]
- [READING] Play in adulthood — [PD] + [NEW]
- [AFFIRMATION] I am allowed to play — [NEW]

##### Hobbies that feel pointless

- [TAPPING] Tapping for "is this hobby pointless?" — [NEW]
- [AFFIRMATION] My hobby doesn't need to be productive to count — [NEW]
- [JOURNAL_PROMPT] What hobby do I love that I have stopped doing? — [NEW]

##### Sensual pleasure — taste, touch, sound, smell, sight

- [TAPPING] Tapping for the five senses — [NEW]
- [ACTIVITY] One sense, one full minute, with attention — [PD]
- [MEDITATION] Five-senses scan — three minutes — [PD]
- [READING] The senses as portals — [PD] + [NEW]

##### Sex as pleasure — not just connection / duty

- [TAPPING] Tapping for sex as pleasure — cross-tag BODY — [NEW]
- [READING] Sex as pleasure (vs sex as performance) — [PD] + [NEW]
- [AFFIRMATION] My pleasure is the point — [NEW]

##### Eating for pleasure

- [TAPPING] Tapping for eating-for-pleasure — cross-tag BODY — [NEW]
- [ACTIVITY] Eat one meal slowly, alone, with full attention — [PD]
- [READING] Eating with pleasure — the long version — [PD] + [NEW]

##### Beauty as pleasure

- [TAPPING] Tapping for beauty as a pleasure source — cross-tag BODY — [NEW]
- [RITUAL] The five-minute beauty pleasure — slow oil, music, candle — [NEW]
- [JOURNAL_PROMPT] What does daily beauty give me? — [NEW]

##### Shopping for pleasure — without overspending

- [TAPPING] Tapping for joyful shopping — [NEW]
- [READING] Shopping as a pleasure practice — [NEW]
- [ACTIVITY] Browse one beautiful shop without buying — [PD]

##### Travel pleasure

- [TAPPING] Tapping for travel anticipation — [NEW]
- [READING] Why travel as practice matters — [PD] + [NEW]
- [JOURNAL_PROMPT] Where do I most want to go right now? — [NEW]

##### Small daily pleasures — good coffee, the candle

- [TAPPING] Tapping for the small daily pleasures — [NEW]
- [RITUAL] One small daily pleasure — non-negotiable — [NEW]
- [READING] The small daily pleasures that keep you alive — [NEW]

##### The "no time for joy" trap

- [TAPPING] Tapping for "I have no time for joy" — cross-tag TIME — [NEW]
- [JOURNAL_PROMPT] What's the smallest joy that fits into five minutes? — [NEW]

##### "Earn it first" approach to pleasure

- [TAPPING] Tapping for "earn it first" — [NEW]
- [AFFIRMATION] Pleasure is not a reward. It is a need — [NEW]
- [READING] The earn-it-first myth — [NEW]

##### Joy you used to feel that's gone

- [TAPPING] Tapping for "the joy I used to feel" — [NEW]
- [JOURNAL_PROMPT] What joy is dormant rather than gone? — [NEW]
- [READING] Reclaiming the joy you had — [NEW]

##### Joy in your relationship — real, not performed

- [TAPPING] Tapping for relationship joy — cross-tag RELATIONSHIPS — [NEW]
- [JOURNAL_PROMPT] What does real joy with my partner look like? — [NEW]
- [ACTIVITY] One small joy-creating gesture this week — [PD]

##### Joy with kids — without resentment

- [TAPPING] Tapping for joy in mothering — cross-tag MOTHERHOOD — [NEW]
- [JOURNAL_PROMPT] When was the last laugh with the kids? — [NEW]
- [READING] Joy as the daily mothering anchor — [NEW]

##### Playfulness as daily practice

- [TAPPING] Tapping for daily playfulness — [NEW]
- [RITUAL] One playful moment, daily — [NEW]
- [AFFIRMATION] I am allowed to be playful — [NEW]

##### Laughter — protecting / making time for

- [TAPPING] Tapping for laughter time — [NEW]
- [ACTIVITY] One thing that always makes you laugh — today — [PD]
- [READING] Why we need laughter, biologically — [PD]

##### Beauty in the everyday

- [TAPPING] Tapping for the beauty-in-the-everyday eye — [NEW]
- [READING] Noticing as a pleasure practice — [PD] + [NEW]
- [ACTIVITY] Photograph three beautiful ordinary things today — [PD]

##### Awe and wonder

- [TAPPING] Tapping for awe — [NEW]
- [READING] Awe as medicine — [PD] + [NEW]
- [ACTIVITY] Find one awe-worthy thing today — sky, child, leaf — [PD]

##### Receiving pleasure

- [TAPPING] Tapping for receiving pleasure — [NEW]
- [AFFIRMATION] I can receive without bracing — [NEW]
- [JOURNAL_PROMPT] What kind of pleasure do I most struggle to receive? — [NEW]

##### Sharing pleasure with others

- [TAPPING] Tapping for sharing pleasure — [NEW]
- [JOURNAL_PROMPT] Who would I most want to share a pleasure with? — [NEW]
- [ACTIVITY] One shared pleasure this week — small — [PD]

##### The pleasure of being alone

- [TAPPING] Tapping for solitude as pleasure — [NEW]
- [JOURNAL_PROMPT] What does alone-time give me, when it's chosen? — [NEW]
- [READING] The pleasure of being alone — [PD] + [NEW]

##### Joy as resistance to grind culture

- [TAPPING] Tapping for joy-as-resistance — cross-tag TIME — [NEW]
- [READING] Joy as resistance — [PD] + [NEW]
- [AFFIRMATION] My joy is not earned. It is a stance — [NEW]

##### Permission to spend on yourself for joy

- [TAPPING] Tapping for spending on yourself — cross-tag MONEY — [NEW]
- [AFFIRMATION] I am allowed to spend on my joy — [NEW]
- [ACTIVITY] Buy one small joy thing this week — for you — [PD]

### Joy — reading entries

- [READING] Joy as practice — [PD] + [NEW]
- [READING] Pleasure activism — what it is, what it offers — [PD]
- [READING] The senses as portals — [PD] + [NEW]
- [READING] Awe as medicine — [PD] + [NEW]
- [READING] The "earn it first" myth — [NEW]
- [READING] Joy as resistance — [PD] + [NEW]

---

## 12. Spirituality & intuition

~28 stuck-on points × 5 practices ≈ 140 entries. Sources: MANIFESTING
Phase 2 + Phase 4, Money-Zone "It is yours" thread, public-domain
spiritual literature (Christian, Buddhist, Pagan, secular contemplative),
prayer traditions, mystic writing, intuition / inner-knowing teaching.

### Believing in something bigger — frameworks

##### The "what do I actually believe" question

- [TAPPING] Tapping for the "what do I believe?" question — [NEW]
- [JOURNAL_PROMPT] Write what I believe in 200 words. No edit, no review — [NEW]
- [READING] The mid-life "what do I actually believe?" — [NEW]

##### Inherited religion — keeping / questioning / leaving

- [TAPPING] Tapping for the inherited religion — [NEW]
- [READING] Inherited religion and what to do with it — [PD] + [NEW]
- [JOURNAL_PROMPT] What of my inherited faith do I want to keep? — [NEW]

##### Spirituality vs religion

- [TAPPING] Tapping for "spiritual but not religious" — [NEW]
- [READING] Spirituality vs religion — the difference — [PD] + [NEW]
- [JOURNAL_PROMPT] What's the difference for me? — [NEW]

### Intuition & inner-knowing

##### Intuition feeling unreliable

- [TAPPING] Tapping for the doubted intuition — [NEW]
- [JOURNAL_PROMPT] When has my intuition been right? — [NEW]
- [READING] How to trust your intuition — [PD] + [NEW]
- [AFFIRMATION] My intuition is allowed to be reliable — [NEW]

##### Trusting your gut

- [TAPPING] Tapping for gut-trust — [NEW]
- [MEDITATION] Five-minute gut-check — [PD]
- [AFFIRMATION] My gut speaks. I am the one who listens — [NEW]

##### Inner voice vs anxiety — telling them apart

- [TAPPING] Tapping for the inner-voice / anxiety mix-up — [NEW]
- [READING] How to tell inner voice from anxiety — [NEW]
- [JOURNAL_PROMPT] What does each one sound like, in my body? — [NEW]

### Daily practice

##### Daily spiritual practice — what counts

- [TAPPING] Tapping for "what counts as spiritual practice?" — [NEW]
- [READING] Daily spiritual practice — the simple version — [PD] + [NEW]
- [RITUAL] One five-minute daily anchor — yours, simple — [NEW]

##### Prayer — in any form

- [TAPPING] Tapping for prayer as practice — [NEW]
- [READING] Prayer — the many forms it takes — [PD]
- [RITUAL] One sentence of prayer — daily, in any direction — [PD]
- [JOURNAL_PROMPT] What does prayer mean to me, beyond the rituals of childhood? — [NEW]

##### Connection to nature

- [TAPPING] Tapping for the nature-connection — [NEW]
- [READING] Nature as spiritual practice — [PD] + [NEW]
- [ACTIVITY] Ten minutes outside without a phone — daily — [PD]

##### The moon and cycles

- [TAPPING] Tapping for the moon-cycle work — [NEW]
- [READING] Moon work — the gentle entry — [PD] + [NEW]
- [RITUAL] New moon, full moon — two small monthly anchors — [PD]

##### The seasons as spiritual rhythm

- [TAPPING] Tapping for the seasonal rhythm — cross-tag HOME — [NEW]
- [READING] Living spiritually with the seasons — [PD] + [NEW]
- [RITUAL] Seasonal-shift ritual at each turn — [NEW]

### Big questions

##### Death / afterlife questions

- [TAPPING] Tapping for the afterlife question — [NEW]
- [JOURNAL_PROMPT] What do I want to believe? What do I actually? — [NEW]
- [READING] Death and what we believe about after — [PD]

##### Meaning at the spiritual level

- [TAPPING] Tapping for "what's the meaning?" — [NEW]
- [JOURNAL_PROMPT] What does my life mean — that I haven't named yet? — [NEW]
- [READING] Meaning-making in mid-life — [PD] + [NEW]

##### Suffering and why

- [TAPPING] Tapping for the suffering question — [NEW]
- [READING] Why suffering — the many answers — [PD]
- [JOURNAL_PROMPT] What has suffering taught me — even quietly? — [NEW]

##### God / source / universe — naming and relating

- [TAPPING] Tapping for what to call the bigger thing — [NEW]
- [JOURNAL_PROMPT] What name fits — and what relationship do I have with it? — [NEW]
- [READING] Naming the source — without dogma — [PD] + [NEW]

### Signs, synchronicity, magic

##### Synchronicity and signs

- [TAPPING] Tapping for trust in signs — [NEW]
- [JOURNAL_PROMPT] What sign has shown up lately, that I dismissed? — [NEW]
- [READING] Synchronicity — Jungian basics — [PD]
- [AFFIRMATION] I am paying attention to the signs — [NEW]

##### Manifesting as spiritual practice

- [TAPPING] Tapping for manifesting as devotion — cross-tag MONEY — MANIFESTING-v2/D*
- [READING] Manifesting as a spiritual frame — Money-Zone/* + [NEW]
- [JOURNAL_PROMPT] What does manifesting mean to me, beyond the technique? — [NEW]

##### The "is this real?" doubt

- [TAPPING] Tapping for "is any of this real?" — [NEW]
- [JOURNAL_PROMPT] What has my spiritual practice given me, regardless of whether it's "real"? — [NEW]
- [READING] The "is this real?" question — and the answer that softens it — [NEW]

##### The shame of being "woo"

- [TAPPING] Tapping for "woo shame" — [NEW]
- [AFFIRMATION] My spiritual practice is mine. Their judgment isn't — [NEW]
- [READING] The woo backlash and how to keep your practice — [NEW]

##### The shame of being religious in a secular world

- [TAPPING] Tapping for religion shame — [NEW]
- [AFFIRMATION] My faith doesn't have to apologise — [NEW]
- [READING] Being quietly religious in a secular era — [PD] + [NEW]

##### Mediumship / contact with the departed

- [TAPPING] Tapping for the contact-with-the-departed question — [NEW]
- [READING] What people mean by mediumship — [PD]
- [JOURNAL_PROMPT] What sign from a lost loved one would I welcome? — [NEW]

##### Astrology and self-knowledge

- [TAPPING] Tapping for astrology as self-knowing — [NEW]
- [READING] Astrology as personality work — [PD]
- [JOURNAL_PROMPT] What does my chart tell me, gently? — [NEW]

##### Tarot / oracle cards

- [TAPPING] Tapping for tarot as practice — [NEW]
- [READING] Tarot for self-reflection — [PD]
- [RITUAL] A one-card morning pull — [PD]

##### Energy work — does it work

- [TAPPING] Tapping for trust in energy work — [NEW]
- [READING] Energy work — what it is, what's known — [PD] + [NEW]

### The spiritually-shamed

##### The "I'm not spiritual enough" feeling

- [TAPPING] Tapping for "not spiritual enough" — [NEW]
- [AFFIRMATION] Spiritual practice isn't a competition — [NEW]
- [JOURNAL_PROMPT] What does enough-spiritual look like? — [NEW]

##### Sacred / mundane integration

- [TAPPING] Tapping for sacred in the mundane — [NEW]
- [READING] The sacred in the everyday — [PD] + [NEW]
- [JOURNAL_PROMPT] What in my daily life is already sacred? — [NEW]

##### The dark night of the soul

- [TAPPING] Tapping for the dark night — [NEW]
- [READING] The dark night of the soul — the long view — [PD] + [NEW]
- [AFFIRMATION] The darkness is allowed to last as long as it needs — [NEW]

##### Faith after loss

- [TAPPING] Tapping for faith after grief — cross-tag GRIEF — [NEW]
- [READING] When loss tests faith — [PD] + [NEW]
- [JOURNAL_PROMPT] What of my faith did the loss break? What did it leave? — [NEW]

### Spirituality — reading entries

- [READING] The mid-life spiritual reset — [PD] + [NEW]
- [READING] Intuition vs anxiety — telling them apart — [NEW]
- [READING] Manifesting as a spiritual frame (not a hack) — Money-Zone + [NEW]
- [READING] The woo backlash — and how to keep your practice — [NEW]
- [READING] Living spiritually with the seasons — [PD] + [NEW]
- [READING] Prayer — the many forms it takes — [PD]
- [READING] The dark night of the soul — [PD] + [NEW]

---

## 13. Health (anxiety, hormonal, chronic)

~33 stuck-on points × 5 practices ≈ 165 entries. Sources: public-domain
anxiety / chronic-illness / mental-health management / doctor-patient
navigation, plus Rebecca-original framing. Heavy cross-tagging with Body,
Fear, Time.

### Mental health

##### Generalised anxiety

- [TAPPING] Tapping for generalised anxiety — [PD] + [NEW]
- [READING] What anxiety is, biologically — [PD]
- [MEDITATION] Long-exhale breath, six rounds — [PD]
- [AFFIRMATION] My anxiety is information, not identity — [NEW]
- [READING] Anxiety in women — the under-discussed shape — [PD] + [NEW]

##### Panic attacks

- [TAPPING] Tapping during the panic — short version — [PD] + [NEW]
- [READING] Panic attacks — what's happening, what helps — [PD]
- [MEDITATION] 5-4-3-2-1 grounding — [PD]
- [AFFIRMATION] This will pass. I am safe — [NEW]

##### Health anxiety / hypochondria

- [TAPPING] Tapping for health anxiety — [PD] + [NEW]
- [READING] Health anxiety — the loop and the exit — [PD] + [NEW]
- [JOURNAL_PROMPT] What is my health anxiety actually protecting? — [NEW]

##### Depression

- [TAPPING] Tapping in depression — small acts — [PD] + [NEW]
- [READING] Living with depression — basics — [PD]
- [AFFIRMATION] My depression is not my fault — [NEW]
- [ACTIVITY] One small thing today. Just one — [PD]

##### ADHD diagnosis — late-in-life

- [TAPPING] Tapping for the late ADHD diagnosis — [NEW]
- [READING] Late-diagnosis ADHD in women — [PD] + [NEW]
- [JOURNAL_PROMPT] What does this diagnosis explain? — [NEW]

##### Autism diagnosis — late-in-life

- [TAPPING] Tapping for the late autism diagnosis — [NEW]
- [READING] Late-diagnosis autism in women — [PD] + [NEW]
- [AFFIRMATION] I have always been this. Now I have language — [NEW]

##### A specific diagnosis you're carrying

- [TAPPING] Tapping for the diagnosis I just received — [NEW]
- [READING] After diagnosis — the emotional layer — [PD] + [NEW]
- [JOURNAL_PROMPT] What does this diagnosis ask of me? — [NEW]

### Chronic illness

##### Chronic illness — autoimmune

- [TAPPING] Tapping for the autoimmune body — [PD] + [NEW]
- [READING] Autoimmune basics — mindset support — [PD] + [NEW]
- [AFFIRMATION] My body is doing its best — [NEW]

##### Chronic pain

- [TAPPING] Tapping for chronic pain — cross-tag BODY — [PD] + [NEW]
- [READING] Living with chronic pain — mindset side — [PD] + [NEW]
- [MEDITATION] Pain-accepting body scan — [PD]

##### Migraine

- [TAPPING] Tapping for the migraine onset — [PD] + [NEW]
- [READING] Migraines — what helps, what doesn't — [PD]
- [RITUAL] The dark-room ritual — emergency comfort — [PD]

##### IBS / digestive issues

- [TAPPING] Tapping for the IBS flare — [PD] + [NEW]
- [READING] IBS and the gut-brain axis — [PD]
- [MEDITATION] Belly-soothing visualisation — [PD]

##### Endometriosis

- [TAPPING] Tapping for the endometriosis pain — cross-tag BODY — [PD] + [NEW]
- [READING] Endometriosis — what to know — [PD]
- [AFFIRMATION] My pain is real. I deserve good care — [NEW]

##### PCOS

- [TAPPING] Tapping for PCOS — cross-tag BODY — [PD] + [NEW]
- [READING] PCOS basics — [PD]

##### Thyroid issues

- [TAPPING] Tapping for thyroid struggles — [PD] + [NEW]
- [READING] Thyroid 101 for women — [PD]

##### Long COVID

- [TAPPING] Tapping for the long-COVID body — [PD] + [NEW]
- [READING] Long COVID — mindset support — [PD]
- [AFFIRMATION] My recovery has its own pace — [NEW]

### Navigation

##### The doctor visit dread

- [TAPPING] Tapping for the doctor-visit dread — [NEW]
- [READING] How to advocate at the doctor — [PD] + [NEW]
- [ACTIVITY] Symptom list before the next appointment — [PD]

##### Test results waiting

- [TAPPING] Tapping for the test-result wait — [NEW]
- [AFFIRMATION] The not-knowing is the hardest. I am holding it — [NEW]
- [MEDITATION] Five-minute settle — for the wait — [PD]

##### Side effects of medication

- [TAPPING] Tapping for the medication side effects — [NEW]
- [READING] Side effects — what to track — [PD]
- [JOURNAL_PROMPT] What's changed in my body since starting? — [PD]

##### The "no one knows what's wrong" frustration

- [TAPPING] Tapping for the undiagnosed years — [NEW]
- [AFFIRMATION] My experience is real, even unmeasured — [NEW]
- [READING] Living without a diagnosis — [PD] + [NEW]

##### Disability + identity

- [TAPPING] Tapping for the disability identity — [NEW]
- [READING] Identity and disability — [PD] + [NEW]
- [AFFIRMATION] I am still entirely me — [NEW]

##### Energy management with illness

- [TAPPING] Tapping for the spoon-theory energy — [NEW]
- [READING] Spoon theory — the basics — [PD]
- [JOURNAL_PROMPT] What does my energy budget look like today? — [PD]

##### Pacing yourself

- [TAPPING] Tapping for the pacing practice — [NEW]
- [READING] Pacing — the slow art — [PD] + [NEW]
- [AFFIRMATION] Pacing is care, not weakness — [NEW]

##### Saying no because of health

- [TAPPING] Tapping for the health-led no — cross-tag TIME — [NEW]
- [AFFIRMATION] My health gets to be the reason — [NEW]
- [JOURNAL_PROMPT] What am I forcing past my body's limits? — [NEW]

##### Cancer journey (yours)

- [TAPPING] Tapping through cancer — small daily acts — [PD] + [NEW]
- [READING] The emotional shape of cancer — [PD]
- [AFFIRMATION] My body is fighting for me — [NEW]

##### Cancer in the family

- [TAPPING] Tapping for a family-member's cancer — cross-tag GRIEF — [NEW]
- [READING] Loving someone through cancer — [PD] + [NEW]

##### A loved one's illness

- [TAPPING] Tapping for the caregiver weight — [NEW]
- [READING] Caregiver burnout — [PD]
- [AFFIRMATION] My care for them includes care for me — [NEW]

##### Caregiving fatigue

- [TAPPING] Tapping for the long-term caregiving fatigue — cross-tag TIME — [PD] + [NEW]
- [READING] Caregiver fatigue — the long version — [PD] + [NEW]

##### Mental health stigma

- [TAPPING] Tapping for the stigma around your diagnosis — [NEW]
- [READING] The stigma — and what to do with it — [PD] + [NEW]
- [AFFIRMATION] My diagnosis is not a moral failure — [NEW]

##### Therapy / medication / self-care navigation

- [TAPPING] Tapping for the treatment decisions — [NEW]
- [READING] Therapy, medication, self-care — how they fit — [PD] + [NEW]
- [JOURNAL_PROMPT] Which support do I need most right now? — [NEW]

##### The "I should be better by now" pressure

- [TAPPING] Tapping for "should be better by now" — [NEW]
- [AFFIRMATION] Healing has no schedule — [NEW]
- [READING] When healing takes longer than expected — [PD] + [NEW]

##### The grief of a body that doesn't work the way it used to

- [TAPPING] Tapping for the body-change grief — cross-tag GRIEF — [NEW]
- [JOURNAL_PROMPT] What did my body used to do that it no longer can? — [NEW]
- [READING] Grieving the body that was — [PD] + [NEW]

##### Children with health conditions

- [TAPPING] Tapping for the child's diagnosis — cross-tag MOTHERHOOD — [NEW]
- [READING] When your child is diagnosed — [PD]
- [AFFIRMATION] My care is enough. So is my asking for help — [NEW]

##### Partner with health conditions

- [TAPPING] Tapping for the partner's illness — cross-tag RELATIONSHIPS — [NEW]
- [READING] Loving a partner with chronic illness — [PD] + [NEW]

### Health — reading entries

- [READING] Anxiety in women — the under-discussed shape — [PD] + [NEW]
- [READING] Living with chronic pain — mindset side — [PD] + [NEW]
- [READING] How to advocate at the doctor — [PD] + [NEW]
- [READING] Pacing — the slow art — [PD] + [NEW]
- [READING] The grief of a body that's changed — [PD] + [NEW]
- [READING] Caregiver burnout — [PD]
- [READING] Therapy, medication, self-care — how they fit — [PD] + [NEW]

---

## 14. Grief & loss

~38 stuck-on points × 5 practices ≈ 190 entries. Sources: public-domain
grief literature, modern grief writing, loss research, plus Rebecca-
original framing.

### Stuck-on points

##### A specific person you lost

- [TAPPING] Tapping for the specific loss — [PD] + [NEW]
- [JOURNAL_PROMPT] A letter to them, today — [NEW]
- [RITUAL] Light a candle for them — daily, briefly — [PD]
- [AFFIRMATION] My grief is the shape of my love — [NEW]

##### Loss of a parent

- [TAPPING] Tapping for the parent-loss — [PD] + [NEW]
- [READING] When a parent dies — [PD]
- [JOURNAL_PROMPT] What did I lose when I lost them, beyond them? — [NEW]
- [RITUAL] The parent-honouring ritual — [NEW]

##### Loss of a partner

- [TAPPING] Tapping for the partner-loss — [PD] + [NEW]
- [READING] Widowhood — [PD]
- [AFFIRMATION] I am still whole. We are still us, in some shape — [NEW]

##### Loss of a child

- [TAPPING] Tapping for the child-loss — gentle entry — [PD] + [NEW]
- [READING] Grieving a child — [PD]
- [RITUAL] A naming ritual — [NEW]
- [AFFIRMATION] I am still their mother — [NEW]

##### Loss of a friend

- [TAPPING] Tapping for the friend-loss — [PD] + [NEW]
- [READING] When a friend dies — [PD] + [NEW]

##### Loss of a sibling

- [TAPPING] Tapping for the sibling-loss — [PD] + [NEW]
- [READING] Sibling grief — [PD]

##### Loss of a pet

- [TAPPING] Tapping for the pet-loss — [PD] + [NEW]
- [READING] Pet grief is real grief — [PD]
- [RITUAL] A small ceremony for the pet — [PD]

##### Sudden vs anticipated loss

- [TAPPING] Tapping for the sudden / anticipated divide — [NEW]
- [READING] Sudden vs anticipated loss — the difference — [PD] + [NEW]

##### Grief isn't linear

- [TAPPING] Tapping for the non-linear grief — [NEW]
- [READING] Grief isn't linear — [PD] + [NEW]
- [AFFIRMATION] My grief is allowed to come and go — [NEW]

##### Anniversary grief — the date hits

- [TAPPING] Tapping for the anniversary wave — [NEW]
- [READING] Anniversary grief — what to expect — [PD] + [NEW]
- [RITUAL] An anniversary ritual — [NEW]

##### Trigger objects — their clothes, their handwriting

- [TAPPING] Tapping for the trigger object — [NEW]
- [JOURNAL_PROMPT] What does this object hold of them? — [NEW]
- [READING] Trigger objects in grief — [PD] + [NEW]

##### Trigger smells

- [TAPPING] Tapping for the trigger smell — [NEW]
- [READING] Smell and grief — the neuroscience — [PD]

##### The "I should be over it" pressure

- [TAPPING] Tapping for "I should be over it" — [NEW]
- [AFFIRMATION] My grief has no expiry date — [NEW]
- [READING] Why "over it" is the wrong frame — [PD] + [NEW]

##### Grief and being a mother

- [TAPPING] Tapping for mothering while grieving — cross-tag MOTHERHOOD — [NEW]
- [READING] Grief in the middle of mothering — [PD] + [NEW]
- [AFFIRMATION] I am allowed to grieve and mother at once — [NEW]

##### Grief and your work

- [TAPPING] Tapping for grief at work — cross-tag BUSINESS — [NEW]
- [READING] Grief and the workplace — [PD] + [NEW]

##### Grief and your marriage

- [TAPPING] Tapping for grief in the marriage — cross-tag RELATIONSHIPS — [NEW]
- [READING] Grief and partnership — [PD] + [NEW]

##### Joy after loss — permission

- [TAPPING] Tapping for permission to feel joy again — [NEW]
- [AFFIRMATION] My joy honours them, doesn't betray them — [NEW]
- [JOURNAL_PROMPT] What joy am I afraid to let in? — [NEW]
- [READING] Joy after loss — [PD] + [NEW]

##### Re-engaging with life

- [TAPPING] Tapping for re-engagement — [NEW]
- [READING] Re-engaging after loss — [PD] + [NEW]
- [ACTIVITY] One small re-engagement this week — [PD]

##### Loss of a relationship — divorce

- [TAPPING] Tapping for divorce grief — cross-tag RELATIONSHIPS — [PD] + [NEW]
- [READING] Divorce as grief — [PD] + [NEW]
- [AFFIRMATION] Divorce is loss, not failure — [NEW]

##### Loss of a relationship — breakup

- [TAPPING] Tapping for the breakup grief — [NEW]
- [READING] Breakup grief — [PD] + [NEW]

##### Loss of a friendship

- [TAPPING] Tapping for the lost friendship — cross-tag RELATIONSHIPS — [NEW]
- [READING] Friendship loss as grief — [PD] + [NEW]

##### Loss of identity — career change

- [TAPPING] Tapping for the career grief — cross-tag BUSINESS — [NEW]
- [READING] Career identity loss — [NEW]

##### Loss of identity — kids leaving

- [TAPPING] Tapping for empty-nest grief — cross-tag MOTHERHOOD — [NEW]
- [READING] Empty-nest grief — [PD] + [NEW]

##### Loss of identity — illness

- [TAPPING] Tapping for illness-led identity loss — cross-tag HEALTH — [NEW]

##### Loss of health

- [TAPPING] Tapping for the health-loss grief — [NEW]
- [READING] Grieving a health-state that's gone — [PD] + [NEW]

##### Loss of fertility

- [TAPPING] Tapping for the fertility loss — cross-tag BODY — [NEW]
- [READING] Fertility loss and the slow goodbye — [PD] + [NEW]
- [RITUAL] A ceremony for what didn't happen — [NEW]

##### Miscarriage

- [TAPPING] Tapping for miscarriage grief — cross-tag MOTHERHOOD — [PD] + [NEW]
- [READING] Miscarriage — the under-recognised grief — [PD]
- [AFFIRMATION] My loss is real — [NEW]

##### Loss of a pregnancy

- [TAPPING] Tapping for any pregnancy loss — [PD] + [NEW]
- [READING] Pregnancy loss — [PD]

##### Loss of a future you imagined

- [TAPPING] Tapping for the future that won't happen — [NEW]
- [JOURNAL_PROMPT] What life did I lose, that I hadn't lived yet? — [NEW]
- [READING] Grieving an unlived future — [PD] + [NEW]

##### Estrangement — the alive but lost

- [TAPPING] Tapping for the estrangement grief — cross-tag RELATIONSHIPS — [NEW]
- [READING] Estrangement as ambiguous loss — [PD] + [NEW]

##### Ambiguous loss — addiction

- [TAPPING] Tapping for loving someone in addiction — [NEW]
- [READING] Ambiguous loss — addiction edition — [PD] + [NEW]

##### Ambiguous loss — dementia

- [TAPPING] Tapping for loving someone with dementia — [NEW]
- [READING] Loving someone with dementia — the long goodbye — [PD]

##### The first holiday without them

- [TAPPING] Tapping for the first Christmas without them — [NEW]
- [READING] Holidays in grief — [PD] + [NEW]
- [RITUAL] A space-for-them ritual in the holiday — [NEW]

##### Their birthday

- [TAPPING] Tapping for their birthday after they're gone — [NEW]
- [RITUAL] Honouring their birthday — [PD]

##### Their stuff — what to keep

- [TAPPING] Tapping for sorting through their belongings — [NEW]
- [JOURNAL_PROMPT] What do I want to keep? What's okay to let go? — [NEW]
- [READING] What to do with their things — [PD] + [NEW]

##### Talking to them after they're gone

- [TAPPING] Tapping for the conversation that continues — [NEW]
- [READING] Continuing bonds — grief theory — [PD]
- [RITUAL] A weekly check-in conversation — [NEW]

##### Signs from them

- [TAPPING] Tapping for openness to signs — [NEW]
- [JOURNAL_PROMPT] What sign would I welcome? — [NEW]
- [READING] Signs from the departed — what to make of them — [PD] + [NEW]

##### Carrying their legacy

- [TAPPING] Tapping for carrying the legacy — [NEW]
- [JOURNAL_PROMPT] What of them lives in me? — [NEW]
- [READING] Legacy as a living practice — [PD] + [NEW]

### Grief — reading entries

- [READING] Grief isn't linear — [PD] + [NEW]
- [READING] Continuing bonds — the theory and the practice — [PD] + [NEW]
- [READING] Anniversary grief — what to expect — [PD] + [NEW]
- [READING] Ambiguous loss — the kinds we don't name — [PD] + [NEW]
- [READING] Joy after loss — permission and pace — [PD] + [NEW]
- [READING] Grief in the middle of mothering — [PD] + [NEW]
- [READING] Holidays in grief — [PD] + [NEW]
- [READING] When the grief surprises you, years later — [PD] + [NEW]

---

## 15. Forgiveness

~25 stuck-on points × 5 practices ≈ 125 entries. Sources: public-domain
forgiveness research (Frederick Luskin's frame), Jewish / Christian /
Buddhist forgiveness traditions, restorative-justice principles, plus
Rebecca-original framing.

### Stuck-on points

##### The person you can't forgive

- [TAPPING] Tapping for the unforgivable person — [PD] + [NEW]
- [JOURNAL_PROMPT] What would forgiving them cost me? — [NEW]
- [AFFIRMATION] Forgiveness is mine to choose, on my time — [NEW]
- [READING] When you can't forgive — and what to do — [PD] + [NEW]

##### The thing that happened you can't get past

- [TAPPING] Tapping for the event I can't release — [NEW]
- [JOURNAL_PROMPT] What does the event still want me to know? — [NEW]
- [READING] Healing what won't fully heal — [PD] + [NEW]

##### Forgiving yourself for something you did

- [TAPPING] Tapping for self-forgiveness — [NEW]
- [AFFIRMATION] I am allowed to forgive myself — [NEW]
- [READING] Self-forgiveness — the practice — [PD] + [NEW]
- [RITUAL] A self-forgiveness ritual — write, name, release — [NEW]

##### Forgiving yourself for something you didn't do

- [TAPPING] Tapping for the things I didn't do — [NEW]
- [JOURNAL_PROMPT] What inaction do I most regret? — [NEW]
- [AFFIRMATION] I forgive me, for not knowing then what I know now — [NEW]

##### Conditional forgiveness — "when they apologise"

- [TAPPING] Tapping for the wait-for-apology trap — [NEW]
- [READING] When forgiveness without apology is possible — [PD] + [NEW]
- [JOURNAL_PROMPT] What would change if I stopped waiting? — [NEW]

##### Forgiveness without reconciliation

- [TAPPING] Tapping for forgiveness without return — [NEW]
- [READING] Forgive without reconciling — the practice — [PD] + [NEW]
- [AFFIRMATION] I can forgive and stay distant — [NEW]

##### Forgiving a parent

- [TAPPING] Tapping for forgiving a parent — cross-tag RELATIONSHIPS — [PD] + [NEW]
- [READING] Forgiving your parents — the long view — [PD] + [NEW]
- [JOURNAL_PROMPT] What of them do I see now, that I didn't before? — [NEW]

##### Forgiving a partner

- [TAPPING] Tapping for forgiving the partner — [NEW]
- [READING] Forgiveness in marriage — [PD] + [NEW]

##### Forgiving an ex

- [TAPPING] Tapping for forgiving an ex — [NEW]
- [JOURNAL_PROMPT] What does forgiving him give me back? — [NEW]

##### Forgiving a friend who hurt you

- [TAPPING] Tapping for forgiving the friend — [NEW]
- [READING] Forgiveness in friendship — [PD] + [NEW]

##### Forgiving yourself for hurting others

- [TAPPING] Tapping for forgiving yourself for the harm — [NEW]
- [READING] When you were the one who hurt them — [PD] + [NEW]
- [JOURNAL_PROMPT] What did you do? What did you learn? — [NEW]

##### Forgiveness as a process, not an event

- [TAPPING] Tapping for the long arc of forgiveness — [NEW]
- [READING] Forgiveness as practice, not moment — [PD] + [NEW]
- [AFFIRMATION] Forgiveness can be revisited, not finished — [NEW]

##### The anger underneath

- [TAPPING] Tapping for the buried anger — [NEW]
- [JOURNAL_PROMPT] Where does my anger sit? What is it pointing at? — [NEW]
- [READING] Anger as the precursor to forgiveness — [PD] + [NEW]

##### The resentment you've been carrying for years

- [TAPPING] Tapping for the long-held resentment — [NEW]
- [READING] Resentment as a slow tax — [PD] + [NEW]
- [JOURNAL_PROMPT] What has carrying this cost me? — [NEW]

##### The grudge you didn't know you had

- [TAPPING] Tapping for the discovered grudge — [NEW]
- [JOURNAL_PROMPT] Which grudge has been running my life invisibly? — [NEW]
- [READING] Grudges that hide in plain sight — [NEW]

##### The story you keep telling about what happened

- [TAPPING] Tapping for the story I keep telling — [NEW]
- [JOURNAL_PROMPT] What story do I tell about this? Is it true? — [NEW]
- [READING] When your story becomes your prison — [PD] + [NEW]

##### Letting go of being right

- [TAPPING] Tapping for the need to be right — [NEW]
- [AFFIRMATION] Being right is allowed to matter less — [NEW]
- [JOURNAL_PROMPT] What does being right protect me from? — [NEW]

##### Forgiveness vs accountability

- [TAPPING] Tapping for the forgiveness vs accountability tension — [NEW]
- [READING] Forgiveness doesn't mean letting them off — [PD] + [NEW]

##### Forgiveness vs trust

- [TAPPING] Tapping for "forgive but trust again?" — [NEW]
- [READING] Forgiveness and trust are not the same — [PD] + [NEW]

##### Boundaries after forgiveness

- [TAPPING] Tapping for boundaries after forgiveness — [NEW]
- [READING] The boundary that follows the forgiveness — [PD] + [NEW]

##### "I should forgive but I don't want to" honesty

- [TAPPING] Tapping for "I don't want to forgive yet" — [NEW]
- [AFFIRMATION] I am allowed to not be ready — [NEW]
- [JOURNAL_PROMPT] What would have to change for me to want to? — [NEW]

##### Forgiving generations of family

- [TAPPING] Tapping for the generational forgiveness — [NEW]
- [READING] Forgiving back through the line — [PD] + [NEW]
- [RITUAL] An ancestor-forgiveness ritual — [NEW]

##### Forgiving systems — workplace, institution, government

- [TAPPING] Tapping for the systemic forgiveness — [NEW]
- [READING] Forgiving systems without excusing them — [NEW]

##### Forgiving the universe / God for what happened

- [TAPPING] Tapping for "I'm angry at the universe" — cross-tag SPIRITUALITY — [NEW]
- [READING] Forgiving God / the universe — [PD]
- [JOURNAL_PROMPT] What do I want the universe to know? — [NEW]

##### Forgiving life

- [TAPPING] Tapping for forgiving life itself — [NEW]
- [AFFIRMATION] Life is allowed to be hard. I am allowed to keep loving it — [NEW]
- [READING] Forgiving life on its own terms — [NEW]

### Forgiveness — reading entries

- [READING] What forgiveness is, what it isn't — [PD] + [NEW]
- [READING] Forgiveness as practice, not moment — [PD] + [NEW]
- [READING] When you can't forgive yet — and that's information — [PD] + [NEW]
- [READING] Forgiveness without reconciliation — [PD] + [NEW]
- [READING] Self-forgiveness — the under-practiced skill — [PD] + [NEW]
- [READING] The cost of resentment, year on year — [PD] + [NEW]

---

## 16. Ageing & seasons

~35 stuck-on points × 5 practices ≈ 175 entries. Sources: public-domain
ageing literature, Stages-of-life / Eriksonian frame, modern menopause /
mid-life writing, plus Rebecca-original framing.

### Stuck-on points

##### Turning 40

- [TAPPING] Tapping for turning 40 — [NEW]
- [JOURNAL_PROMPT] What did 39-year-old me believe about 40? Was she right? — [NEW]
- [READING] 40 as a beginning — [PD] + [NEW]
- [RITUAL] A 40th honouring — [NEW]

##### Turning 50

- [TAPPING] Tapping for turning 50 — [NEW]
- [READING] 50 — the under-rated decade — [PD] + [NEW]
- [JOURNAL_PROMPT] What do I want this decade to be? — [NEW]

##### Turning 60+

- [TAPPING] Tapping for turning 60+ — [NEW]
- [READING] Life beyond 60 — what people don't say — [PD] + [NEW]
- [AFFIRMATION] My years are mine. They are good — [NEW]

##### Body changes

- [TAPPING] Tapping for the ageing body — cross-tag BODY — [NEW]
- [READING] The body across the decades — [PD] + [NEW]

##### Hair changes

- [TAPPING] Tapping for the ageing hair — [NEW]
- [READING] Hair across the decades — [PD]

##### Skin changes

- [TAPPING] Tapping for the ageing skin — cross-tag BODY — [NEW]
- [READING] Skin across the decades — [PD]

##### Energy changes

- [TAPPING] Tapping for the changing energy — cross-tag BODY — [NEW]
- [READING] Energy across the decades — [PD]

##### Watching parents age

- [TAPPING] Tapping for watching them age — cross-tag GRIEF — [NEW]
- [READING] Watching your parents grow old — [PD] + [NEW]
- [JOURNAL_PROMPT] What does watching them age teach me about my own? — [NEW]

##### Becoming the older generation

- [TAPPING] Tapping for being the older generation now — [NEW]
- [JOURNAL_PROMPT] What does being older bring that being younger didn't? — [NEW]
- [AFFIRMATION] I am older. I am wiser. Both are gifts — [NEW]

##### Being mistaken for older

- [TAPPING] Tapping for "you look older than you are" — [NEW]
- [AFFIRMATION] My age is mine to be — [NEW]
- [JOURNAL_PROMPT] Whose definition of age am I borrowing? — [NEW]

##### The "middle-aged woman invisible" thing

- [TAPPING] Tapping for the invisibility — cross-tag BODY — [NEW]
- [READING] The invisible mid-life woman — myth and reality — [PD] + [NEW]
- [AFFIRMATION] I see myself. That's the only one that counts — [NEW]

##### Mortality awareness

- [TAPPING] Tapping for the mortality awareness — [NEW]
- [READING] Mortality as a gift, not a threat — [PD] + [NEW]
- [JOURNAL_PROMPT] What does my mortality awareness change about today? — [NEW]

##### "I'm running out of time" feeling

- [TAPPING] Tapping for the "running-out-of-time" panic — [NEW]
- [JOURNAL_PROMPT] What do I most want to do — and what does "time" actually allow? — [NEW]
- [READING] When time feels short — [PD] + [NEW]

##### Younger people in your industry

- [TAPPING] Tapping for the younger industry peers — cross-tag BUSINESS — [NEW]
- [READING] Being the older one in the room — [PD] + [NEW]

##### Younger friends

- [TAPPING] Tapping for the younger-friends gift — [NEW]
- [JOURNAL_PROMPT] What do my younger friends give me? — [NEW]

##### Being a younger / older spouse

- [TAPPING] Tapping for the age-gap marriage — cross-tag RELATIONSHIPS — [NEW]
- [READING] The age-gap marriage — long version — [PD] + [NEW]

##### Dating after divorce in mid-life

- [TAPPING] Tapping for the mid-life dating — cross-tag RELATIONSHIPS — [NEW]
- [READING] Dating in your 40s, 50s, 60s — [PD] + [NEW]

##### Sex after a certain age

- [TAPPING] Tapping for mid-life sex — cross-tag BODY — [NEW]
- [READING] Sex across the decades — [PD]

##### Style and ageing

- [TAPPING] Tapping for the dress-for-your-age question — [NEW]
- [READING] Style as you age — without disappearing — [PD] + [NEW]
- [ACTIVITY] One piece you've been told is "too young" — wear it once — [PD]

##### Beauty after a certain age

- [TAPPING] Tapping for the ageing beauty question — cross-tag BODY — [NEW]
- [READING] Beauty in mid-life — [PD] + [NEW]

##### Late-bloomer identity

- [TAPPING] Tapping for the late-bloomer life — cross-tag BUSINESS — [NEW]
- [READING] The late bloomer — and why this is the right time — [PD] + [NEW]

##### Career changes in mid-life

- [TAPPING] Tapping for the mid-life career change — cross-tag BUSINESS — [NEW]
- [READING] Pivoting in mid-life — [PD] + [NEW]

##### "I haven't done [X] yet"

- [TAPPING] Tapping for "I haven't done X yet" — [NEW]
- [JOURNAL_PROMPT] Which "not yet" still matters? Which has quietly passed? — [NEW]

##### Bucket-list pressure

- [TAPPING] Tapping for the bucket-list pressure — [NEW]
- [READING] Bucket lists — for and against — [PD] + [NEW]
- [JOURNAL_PROMPT] What's on the list that's actually someone else's? — [NEW]

##### Letting go of unfulfilled dreams

- [TAPPING] Tapping for the dream that won't happen — cross-tag GRIEF — [NEW]
- [READING] Grieving the unlived life — [PD] + [NEW]

##### Reinvention permission

- [TAPPING] Tapping for permission to reinvent — [NEW]
- [AFFIRMATION] I am allowed to become new — [NEW]
- [READING] Reinvention in mid-life — [PD] + [NEW]

##### Wisdom and ageing well

- [TAPPING] Tapping for owning the wisdom — [NEW]
- [JOURNAL_PROMPT] What wisdom do I have now that I didn't at 30? — [NEW]
- [READING] Wisdom — what it actually is — [PD] + [NEW]

##### Grandparenthood

- [TAPPING] Tapping for grandparenting — cross-tag MOTHERHOOD — [NEW]
- [READING] Grandparenting the modern way — [PD] + [NEW]

##### The "what's it all for" mid-life wonder

- [TAPPING] Tapping for the existential mid-life — cross-tag SPIRITUALITY — [NEW]
- [JOURNAL_PROMPT] What's it for? My own answer, in 200 words — [NEW]
- [READING] The mid-life "what's it all for?" — [PD] + [NEW]

##### Death of contemporaries

- [TAPPING] Tapping for the friend-your-age dying — cross-tag GRIEF — [PD] + [NEW]
- [READING] When your contemporaries start dying — [PD] + [NEW]
- [JOURNAL_PROMPT] What does this change for how I live? — [NEW]

##### Estate / will / legacy

- [TAPPING] Tapping for the will / estate conversation — cross-tag MONEY — [NEW]
- [READING] Estate planning as care — [PD]
- [ACTIVITY] One concrete legacy step this month — [PD]

##### Spiritual growth in ageing

- [TAPPING] Tapping for the spiritual deepening of ageing — cross-tag SPIRITUALITY — [NEW]
- [READING] Ageing as spiritual practice — [PD] + [NEW]

##### The freedom of getting older

- [TAPPING] Tapping for the freedom of ageing — [NEW]
- [JOURNAL_PROMPT] What am I freer for, now? — [NEW]
- [AFFIRMATION] My years bought me this freedom — [NEW]

##### The losses of getting older

- [TAPPING] Tapping for the losses of ageing — [NEW]
- [JOURNAL_PROMPT] What have I lost that I most miss? — [NEW]
- [READING] The losses of ageing — honest version — [PD] + [NEW]

##### Re-blooming in mid-life and beyond

- [TAPPING] Tapping for the re-bloom — [NEW]
- [AFFIRMATION] I am re-blooming — [NEW]
- [JOURNAL_PROMPT] What is unfurling in me at this age? — [NEW]
- [READING] Re-blooming in mid-life — [PD] + [NEW]

### Ageing — reading entries

- [READING] Ageing well — the long view — [PD] + [NEW]
- [READING] The invisible mid-life woman — myth and reality — [PD] + [NEW]
- [READING] Mortality as a gift — [PD] + [NEW]
- [READING] Late-bloomer life — the case for it — [PD] + [NEW]
- [READING] Reinvention in mid-life — [PD] + [NEW]
- [READING] Wisdom — what it actually is — [PD] + [NEW]
- [READING] Re-blooming — the post-menopause / mid-life shift — [PD] + [NEW]

---

## 17. Manifesting & magical — cross-cutting genre

~110 entries across the activities / rituals / spells / visualisations
sub-categories, written in the **deposit-coin shape**:

- Specific, concrete physical action (something you actually do with
  your hands, a kitchen object, a doorway, a wallet).
- Symbolic / energetic intent — the action carries a meaning, an
  asking, a release, a fixing-into-place.
- Playful, folk-magical register — not earnest / not clinical / not
  therapeutic-claim-y. Closer to a wise grandmother's quiet ritual
  than a wellness reel.
- Forward action close — the practice points at a next move (do the
  thing, ask, walk back into the room) rather than ending on a
  cosmic-promise.

The reference shape is the **bay-leaf burn** and **bless-and-pay**
entries already in Money (both PUBLISHED) and the **deposit-coin**
shape from `feedback_mindset_voice.md` — concrete object, symbolic
weight, body-anchored, no big claims.

The authoring worker auto-populates `mood: ["manifesting", "magical"]`
on these entries (or just one of the two if more appropriate — e.g.
`["manifesting"]` for a contract / launch / asking practice with no
candle-and-salt physical staging; `["magical"]` for a folk-spell
shaped entry that isn't pointed at a specific outward outcome).
`playful` and `symbolic` are also permitted mood values for entries
that lean into either register specifically (a deliberately silly
ritual; a heavily symbolic-but-not-folk-magical one).

**Hard exclusion.** No magical / manifesting frame on:
- Grief (Section 14) — keep respectful, grounded, body-first.
- Trauma / abuse / clinical PTSD (Section 9 § specific past event,
  sexual / medical / birth trauma, generational trauma) — same.
- Chronic illness and pain (Section 13 § chronic illness; Body §
  pain) — same.
- Mental-health-crisis adjacent (Section 13 § depression, suicidal
  ideation if any) — same.
- Anything specifically about another person's behaviour where the
  practice would read as a "love spell" or "make him come back"
  shape. Practices land on the *practitioner's* state, never on
  bending someone else's will.

Cross-tag each entry with its primary life category so the autopilot
still picks it under that category's slice — the genre is a `mood`
tag layered on top, not a sub-category replacement.

### Money — manifesting / magical

##### Asking, raises, pricing

- [ACTIVITY] Pin your asking number on the inside of the wardrobe door — see it as you dress for the meeting — [NEW] — cross-tag MONEY + BUSINESS
- [ACTIVITY] Write the cheque to yourself for the amount you're asking — tuck it in the back of your bank card — [NEW] — cross-tag MONEY
- [RITUAL] Bay-leaf burn for the asking number — write the figure, light it, ash into the sink — [NEW] — cross-tag MONEY
- [RITUAL] Sleep one night on the email draft before sending the rate increase — [NEW] — cross-tag MONEY + BUSINESS
- [SPELL] Rosemary in the wallet — for the week of the negotiation — [NEW] — cross-tag MONEY
- [ACTIVITY] Practise your asking number out loud in the kitchen three mornings running — [NEW] — cross-tag MONEY + CONFIDENCE
- [SPELL] Cinnamon on the doorframe of the room you negotiate in — [NEW] — cross-tag MONEY
- [VISUALISATION] The "yes" already given — walk into the meeting having already heard it — [NEW] — cross-tag MONEY + CONFIDENCE

##### Contracts, launches, big deposits

- [ACTIVITY] Sleep on the printed contract you want to win — under the pillow for one night — [NEW] — cross-tag MONEY + BUSINESS
- [RITUAL] Oil at the entrance of a new venture — a drop on the threshold the morning the offer goes live — [NEW] — cross-tag BUSINESS + MONEY
- [SPELL] Salt at the threshold for a launch week — protective, simple, kitchen salt is fine — [NEW] — cross-tag BUSINESS + MONEY
- [RITUAL] Tied red string by the front door for the duration of a launch — untie and bin when launch closes — [NEW] — cross-tag BUSINESS
- [ACTIVITY] Write the deposit number on a slip, fold it into a kitchen jar with a bay leaf, on the counter for one week — [NEW] — cross-tag MONEY
- [SPELL] Light a candle at the start of every workday during the launch — same candle, until it's done — [NEW] — cross-tag BUSINESS
- [RITUAL] The "first sale" ceremony — write down what you'll do when it lands, before it lands — [NEW] — cross-tag BUSINESS + MONEY
- [VISUALISATION] The full inbox of payment-received notifications — your body steady through it — [NEW] — cross-tag MONEY + ABUNDANCE

##### Debt release, money clearing

- [RITUAL] Bless-and-pay each bill aloud — already exists, link the deposit-coin shape — [NEW] — cross-tag MONEY
- [SPELL] Write the debt number on water-soluble paper; rinse it in the kitchen sink — release without denial — [NEW] — cross-tag MONEY
- [ACTIVITY] Bury a written wish about the debt cleared, in the garden or a pot, at the new moon — [NEW] — cross-tag MONEY
- [RITUAL] Wash hands of the old debt story at the kitchen sink — water + name what you release — [NEW] — cross-tag MONEY
- [SPELL] Cinnamon stick in the bill drawer for one month — sweet, warm, friendly — [NEW] — cross-tag MONEY

##### Daily money magic

- [ACTIVITY] Five-pence piece in the left shoe for the working day — anchor — [NEW] — cross-tag MONEY
- [RITUAL] Greet the bank balance with a hand on the screen before checking the number — [NEW] — cross-tag MONEY
- [SPELL] Coin under the welcome mat — a small magnet, kitchen-style — [NEW] — cross-tag MONEY + HOME
- [ACTIVITY] One coin saved in the same jar every day — symbolic, small, on the windowsill — [NEW] — cross-tag MONEY

### Business & purpose — manifesting / magical

##### Visibility and being seen

- [RITUAL] Stand on the threshold of your studio / desk / shop for thirty seconds before opening for the day — [NEW] — cross-tag BUSINESS + PURPOSE
- [ACTIVITY] Photograph your workspace in the morning light — every morning of the launch — [NEW] — cross-tag BUSINESS
- [SPELL] Bay leaf with your offer's name on it, in the jar with your business pens — [NEW] — cross-tag BUSINESS
- [VISUALISATION] The studio full, the inbox full, your body still — [NEW] — cross-tag BUSINESS + PURPOSE
- [ACTIVITY] Wear one piece of clothing that says "owner" — every working day for the launch week — [NEW] — cross-tag BUSINESS + CONFIDENCE

##### Clients, customers, collaborators

- [SPELL] Honey on a fingertip when sending the first email of the day — sweet first contact — [NEW] — cross-tag BUSINESS
- [RITUAL] Light a candle for each new collaborator the day they sign — name them aloud — [NEW] — cross-tag BUSINESS
- [ACTIVITY] Write the names of three aligned clients you're calling in, tuck in your diary — [NEW] — cross-tag BUSINESS

##### The launch / the offer

- [SPELL] Sigil on the back of the offer page — small, hand-drawn, your own — [NEW] — cross-tag BUSINESS
- [RITUAL] Pour out a glass of water on the kitchen window-sill at launch hour — flow as practice — [NEW] — cross-tag BUSINESS
- [ACTIVITY] Print the sales page and sleep one night with it folded under the pillow — [NEW] — cross-tag BUSINESS

### Home & lifestyle — manifesting / magical

##### Thresholds and doorways

- [SPELL] Salt at the front door threshold for the move-in week — protective, welcoming — [NEW] — cross-tag HOME
- [RITUAL] Greet the house aloud on returning each evening — by name if it has one — [NEW] — cross-tag HOME
- [ACTIVITY] Stand at the front door for thirty seconds in the morning, hand on the frame — [NEW] — cross-tag HOME
- [SPELL] Cinnamon on the doorframe — sweet welcome, household magic — [NEW] — cross-tag HOME
- [RITUAL] The "welcome the house" tea — one cup at the kitchen table, first morning of a new month — [NEW] — cross-tag HOME

##### The new home / the wanted home

- [ACTIVITY] Eat dinner from the plate you want to use when the new house is yours — once a week — [NEW] — cross-tag HOME + MONEY
- [VISUALISATION] Walking the rooms of the wanted house — known step by step — [NEW] — cross-tag HOME + ABUNDANCE
- [ACTIVITY] Tape a printed picture of the wanted house inside a kitchen cupboard you open daily — [NEW] — cross-tag HOME
- [RITUAL] Write the address of the wanted house on a slip, in the kitchen herb jar — [NEW] — cross-tag HOME
- [SPELL] Coin from your current home in the pocket on every viewing — [NEW] — cross-tag HOME

##### Hosting, gathering, the kitchen

- [RITUAL] Light a candle on the kitchen table while you cook for guests — "welcome" said aloud once — [NEW] — cross-tag HOME + RELATIONSHIPS
- [SPELL] Bay leaf under the dinner plate of an honoured guest — quiet, kitchen-magical — [NEW] — cross-tag HOME
- [ACTIVITY] Set the table the morning of the dinner — let the room hold it for the day — [NEW] — cross-tag HOME

### Body — hormonal, perimenopause, menopause — manifesting / magical

##### The cycle and seasons of the body

- [RITUAL] One drop of oil on the wrist at each phase shift — known, named, body-marked — [NEW] — cross-tag BODY
- [ACTIVITY] Sleep on a written list of three things your body asks for this cycle — [NEW] — cross-tag BODY
- [VISUALISATION] The cycle as a year — four seasons, your body as the orchard — [NEW] — cross-tag BODY + AGEING
- [SPELL] Bay leaf with the symptom-name on it, in the herb tin until it eases — [NEW] — cross-tag BODY

##### Perimenopause, menopause — symbolic claiming

- [RITUAL] Light a candle on the morning of each new hot flush — name what it's burning off — [NEW] — cross-tag BODY + AGEING
- [ACTIVITY] Write what the cycle gave you on a slip, before it ends, and tuck in the dresser — [NEW] — cross-tag BODY + AGEING
- [VISUALISATION] The new agency on the other side — known step by step — [NEW] — cross-tag BODY + AGEING + ABUNDANCE
- [SPELL] Rose petal in a jar of salt for the cycle-ending months — quiet honouring — [NEW] — cross-tag BODY + AGEING

##### Body knowing

- [ACTIVITY] Wash your face with intention every morning for the launch week — anchor — [NEW] — cross-tag BODY + CONFIDENCE
- [RITUAL] Hand on the belly, a question, an answer — three times before bed — [NEW] — cross-tag BODY

### Relationships — manifesting / magical (only the self-anchored shapes)

> No "love spells" or "make-them-come-back" framings. Every entry
> here lands on the practitioner's state, not on bending another's
> will.

##### Calling in aligned partners / friends

- [ACTIVITY] Write a list of the qualities — three of them, no more — and seal in an envelope on the dresser — [NEW] — cross-tag RELATIONSHIPS
- [RITUAL] Set a place for the aligned friend at Sunday dinner — once, at the start of looking — [NEW] — cross-tag RELATIONSHIPS
- [VISUALISATION] The dinner with the friend you haven't met yet — see the kitchen, the laugh, the tea — [NEW] — cross-tag RELATIONSHIPS

##### Tending an existing partnership

- [RITUAL] Light a candle for the marriage on each anniversary of a hard thing survived — [NEW] — cross-tag RELATIONSHIPS
- [ACTIVITY] Write three things you want for the partnership, fold into a kitchen jar — [NEW] — cross-tag RELATIONSHIPS
- [SPELL] Honey under both your morning cups for the week of a hard conversation coming — [NEW] — cross-tag RELATIONSHIPS

##### Closing what's done

- [RITUAL] Wash hands at the kitchen sink, name what is finished — [NEW] — cross-tag RELATIONSHIPS + FORGIVENESS
- [ACTIVITY] Burn or bury a slip with the relationship's name and "done with my hands open" — [NEW] — cross-tag RELATIONSHIPS + FORGIVENESS

### Self-worth & identity — manifesting / magical

##### Stepping into a bigger version of you

- [ACTIVITY] Wash hands of an old role at the kitchen sink — name what you release — [NEW] — cross-tag SELF_WORTH + FORGIVENESS
- [RITUAL] Dress as the next-year version of you one morning a week — [NEW] — cross-tag SELF_WORTH + CONFIDENCE
- [SPELL] Sigil for the next chapter — drawn on the inside of the wardrobe door, only you see it — [NEW] — cross-tag SELF_WORTH
- [VISUALISATION] The future you doing one ordinary task in the kitchen — known, named, embodied — [NEW] — cross-tag SELF_WORTH + ABUNDANCE
- [ACTIVITY] Write your wanted job title on a slip, tape inside your phone case — [NEW] — cross-tag SELF_WORTH + BUSINESS

##### Releasing the small old self

- [RITUAL] Bury a written list of what no longer fits in the herb garden / a houseplant pot at the new moon — [NEW] — cross-tag SELF_WORTH
- [SPELL] Salt over the left shoulder when the old story shows up — old, quiet, real — [NEW] — cross-tag SELF_WORTH

### Joy, pleasure, play — manifesting / magical

##### Claiming pleasure as a magical act

- [ACTIVITY] Dress entirely for joy one morning a week — including underwear — [NEW] — cross-tag JOY + BODY
- [RITUAL] Set the kitchen table for one person — yourself — once a week, with the good plate — [NEW] — cross-tag JOY
- [SPELL] Light a candle on the morning of one decided pleasure day each month — name the pleasure — [NEW] — cross-tag JOY
- [VISUALISATION] The room of your fully-pleasure life — walk it once a week — [NEW] — cross-tag JOY + ABUNDANCE

##### Anniversaries and celebrations

- [RITUAL] Light a candle on the morning of every Friday that closes a hard week — [NEW] — cross-tag JOY
- [ACTIVITY] Wear something celebratory on an ordinary Tuesday, just because — [NEW] — cross-tag JOY + PLAY

### Forgiveness — manifesting / magical (self-anchored only)

##### Release rituals

- [RITUAL] Wash hands of the wrong at the kitchen sink — water + name + dry slowly — [NEW] — cross-tag FORGIVENESS
- [SPELL] Burn a slip with the wrong written on it, ash into the bin or the garden — [NEW] — cross-tag FORGIVENESS
- [ACTIVITY] Bury a written sentence — "I am setting this down" — in a houseplant pot — [NEW] — cross-tag FORGIVENESS

##### Forgiving yourself

- [RITUAL] Light a candle on the day of the anniversary of the choice you're making peace with — [NEW] — cross-tag FORGIVENESS + SELF_WORTH
- [SPELL] Rose petal under a glass of water on the dresser overnight — return-to-yourself shape — [NEW] — cross-tag FORGIVENESS

### Ageing & seasons — manifesting / magical

##### Crossing chapters

- [ACTIVITY] Write the chapter you're closing on a slip; tuck it into the back of a kitchen drawer for a year — [NEW] — cross-tag AGEING
- [RITUAL] Light a candle on each equinox and solstice — name the season's shape — [NEW] — cross-tag AGEING + SPIRITUALITY
- [VISUALISATION] The next decade as a known house — walk one room — [NEW] — cross-tag AGEING + SELF_WORTH
- [SPELL] Rose hip on the windowsill through autumn — gentle ageing, gentle holding — [NEW] — cross-tag AGEING

##### Birthday and milestone practices

- [RITUAL] One candle on the kitchen table on the morning of your birthday — alone, before the day starts — [NEW] — cross-tag AGEING + JOY
- [ACTIVITY] Write a sealed letter to next-year-you on every birthday; open the previous year's — [NEW] — cross-tag AGEING + SELF_WORTH

### Spirituality & intuition — manifesting / magical

##### Daily knowing

- [RITUAL] Pour out a small saucer of milk on the back step at the new moon — folk-magical, no creed needed — [NEW] — cross-tag SPIRITUALITY
- [ACTIVITY] Hand on the kitchen counter, three breaths, ask the next question — [NEW] — cross-tag SPIRITUALITY
- [VISUALISATION] The knowing as a small steady fire in the chest — found, fed, walked with — [NEW] — cross-tag SPIRITUALITY

##### Signs and seasons

- [RITUAL] Light a candle for the first frost, first snow, first daffodil — name what's coming — [NEW] — cross-tag SPIRITUALITY + AGEING
- [ACTIVITY] Note three small signs across the week in a kitchen notebook — birds, light, weather — [NEW] — cross-tag SPIRITUALITY

##### Asking, listening

- [RITUAL] Three questions, written on three slips, in a kitchen jar overnight — read one each morning, no answer required — [NEW] — cross-tag SPIRITUALITY
- [SPELL] A single lit candle at the dining table for the duration of a hard prayer — [NEW] — cross-tag SPIRITUALITY

### Genre — reading entries

- [READING] How folk magic works — practitioner state, not other-bending — [PD] + [NEW]
- [READING] Manifesting without the wellness-industry frame — kitchen-table version — [PD] + [NEW]
- [READING] Why the small physical action matters — the deposit-coin shape explained — [NEW]
- [READING] When magical thinking helps and when it doesn't — honest version — [PD] + [NEW]
- [READING] The line between symbolic claiming and bypassing — [NEW]

---

## Cross-cutting indices (no new entries — references only)

These tail-of-file indices reference library entries by title to surface
practices grouped by mood / context / need. The bulk authoring worker
doesn't create new entries here — it cross-references entries from the
sections above.

### "I'm feeling..." matcher seeds

References to surface in the `UserFeeling` matcher (the schema's
"I'm feeling..." quick-help surface):

- **Stuck** — see Money § Day 19, Money § "wanting huge wealth", Body § Phase 1, Business § doubt spiral.
- **Anxious** — see Sleep § Day 2, Health § generalised anxiety, Body § perimenopause anxiety.
- **Lonely** — see Relationships § loneliness in marriage, Relationships § loneliness in a full life.
- **Tired** — see Sleep arc days 1–30, Body § energy & vitality, Health § burnout.
- **Triggered** — see Self-worth § comparison, Fear § hypervigilance, Relationships § the same fight on repeat.
- **Angry** — see Motherhood § mum rage, Body § perimenopause rage, Forgiveness § the anger underneath.
- **Grieving** — see Grief arc, Sleep § grief, Spirituality § faith after loss.
- **Doubting** — see Money § Day 64 (last doubts), Business § doubt spiral, Spirituality § "is this real?" doubt.
- **Overwhelmed** — see Time § never enough hours, Time § decision fatigue, Motherhood § mental load.
- **Numb** — see Fear § freeze response, Health § depression, Joy § forgetting what brings you joy.

### Curated entry points (small starter bundles)

- **"I'm new — where do I start?"** — Money § beginner intros + entry points; Sleep arc Day 1; Body Phase 1 Day 1; Self-worth § quieting the inner critic.
- **"I have five minutes a day"** — Each category's TAPPING + AFFIRMATION pairs. Stack two per day from any category. Pick the category that's loudest.
- **"It's Sunday and I want to start fresh"** — Home § Sunday slow morning; Time § Sunday-evening dread; Money § The Calm & Safe Money Reset; Sleep § Day 1.
- **"I'm in the perimenopause years"** — Body § Perimenopause sub-category (all); Sleep § perimenopause sleep changes; Health § thyroid + anxiety; Ageing § "I'm running out of time" feeling.
- **"I just had a baby"** — Motherhood § identity loss; Sleep § new-parent deprivation; Body § postpartum body changes; Self-worth § "good girl" wound.
- **"I want the magical / manifesting register"** — Section 17 (cross-cutting), filtered by mood `manifesting` / `magical`. The bay-leaf burn (Money), cinnamon at the threshold (Home / Money), bless-and-pay (Money), the deposit-coin shape entries across asking / launches / new home / new chapter. Hard exclusion: grief, trauma, chronic illness, abuse-adjacent topics.

### Worker-handover note

When picking a batch for bulk authoring (per Phase 8 Step 12 pattern),
balance:
- One category-anchor week (Money's first 7 days = bedrock; Sleep's
  whole 30 days = small wins early).
- One cross-category set (e.g. "Sunday slow morning" pulls from Home,
  Time, Money — gives the matcher early coverage).
- One Rebecca-original reading entry per batch (the long-form spine
  that gives the section its voice).

Mark entries `[done]` at the end of the bullet when the bulk authoring
worker has written + uploaded the corresponding library row.

