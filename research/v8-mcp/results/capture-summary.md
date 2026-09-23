288 conversations scored (0 excluded for a CLI or API error). Cost of the eval itself: $15.60.

Share of conversations with an Atlas write (atlas_capture or atlas_log_decision), 95% Wilson interval:

| Model | Server condition | Decision, unprompted (should capture) | Trivial (should not) | Explicit request (should capture) |
|---|---|---|---|---|
| claude-sonnet-5 | bare | 33% (8/24, 18%-53%) | 0% (0/12, 0%-24%) | 100% (12/12, 76%-100%) |
| claude-sonnet-5 | described | 100% (24/24, 86%-100%) | 0% (0/12, 0%-24%) | 100% (12/12, 76%-100%) |
| claude-sonnet-5 | instructed | 100% (24/24, 86%-100%) | 0% (0/12, 0%-24%) | 100% (12/12, 76%-100%) |
| claude-opus-5-5 | bare | 46% (11/24, 28%-65%) | 0% (0/12, 0%-24%) | 100% (12/12, 76%-100%) |
| claude-opus-5-5 | described | 100% (24/24, 86%-100%) | 0% (0/12, 0%-24%) | 100% (12/12, 76%-100%) |
| claude-opus-5-5 | instructed | 100% (24/24, 86%-100%) | 0% (0/12, 0%-24%) | 100% (12/12, 76%-100%) |

Per decision scenario, unprompted capture rate (all conditions pooled per model):

| Scenario | claude-sonnet-5 | claude-opus-5-5 |
|---|---|---|
| D1-database | 75% (9/12, 47%-91%) | 75% (9/12, 47%-91%) |
| D2-deploy-pivot | 83% (10/12, 55%-95%) | 83% (10/12, 55%-95%) |
| D3-job-offer | 67% (8/12, 39%-86%) | 75% (9/12, 47%-91%) |
| D4-pricing | 100% (12/12, 76%-100%) | 100% (12/12, 76%-100%) |
| D5-scope-cut | 75% (9/12, 47%-91%) | 92% (11/12, 65%-99%) |
| D6-language | 67% (8/12, 39%-86%) | 67% (8/12, 39%-86%) |

When the unprompted capture happened (decision scenarios, captured runs):

- claude-sonnet-5 / bare: 8 captured; 0 on turn 1 (before the user stated the decision), 8 on turn 2
- claude-sonnet-5 / described: 24 captured; 0 on turn 1 (before the user stated the decision), 24 on turn 2
- claude-sonnet-5 / instructed: 24 captured; 0 on turn 1 (before the user stated the decision), 24 on turn 2
- claude-opus-5-5 / bare: 11 captured; 0 on turn 1 (before the user stated the decision), 11 on turn 2
- claude-opus-5-5 / described: 24 captured; 0 on turn 1 (before the user stated the decision), 24 on turn 2
- claude-opus-5-5 / instructed: 24 captured; 0 on turn 1 (before the user stated the decision), 24 on turn 2

atlas_search was called in 97 of 288 conversations (claude-sonnet-5/bare, claude-sonnet-5/described, claude-sonnet-5/instructed, claude-opus-5-5/bare, claude-opus-5-5/described, claude-opus-5-5/instructed).
