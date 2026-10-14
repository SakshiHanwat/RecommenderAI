// Vercel serverless function. Keeps the OpenAI key on the server.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query, products } = req.body || {};
  if (!query || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: "query and products are required" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY is not configured on the server" });
  }

  const catalog = products
    .map((p) => `${p.id} | ${p.name} | ${p.category} | $${p.price} | ${p.description}`)
    .join("\n");

  const systemPrompt = `You are a product recommendation assistant for a store.
Only recommend products from the catalog below. Respect budget limits strictly.
Return at most 5 products, best match first.
Respond ONLY with JSON: {"ids": [numbers], "reason": "one or two short sentences"}.
If nothing matches, return {"ids": [], "reason": "why nothing matched"}.

Catalog (id | name | category | price | description):
${catalog}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: String(query).slice(0, 500) },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("OpenAI error:", detail);
      return res.status(502).json({ error: "AI service error. Please try again." });
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    // Never trust the model: keep only ids that really exist in the catalog.
    const validIds = new Set(products.map((p) => p.id));
    const ids = (parsed.ids || []).filter((id) => validIds.has(id));

    return res.status(200).json({ ids, reason: parsed.reason || "" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not get recommendations." });
  }
}
