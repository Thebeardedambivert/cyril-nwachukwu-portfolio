// ==========================================================================
// CODE SANDBOX & TELEMETRY EVENT STREAMER (Storyboard Panel 8)
// Live simulated streaming traces matching Cyril's OpenTelemetry & LangGraph runs
// ==========================================================================

const SAMPLE_EVENTS = [
  {
    event: "on_chain_start",
    name: "agentpipe_orchestrator",
    metadata: { thread_id: "tx_8842b", checkpoint: "postgres_dag_v1" },
    timestamp: "2026-09-03T21:42:01.102Z"
  },
  {
    event: "otel_span",
    name: "prompt_caching_evaluator",
    cached_tokens: 64400,
    billed_tokens: 5600,
    cache_rate: "92.0%",
    status: "DISCOUNT_APPLIED"
  },
  {
    event: "on_tool_start",
    tool: "mcp_server_sql_analytics",
    input: { query: "SELECT count(*) FROM orders WHERE status = 'delivered'" },
    safety_gate: "HMAC-SHA256_VERIFIED"
  },
  {
    event: "on_chat_model_stream",
    node: "worst_first_fixer",
    delta: "Applying patch to boltons/iterutils.py: chunk_ranges() boundary check",
    latency_ms: 84
  },
  {
    event: "on_eval_barrier_sync",
    judges: [
      { id: "eval_accuracy", score: 0.98, confidence: 0.95 },
      { id: "eval_clarity", score: 0.92, confidence: 0.91 },
      { id: "eval_completeness", score: 0.96, confidence: 0.94 }
    ],
    weighted_score: 0.96,
    verdict: "ACCEPTED"
  },
  {
    event: "ci_test_pipeline",
    runner: "GitHub Actions / PostgreSQL 16",
    total_tests: 237,
    status: "ALL_TESTS_PASSING",
    duration_s: 1.24
  }
];

export function initEventStream() {
  const streamContainer = document.getElementById('event-stream-output');
  if (!streamContainer) return;

  let eventIndex = 0;

  function appendNextEvent() {
    const data = SAMPLE_EVENTS[eventIndex];
    const pre = document.createElement('pre');
    pre.className = 'event-packet';
    pre.style.marginBottom = '1rem';
    pre.style.opacity = '0';
    pre.style.transform = 'translateY(6px)';
    pre.style.transition = 'all 0.3s ease';

    const timestamp = new Date().toISOString().split('T')[1].replace('Z', '');
    const jsonStr = JSON.stringify(data, null, 2);

    pre.innerHTML = `<span style="color:#ff5500;">[TRACE ${timestamp}]</span> ${jsonStr}`;
    streamContainer.appendChild(pre);

    requestAnimationFrame(() => {
      pre.style.opacity = '1';
      pre.style.transform = 'translateY(0)';
      streamContainer.scrollTop = streamContainer.scrollHeight;
    });

    // Keep buffer manageable
    if (streamContainer.children.length > 8) {
      streamContainer.removeChild(streamContainer.firstChild);
    }

    eventIndex = (eventIndex + 1) % SAMPLE_EVENTS.length;
    setTimeout(appendNextEvent, 2800);
  }

  appendNextEvent();
}
