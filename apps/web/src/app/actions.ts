"use server";

export async function getWatchlist() {
  const apiUrl = process.env.API_URL || "http://localhost:10000";
  const apiKey = process.env.SIGINT_API_KEY;

  try {
    // We'll use a new endpoint or filter the existing one
    // For now, let's assume we can fetch signals by status
    const res = await fetch(`${apiUrl}/signals/watchlist`, {
      headers: {
        "X-API-Key": apiKey || "",
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function updateSignalStatus(signalId: number, decision: "act" | "dismiss" | "watchlist", notes: string = "") {
  const apiUrl = process.env.API_URL || "http://localhost:10000";
  const apiKey = process.env.SIGINT_API_KEY;

  try {
    const res = await fetch(`${apiUrl}/signals/${signalId}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey || "",
      },
      body: JSON.stringify({ decision, notes }),
    });

    return res.ok;
  } catch (err) {
    return false;
  }
}
