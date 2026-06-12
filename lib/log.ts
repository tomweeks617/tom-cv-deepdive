type LogEvent = Record<string, unknown> & { event: string };

/**
 * Logs a structured event to stdout (visible in Vercel's Logs tab,
 * ~1h retention on Hobby) and, when AXIOM_TOKEN/AXIOM_DATASET are set,
 * ships it to Axiom's ingest API for durable retention. Vercel log
 * drains need a Pro plan, so we post directly instead.
 *
 * Never throws — logging must never break the chat.
 */
export async function logEvent(data: LogEvent): Promise<void> {
  console.log(JSON.stringify(data));

  const token = process.env.AXIOM_TOKEN;
  const dataset = process.env.AXIOM_DATASET;
  if (!token || !dataset) return;

  try {
    await fetch(
      `https://api.axiom.co/v1/datasets/${encodeURIComponent(dataset)}/ingest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ _time: new Date().toISOString(), ...data }]),
      }
    );
  } catch (err) {
    console.error("axiom ingest failed:", err);
  }
}
