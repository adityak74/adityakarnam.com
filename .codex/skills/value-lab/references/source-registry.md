# Primary source registry

Verify canonical URLs and freshness on every run. This registry identifies authorities; it is not permission to reuse remembered values.

| Family | Primary source | Collect |
|---|---|---|
| Terminal-Bench | `https://www.tbench.ai/leaderboard` | Current versions and canonical leaderboard links |
| Terminal-Bench 2.1 | `https://www.tbench.ai/leaderboard/terminal-bench/2.1` | Agent, model, date, accuracy, uncertainty, verification statement |
| Terminal-Bench releases | `https://www.tbench.ai/news` | Version changes, task corrections, integrity/retraction notices |
| SWE-bench | `https://www.swebench.com/` | Official leaderboard rows, dataset variant, scaffold/agent, release/version |
| SWE-bench Verified | `https://www.swebench.com/verified.html` | Dataset scope, comparability warnings, task count |
| SWE-bench submissions | `https://www.swebench.com/submit.html` | Official experiments repository and submission provenance |
| OpenAI API pricing | `https://openai.com/api/pricing/` | Effective-dated input, cached input, output, batch/tool pricing |
| OpenAI plans | `https://openai.com/chatgpt/pricing/` and official Help Center | Plan price, documented windows/limits, effective date |
| Anthropic API pricing | `https://docs.anthropic.com/en/docs/about-claude/pricing` | Effective-dated input, cache, output, batch/tool pricing |
| Anthropic plans/usage | `https://support.anthropic.com/` official plan and usage-limit pages | Plan price and documented reset/window behavior |
| Google Gemini API pricing | `https://ai.google.dev/gemini-api/docs/pricing` | Effective-dated input, cache, output, batch/tool pricing |
| Google plans | Official Google AI plan/help pages | Plan price and documented limits |

## Source priority

1. Official benchmark leaderboard and documentation.
2. Official provider pricing and plan documentation.
3. Peer-reviewed paper or primary research repository.
4. Reproduced run with code, commit, and configuration.
5. Vendor-reported result.
6. Community measurement with adequate metadata.
7. Social discussion as qualitative context only.

## Source-specific cautions

- Terminal-Bench results belong to an agent–model combination. Preserve both.
- Terminal-Bench 2.0 and 2.1 are distinct series.
- SWE-bench “Bash Only,” Verified, Lite, Full, and Multimodal are distinct evaluation surfaces.
- SWE-bench mini-SWE-agent release families may not be comparable; preserve the release/scaffold version.
- Provider prices may vary by model tier, context length, cache policy, batch mode, region, or tool. Store only the rate matching the evaluated configuration.
- Subscription limits are dynamic and workload-dependent. Publish ranges only from official limits or documented telemetry; never translate anecdotes into fixed token allowances.
