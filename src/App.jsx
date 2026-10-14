import { useState } from "react";
import { products } from "./products";
import { getRecommendations } from "./api";
import ProductCard from "./ProductCard";

const EXAMPLES = [
  "I want a phone under $500",
  "Good laptop for coding",
  "Cheap earbuds with noise cancelling",
];

export default function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { ids, reason } | null

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError("");
    try {
      setResult(await getRecommendations(query.trim(), products));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError("");
    setQuery("");
  };

  const visible = result
    ? products.filter((p) => result.ids.includes(p.id))
    : products;

  return (
    <main className="container">
      <h1>AI Product Recommender</h1>
      <p className="subtitle">Tell me what you need and I'll pick from our catalog.</p>

      <form className="search" onSubmit={handleSubmit}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. I want a phone under $500"
          aria-label="Your preferences"
        />
        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? "Thinking..." : "Recommend"}
        </button>
      </form>

      <div className="examples">
        {EXAMPLES.map((ex) => (
          <button key={ex} type="button" className="chip" onClick={() => setQuery(ex)}>
            {ex}
          </button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="reason">
          <p>{result.reason || "Here's what I found:"}</p>
          <button type="button" className="link" onClick={reset}>
            Show all products
          </button>
        </div>
      )}

      {result && visible.length === 0 && (
        <p className="empty">No matching products found. Try changing your request.</p>
      )}

      <section className="grid">
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} highlighted={!!result} />
        ))}
      </section>
    </main>
  );
}
