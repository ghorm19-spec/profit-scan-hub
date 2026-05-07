import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  imageDataUrl: z.string().optional(),
  hint: z.string().max(500).optional(),
  region: z.string().max(8).default("US"),
  currency: z.string().max(8).default("USD"),
  userCost: z.number().nonnegative().optional(),
});

const ResultSchema = z.object({
  item_name: z.string(),
  category: z.string(),
  brand: z.string().optional().default(""),
  condition_note: z.string().optional().default(""),
  demand: z.enum(["High", "Medium", "Low"]),
  price_low: z.number(),
  price_high: z.number(),
  est_fees: z.number(),
  est_profit: z.number(),
  recommended_marketplace: z.string(),
  best_for_fast_sale: z.string(),
  best_for_highest_price: z.string(),
  confidence: z.number().min(0).max(1),
  time_to_sell: z.string(),
  recommendation: z.enum(["Buy", "Pass", "Negotiate"]),
  scam_risk: z.string(),
  underpriced_alert: z.boolean(),
  explanation: z.string(),
});

export const analyzeItem = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const userContent: any[] = [
      {
        type: "text",
        text: `Analyze this used item for resale potential. Region: ${data.region}, Currency: ${data.currency}.${
          data.userCost ? ` Buyer would pay approx ${data.userCost} ${data.currency}.` : ""
        }${data.hint ? ` Extra hint: ${data.hint}` : ""}
Return realistic resale comps for this region. Calculate est_fees as ~13% of midpoint, est_profit as midpoint - fees - userCost (or 0). Flag underpriced if userCost is well below price_low. Keep explanation under 280 chars in plain English.`,
      },
    ];
    if (data.imageDataUrl) {
      userContent.push({ type: "image_url", image_url: { url: data.imageDataUrl } });
    }

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are Score Flipp, an expert resale analyst for used goods on Poshmark, eBay, Mercari, Depop, Facebook Marketplace, Vinted, Grailed, StockX, Kijiji, Gumtree, Vinted, Leboncoin. Identify items from images and recommend the best marketplace for the user's region. Always respond by calling the report_item tool.",
          },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_item",
              description: "Return resale analysis",
              parameters: {
                type: "object",
                properties: {
                  item_name: { type: "string" },
                  category: { type: "string" },
                  brand: { type: "string" },
                  condition_note: { type: "string" },
                  demand: { type: "string", enum: ["High", "Medium", "Low"] },
                  price_low: { type: "number" },
                  price_high: { type: "number" },
                  est_fees: { type: "number" },
                  est_profit: { type: "number" },
                  recommended_marketplace: { type: "string" },
                  best_for_fast_sale: { type: "string" },
                  best_for_highest_price: { type: "string" },
                  confidence: { type: "number" },
                  time_to_sell: { type: "string", description: "e.g. '3-7 days'" },
                  recommendation: { type: "string", enum: ["Buy", "Pass", "Negotiate"] },
                  scam_risk: { type: "string", description: "Low / Medium / High + 1 line" },
                  underpriced_alert: { type: "boolean" },
                  explanation: { type: "string" },
                },
                required: [
                  "item_name","category","demand","price_low","price_high","est_fees","est_profit",
                  "recommended_marketplace","best_for_fast_sale","best_for_highest_price",
                  "confidence","time_to_sell","recommendation","scam_risk","underpriced_alert","explanation",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_item" } },
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      if (resp.status === 429) throw new Error("Rate limit reached. Try again in a moment.");
      if (resp.status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
      throw new Error(`AI error: ${resp.status} ${text.slice(0, 200)}`);
    }

    const json = await resp.json();
    const args = json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("AI returned no result");
    const parsed = ResultSchema.parse(typeof args === "string" ? JSON.parse(args) : args);
    return parsed;
  });
