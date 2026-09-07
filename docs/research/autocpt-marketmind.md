# AutoCPT and MarketMind research

Research date: 2026-09-07. Sources are the repositories' README files, committed source, data artifacts, tests, history, and GitHub metadata. “README/plan claim” means the repository says it; “verified” means the committed code or artifact supports it. Absence of evidence below means the repository was inspected but did not contain a reproducible result for that claim.

## AutoCPT — `Techdude01/AutoCPT`

Sources: [repository](https://github.com/Techdude01/AutoCPT), [README](https://github.com/Techdude01/AutoCPT/blob/main/README.md), [Flask app](https://github.com/Techdude01/AutoCPT/blob/main/app.py), [Groq/Nessie integration](https://github.com/Techdude01/AutoCPT/blob/main/test_groq.py), [React recorder](https://github.com/Techdude01/AutoCPT/blob/main/frontend/src/components/CPTRecorder.tsx), [speech hook](https://github.com/Techdude01/AutoCPT/blob/main/frontend/src/hooks/useSpeechRecognition.ts), [mobile entry point](https://github.com/Techdude01/AutoCPT/tree/main/auto-cpt).

### What is actually implemented

- The README describes a HackNYU2025 assistant that turns spoken clinical text into CPT codes, selects a patient, estimates cost, and creates a bill across React/Flask web and Expo/React Native mobile clients.
- The code verifies a Flask app with CORS and Flask-Sock. `POST /select_patient` looks up a first/last name through Capital One Nessie, resolves an account nicknamed `blue cross`, and stores both IDs in module globals. `/ws` accepts JSON text, calls Groq `llama-3.3-70b-versatile` through `get_cpt_codes`, de-duplicates codes in an in-memory dictionary, and returns the history. `POST /stop_rec` calls another Groq completion for numeric costs, posts one pending bill per code to Nessie, then clears module state.
- The web UI has a hard-coded four-person dropdown, browser `SpeechRecognition`, a WebSocket client, a transcript view, code cards, search, and copy-to-clipboard behavior. The Expo directory exists, but its tracked entry points and components are largely the default Expo starter scaffold; the repository does not demonstrate parity with the web workflow.

### Limits and discrepancies a portfolio case study should state

- There is no committed accuracy, latency, billing-error, user-study, or before/after measurement. The README’s “accurate” and “real-time” language is a product claim, not a measured result.
- The backend declares `full_transcription` but never appends received text to it. Consequently, `/stop_rec` passes an empty visit context to the cost-estimation prompt. The stop path also bills whatever the LLM returns as JSON; there is no CPT validation, deterministic fee schedule lookup, human review, or retry/transaction boundary.
- Patient/account state and CPT history are process-global, so concurrent clinicians can overwrite one another. The frontend uses a localhost WebSocket/HTTP URL, and no authentication, authorization, persistence, audit trail, or deployment configuration is shown.
- `test_groq.py` contains a committed-looking Nessie API key and hard-coded `http://api.nessieisreal.com` integration. The README says keys should be in `.env`, but the code only reads `GROQ_API_KEY` from the environment; the Nessie key is a separate source-controlled constant. This is a material security and demo-environment limitation.
- The client hook sends only final speech segments, while `frontend/src/hooks/extractCPTCodes.ts` is explicitly a random mock extractor and is not used by the recorder. The older `static/script.js` expects `cpt_history` as an array of entries, while the Flask app sends a dictionary; this suggests multiple partially migrated UI paths.
- `customer_gen.py` seeds demo customers via Nessie and pauses for an interactive “ARE YOU SURE?” prompt for each record. This supports a hackathon demo setup, not a production patient integration.

### Contributor and decision evidence

GitHub currently reports 37 commits and contributor counts of `yp583` 30, `Sidd-Codes` 5, and `Techdude01` 2 ([contributors](https://github.com/Techdude01/AutoCPT/graphs/contributors)). Commit messages mention transcription, Groq, billing/customer API, and iOS work, but no role ownership or decision record is documented. The README does not identify individual responsibilities.

The first-party [Devpost submission](https://devpost.com/software/autocpt) corroborates the user’s award statement: under “Submitted to,” it lists HackNYU 2025 and the exact award text “Winner Best Use of AI powered by Reach Capital.” The same submission names four creators and gives useful authorship evidence: Sparsh Bahadur says he owned the backend Groq transcript-to-CPT path, customer database, and Capital One billing; Siddhant Bhatnagar says he built the iOS React Native app and voice recognition; Kushal Mamillapalli says he worked full-stack on YOLOv11 fracture detection and frontend TypeScript; and Yashraj Patel says he worked on the backend transcript integration, insurance bill calculation, and Capital One bill posting/debugging. Devpost also records the team’s documented process decisions: finalized-only speech results to eliminate duplicated interim words, prompt limits for relevant CPT codes, `EXPO_PUBLIC_GROQ_API_KEY` for Expo environment compatibility, and a YOLOv11/OpenCV fracture-detection path. These are stronger authorship and decision sources than GitHub commit counts, but the submission’s “tested real-world conversations” and “improved accuracy” remain qualitative claims without published metrics.

### Focused questions for the owner

1. How should the Devpost roles map to GitHub identities (`yp583`, `Sidd-Codes`, `Techdude01`, and any other account), and which parts did each person personally own?
2. What clinical text set or test cases did you use, and what were precision/recall, latency, or correction rates? If none, what would be the honest demo success criterion?
3. Was the Nessie integration intentionally a mock billing sandbox? How would patient isolation, consent, audit logs, and deterministic Medicare pricing work before real clinical use?
4. Was the empty `full_transcription` context and module-global session state known demo debt, or should the case study describe a completed fix?

## MarketMind — `Techdude01/MarketMind-yHack26`

Sources: [repository](https://github.com/Techdude01/MarketMind-yHack26), [README](https://github.com/Techdude01/MarketMind-yHack26/blob/main/README.md), [hackathon plan](https://github.com/Techdude01/MarketMind-yHack26/blob/main/plan.md), [K2/Tavily agent](https://github.com/Techdude01/MarketMind-yHack26/blob/main/backend/app/services/llm/k2_agent.py), [analysis pipeline](https://github.com/Techdude01/MarketMind-yHack26/blob/main/backend/app/services/analyze.py), [signal model](https://github.com/Techdude01/MarketMind-yHack26/blob/main/ml/signal_model.py), [signal tests](https://github.com/Techdude01/MarketMind-yHack26/blob/main/tests/test_signal_model.py), [threshold evaluator](https://github.com/Techdude01/MarketMind-yHack26/blob/main/ml/evaluate_threshold.py), [evaluation artifact](https://github.com/Techdude01/MarketMind-yHack26/blob/main/data/gemini_eval_results_test2.json), [API analyze route](https://github.com/Techdude01/MarketMind-yHack26/blob/main/backend/app/routes/analyze.py).

### What is actually implemented

- The README verifies a Docker Compose monorepo with a Next.js frontend, Flask API, PostgreSQL, and `uv`-managed backend. The tree also contains market repositories, database schema, market ingestion, frontend market/detail/dashboard/agent pages, wallet/trade code, and ML/evaluation modules.
- The K2 path is real code rather than a plan stub: it constructs an OpenAI-compatible streaming client for `MBZUAI-IFM/K2-Think-v2`, gives it a Tavily search tool, excludes prediction-market domains, runs a LangGraph ReAct agent, retries transient failures, strips `<think>` blocks, and persists search results, thesis text, reasoning metadata, and a derived sentiment signal. There is a defensive workaround for K2 emitting a literal tool-call string instead of a native tool call.
- Flask analysis routes expose single-market analysis and “ingest from Gamma then analyze.” The pipeline loads a market from Postgres, runs the agent, persists Tavily and thesis records, computes a sentiment/divergence payload, and returns thesis, news, and signal data.
- The signal model routes finance-like categories to FinBERT and other categories to CardiffNLP RoBERTa, maps class probabilities to a `[-1, 1]` score, compares news sentiment with market probability mapped to the same scale, and marks a signal actionable when absolute divergence exceeds the committed `0.35` threshold. Tests cover category routing, score conversion, expected output shape, and fail-safe behavior on model errors.

### Measurement evidence and limits

- The committed `gemini_eval_results_test2.json` contains six rows: five `ACT` and one `SKIP`, with computed sentiment/divergence values. The rows are descriptive summaries paired with market probabilities; they do not include gold actionable labels, realized outcomes, a train/test result, precision, recall, F1, calibration, P&L, or a trading benchmark. Treat this as an example artifact or smoke evaluation, not proof that the strategy works.
- `ml/evaluate_threshold.py` can compute precision/recall/F1/accuracy from a labeled CSV and uses a randomized 80/20 split, but no committed labeled evaluation output was found. The threshold commit message says “Tune signal threshold to 0.35”; the repository does not show the dataset, selection result, or held-out metrics that justify 0.35.
- The plan contains many unassigned TODOs: Auth0, Hex dashboard publishing, GoDaddy deployment, MongoDB raw-agent storage, real/paper trade decisions, historical signal evaluation, and payoff visualizations. Some corresponding modules now exist, but the plan is not evidence that those integrations were completed or used in a demo.
- The agent’s probability estimate is generated in a model response and the sentiment signal is heuristic divergence. The repository does not establish that a thesis probability is calibrated, that news is causally predictive, or that simulated trades beat a baseline. The safest portfolio wording is “built an evidence gathering and signal prototype,” with any performance claim omitted until a reproducible labeled and realized-outcome study exists.

### Contributor and decision evidence

GitHub reports four contributors: `AnuRaghav` 29, `Techdude01` 25, `Sidd-Codes` 12, and `Zhi-Hui-C` 12 ([contributors](https://github.com/Techdude01/MarketMind/graphs/contributors)). Commit messages provide useful but incomplete role clues: wallet/trading functionality, agent animation, Hex graphs, signal threshold tuning, signal/evaluation updates, and dashboard/database work. The plan’s role table remains unassigned, so ownership should be confirmed with the team rather than inferred from commit counts. Documented architectural decisions include Flask for shared Python with the agent, Postgres for structured/Hex-facing data, and a separate store for unstructured agent internals; whether every planned store/deployment path was live should be confirmed.

### Focused questions for the owner

1. Which end-to-end path was demoed: market ingestion → K2/Tavily thesis → signal → simulated trade, and which pieces were still mocked or manually seeded?
2. What labeled dataset and held-out results led to threshold `0.35`? Do you have realized market outcomes or paper-trade returns to support any decision-quality claim?
3. Which contributors owned the agent, ML/evaluation, backend/data, frontend, wallet/trading, and Hex work? The plan leaves these roles blank.
4. Were Auth0, MongoDB, Hex, deployment, and real-time market updates actually exercised in the demo, or are they planned architecture? What was intentionally cut under hackathon time pressure?
5. How did you handle model failure, stale market data, duplicate analyses, and unsafe trade execution? The code shows retry/fail-safe behavior in places, but the operational policy is not fully documented.

## Portfolio positioning

AutoCPT is strongest as a concise hackathon prototype story about integrating browser speech, an LLM extraction loop, and a billing sandbox under time pressure. Its case study should foreground the integration and explicitly label the clinical, concurrency, pricing, and measurement gaps.

MarketMind is stronger as an engineering case study: it has a visible service boundary, agent/tool orchestration, persistence, tests, and an evaluation harness. The credible claim is that the team built a research workflow and signal prototype; a claim of profitable or accurate trading is not supported by the committed evidence. Before publishing either case study, obtain the owners’ answers above and replace inferred roles or demo scope with first-person, verifiable statements.
