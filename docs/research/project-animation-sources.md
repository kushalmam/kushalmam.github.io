# Animated project visuals

Reviewed 2026-09-11. These are animated explanations, not live applications or latency demonstrations.

- Rekindle: three candidate channels (two-tower, time-decayed popularity, item-item CF), up to 200 each, deduplicated union of up to 600, LightGBM LambdaRank top 10. The tile count is schematic. NDCG@10 0.0104 versus 0.0071 strongest baseline is offline chronological replay over 29,416 eligible warm events. Sources: https://github.com/Techdude01/rekindle and https://github.com/Techdude01/rekindle/blob/main/docs/rekindle-report.md (agent inspected commit eecac1b6b838c9ddb65fe4cfdceb9fd4dd42f2bc).
- AutoCPT: final browser speech chunks go over WebSocket to Flask/Groq; returned CPT history is deduplicated. The visual does not imply a validated clinical result or working end-to-end billing. Sources: https://github.com/Techdude01/AutoCPT/blob/main/frontend/src/hooks/useSpeechRecognition.ts and https://github.com/Techdude01/AutoCPT/blob/main/app.py.
- MarketMind: K2/Tavily evidence gathering, thesis persistence, and sentiment comparison are implemented in https://github.com/Techdude01/MarketMind-yHack26/blob/main/backend/app/services/analyze.py. The Games example has market sentiment -0.954, news sentiment -0.7055, divergence 0.2485 and SKIP, as committed in https://github.com/Techdude01/MarketMind-yHack26/blob/main/data/gemini_eval_results_test2.json. These are example outputs, not measured financial performance.

Playback loops automatically while each visual is on screen, pauses offscreen, and uses a still final frame when reduced motion is enabled.
