"use server";

export async function getSignals() {
  const apiUrl = process.env.API_URL || "http://localhost:10000";
  const apiKey = process.env.SIGINT_API_KEY;

  try {
    const res = await fetch(`${apiUrl}/signals/queue`, {
      headers: {
        "X-API-Key": apiKey || "",
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Failed to fetch signals from server:", err);
    return [];
  }
}
