// Ideas from private repos under github.com/adityak74. Names left out on purpose: the idea is the point.
// mo = month the repo was created. Newest first.
export const EXPERIMENTS: { key: string; mo: string; tag: string; title: string; body: string }[] = [
  { key: "x-memory", mo: "2026-07", tag: "Memory", title: "Can a chat assistant remember only what it can ground?", body: "A local-first assistant whose memory lives in a graph database and is built from my own agent session history, running on local models." },
  { key: "x-review", mo: "2026-09", tag: "Agents", title: "What does it take to trust an automated code reviewer?", body: "A pull-request review service held to a 100% test-coverage gate, so the reviewer is tested at least as hard as the code it reviews." },
  { key: "x-physics", mo: "2026-09", tag: "Neuro-symbolic", title: "Let the LLM imagine the disaster, let physics check it", body: "An adversarial agent proposes chains of hazards (glacier collapse, dam breach, flood), and classical hydrology equations verify every step. Tested on a blind 2026 hindcast against Monte Carlo and plain-LLM baselines." },
  { key: "x-veto", mo: "2026-09", tag: "Agents · Risk", title: "An LLM that can only say no", body: "Numbers make the decision and the model gets a veto, never a vote, behind hard deterministic limits. A pattern for putting LLMs near decisions that cost money." },
  { key: "x-vision", mo: "2025-10", tag: "Vision · Medical", title: "Can a local vision model read an X-ray well enough to help?", body: "A 32B vision-language model reads dental radiographs on local hardware, with every output logged for a human to review." },
  { key: "x-curate", mo: "2025-07", tag: "Retrieval", title: "Letting a model choose what is worth reading", body: "RSS in, embeddings and a local or hosted model deciding what makes the cut." },
  { key: "x-pdf", mo: "2025-06", tag: "Retrieval", title: "Search that survives messy PDFs", body: "Three text-extraction fallbacks before anything reaches the vector index, because retrieval is only as good as the parse." },
  { key: "x-narrow", mo: "2025-02", tag: "Inference", title: "Read less, answer the same", body: "Agents and an evolutionary search narrow the text a model has to read before it answers." },
  { key: "x-sidebyside", mo: "2025-01", tag: "Evals", title: "One prompt, every local model, side by side", body: "A small Rust harness that streams the same prompt through a list of local models, the seed of the eval habits behind later work." },
  { key: "x-lora", mo: "2024-11", tag: "Fine-tuning", title: "Can a LoRA learn to write a book?", body: "Low-rank fine-tuning of Llama on a corpus of novels for long-form generation, checkpoint by checkpoint." },
]
