import * as React from "react"
import { ChapterShell, Lesson, Figure, Callout, Check } from "../CourseShell"
import { TextLink, Mono, Pre } from "../../world-model/pages-systems-stack-now/editorial"
import Ch4_Embeddings from "../visuals/Ch4_Embeddings"
import Ch4_Chunking from "../visuals/Ch4_Chunking"
import Ch4_Hybrid from "../visuals/Ch4_Hybrid"
import Ch4_HeroPipeline from "../visuals/Ch4_HeroPipeline"

const Ch4 = () => (
  <ChapterShell n={4}>
    <Lesson n="4.1" title="Why a model needs retrieval">
      <p>
        A model only sees what is in its <b>context window</b>, the text you send with each request. Text is counted in <b>tokens</b>, which are word pieces. Everything else the model knows is baked into its weights during training, and that knowledge goes stale and cannot be checked. <b>Retrieval-augmented generation</b>, or RAG, fixes this by looking up relevant text first and putting only that text into the window.
      </p>
      <p>
        The window is a limited budget, so the question is always which text earns a place in it. Aditya's paper on this, <TextLink href="https://arxiv.org/abs/2412.18708">CAG: chunked augmented generation for Google Chrome's built-in Gemini Nano</TextLink> (arXiv:2412.18708, with V. Vellaiyappan Surulimuthu), is the title of that work. This course does not summarise its results. Read the paper for those.
      </p>
      <p>
        The rest of the chapter works up from the smallest piece, the embedding, to a retrieval pipeline running on this site.
      </p>
    </Lesson>

    <Lesson n="4.2" title="Embeddings and nearest neighbours">
      <p>
        An <b>embedding</b> is a list of numbers, a vector, that a model produces for a piece of text so that similar meanings get nearby vectors. You can think of each vector as a point in space. Real embeddings have hundreds of dimensions. The plot below uses two so you can see it, with made-up positions.
      </p>
      <p>
        To search, embed the query, then find the <b>k nearest neighbours</b>: the k stored points closest to it. "Closest" can mean straight-line distance, or <b>cosine similarity</b>, which compares the angle between two vectors and ignores their length. Switch between the two below. In embenx, the library from <TextLink to="/embenx-python-embedding-toolkit/">the embenx post</TextLink>, the scores printed for a plain search are distances, so lower is better: in the post's example, Apple scores 0.0000, Strawberry 0.0200 and Blueberry 2.0000 for the query <Mono>[1, 0, 0, 0]</Mono>.
      </p>
      <Figure caption="Toy 2D embedding space. Schematic, not real embeddings. Move the query, change k, switch the measure.">
        <Ch4_Embeddings />
      </Figure>
      <p>
        Searching every point works for small collections. Larger ones use an approximate index such as HNSW, which finds close neighbours without comparing against everything. embenx puts one <Mono>Collection</Mono> interface over more than 15 such backends, so changing the index is a one-line change to <Mono>indexer_type</Mono>.
      </p>
    </Lesson>

    <Lesson n="4.3" title="Chunking under a token budget">
      <p>
        You rarely embed a whole document. You cut it into <b>chunks</b> and embed each one, so a hit returns a passage, not a book. Chunk size is a trade-off. Large chunks blur several topics into one vector. Small chunks lose their surroundings. And whatever you retrieve must fit the budget.
      </p>
      <Figure caption="Chunks are ranked by relevance and packed best first until the budget runs out. Schematic: sizes and scores are invented.">
        <Ch4_Chunking />
      </Figure>
      <p>
        <TextLink to="/tokens-per-paper-doclang-docling-pdf/">Tokens per paper</TextLink> measured this on a 23-page Nature paper. The extracted text was 21,736 tokens. Cutting the reference list and journal boilerplate left 13,483, which is 38% less. Three ways of preparing the same paper for embedding, all using the same embedding model (all-MiniLM-L6-v2), the same 512-token window and the same eight questions, gave Recall@3 of 6 of 8 for raw PDF text, 6 of 8 for DocLang markup, and 7 of 8 for Docling's structured text. Docling's text also indexed the fewest tokens, 23,136, against 27,856 for raw PDF text and 70,535 for DocLang. The post says that 6 versus 7 is within noise at this sample size.
      </p>
      <p>
        Two cautions from the same post. First, retrieval can be the wrong tool. For a briefing that needs ten specific facts, retrieving 19 chunks for 4,625 tokens found 7 of 10, while filtering the document by section found all 10 at 13,483 tokens. For questions like "list every named agent", vector top-5 found 12 of 122 items, and scanning the document structure found all 122. Second, chunkers can break the budget: at a default of 256 tokens, one table came out at 267 and would have been silently cut off when embedded, so the post asserts that no chunk exceeds the embedding window.
      </p>
      <Callout label="Remember">
        The budget is the constraint, so measure it. Count tokens per chunk, and check that nothing was truncated, before you tune anything else.
      </Callout>
    </Lesson>

    <Lesson n="4.4" title="Hybrid search, filters and memory">
      <p>
        Embeddings match meaning but can miss an exact word. A keyword method such as <b>BM25</b> scores documents by how many query words they contain and how rare those words are, which gets exact terms right but misses paraphrases. <b>Hybrid search</b> runs both and fuses the two ranked lists. embenx uses <b>Reciprocal Rank Fusion</b> (RRF): each list gives a document a score based on its rank, 1 over (a constant plus rank), and the scores are added with weights you choose.
      </p>
      <Figure caption="Four documents from the embenx hybrid_search example. Schematic: the ranks are invented, the weights are the dials from the post.">
        <Ch4_Hybrid />
      </Figure>
      <p>
        In the post's example the call is <Mono>hybrid_search(query_vector=[1, 0, 0, 0], query_text="lazy", top_k=3, dense_weight=0.5, sparse_weight=0.5)</Mono>. Aditya's own observation from testing was that about 0.6 dense and 0.4 sparse suited conversational queries, and the reverse suited structured documents where terminology matters. Treat that as one author's rule of thumb, not a law.
      </p>
      <p>
        The same library covers two more ideas. A <Mono>where</Mono> clause filters on metadata before the nearest-neighbour search, so the top k comes only from allowed documents. And <b>memory</b> is retrieval over what an assistant has seen before. <Mono>TemporalCollection</Mono>, based on arXiv:2502.16090, adds a <Mono>recency_weight</Mono>: 0.0 means pure semantic similarity and 1.0 means pure recency. The post says most practical assistants land around 0.3 to 0.5.
      </p>
    </Lesson>

    <Lesson n="4.5" title="A real pipeline: the chat on this site">
      <p>
        <TextLink to="/hero-rag-chat-architecture/">The hero chat post</TextLink> describes the retrieval system behind the chat on the homepage. It has two lanes. At build time, a script turns every post and a few project pages into one markdown document each and uploads them to an R2 bucket, and a GitHub Actions run triggers Cloudflare AI Search to re-index. The index reported 17 items indexed and 0 errors. At request time, a Cloudflare Pages Function answers questions.
      </p>
      <Figure caption="The request path, step by step. Switch between a question the corpus covers and one it does not.">
        <Ch4_HeroPipeline />
      </Figure>
      <p>
        The design choice worth copying is the guardrail. The system prompt tells the model to answer only from retrieved sources, and a relevance threshold of 0.4 decides which chunks count as citations. When nothing clears it, the user gets a plain fallback, not a guess. The post also notes the total cost shown on Cloudflare's billing page was $0.00 at this site's traffic, on a pay-as-you-go account, and says it would not stay at zero if traffic grew.
      </p>
    </Lesson>

    <Lesson n="4.6" title="Try it yourself">
      <p>
        embenx is on PyPI. Install it and run the filter example from the post:
      </p>
      <Pre>{`pip install embenx`}</Pre>
      <Pre>{`from embenx import Collection
import numpy as np

col = Collection(dimension=4, indexer_type="faiss")

vectors = np.array([
    [1.0, 0.0, 0.0, 0.0],
    [0.9, 0.1, 0.0, 0.0],
    [0.0, 1.0, 0.0, 0.0],
    [0.0, 0.0, 1.0, 0.0],
], dtype=np.float32)

metadata = [
    {"text": "Apple",      "category": "fruit",     "id": 1},
    {"text": "Strawberry", "category": "fruit",     "id": 2},
    {"text": "Blueberry",  "category": "berry",     "id": 3},
    {"text": "Broccoli",   "category": "vegetable", "id": 4},
]

col.add(vectors, metadata)

all_results = col.search([1, 0, 0, 0], top_k=3)
fruit_results = col.search([1, 0, 0, 0], top_k=5, where={"category": "fruit"})`}</Pre>
      <p>
        The post says the unfiltered search returns Apple, Strawberry, Blueberry, and the filtered one returns only Apple and Strawberry. Check that, then try a different <Mono>top_k</Mono>. The post also mentions <Mono>embenx explorer</Mono>, a local web UI with a RAG Playground, and <Mono>embenx mcp-start</Mono>, which exposes collections as memory tools to MCP clients.
      </p>
      <p>
        Conceptual exercise: take any long document you know. Decide how you would chunk it, what budget you would allow, and one question that vector search would answer well and one "list every" question that it would not.
      </p>
    </Lesson>

    <Check
      items={[
        { q: "What does cosine similarity compare, and what does it ignore?", a: "It compares the angle between two vectors and ignores their length." },
        { q: "Why might a pipeline add keyword search to vector search?", a: "Vector search matches meaning but can miss exact keywords. BM25 matches exact terms but misses paraphrases. Hybrid search fuses both ranked lists, for example with Reciprocal Rank Fusion and chosen weights." },
        { q: "In the tokens-per-paper test, which question type did vector top-5 handle worst?", a: "Aggregative \"list all\" questions. It found 12 of 122 items, while scanning the document structure found all 122." },
        { q: "In the hero chat, what happens when no retrieved chunk scores 0.4 or more?", a: "The user gets a static per-persona fallback with default links, flagged as a fallback, not an invented answer or a raw error." },
      ]}
    />
  </ChapterShell>
)

export default Ch4
