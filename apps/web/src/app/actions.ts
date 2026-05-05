"use server";

import { cookies } from "next/headers";

export async function getSignals() {
  const cookieStore = await cookies();
  if (!cookieStore.get("sigint_session")) return [];

  const apiUrl = process.env.API_URL || "http://localhost:10000";
  const apiKey = process.env.SIGINT_API_KEY;

  console.log(`Fetching from: ${apiUrl}/signals/queue`);

  try {
    const res = await fetch(`${apiUrl}/signals/queue`, {
      headers: {
        "X-API-Key": apiKey || "",
      },
      next: { revalidate: 60 },
    });

    console.log(`Fetch status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Error: ${errorText}`);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error("Fetch error details:", err);
    return [];
  }
}

export async function getWatchlist() {
  const cookieStore = await cookies();
  if (!cookieStore.get("sigint_session")) return [];

  const apiUrl = process.env.API_URL || "http://localhost:10000";
  const apiKey = process.env.SIGINT_API_KEY;

  try {
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

export async function getMarketPulse() {
  const cookieStore = await cookies();
  if (!cookieStore.get("sigint_session")) return [];

  const apiUrl = process.env.API_URL || "http://localhost:10000";
  const apiKey = process.env.SIGINT_API_KEY;

  try {
    const res = await fetch(`${apiUrl}/market/pulse`, {
      headers: {
        "X-API-Key": apiKey || "",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Market pulse fetch error:", err);
    return [];
  }
}

export async function analyzeSignal(signalId: number) {
  const cookieStore = await cookies();
  if (!cookieStore.get("sigint_session")) return false;

  const apiUrl = process.env.API_URL || "http://localhost:10000";
  const apiKey = process.env.SIGINT_API_KEY;

  try {
    const res = await fetch(`${apiUrl}/signals/${signalId}/analyze`, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey || "",
      },
    });

    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function updateSignalStatus(signalId: number, decision: "act" | "dismiss" | "watchlist", notes: string = "") {
  const cookieStore = await cookies();
  if (!cookieStore.get("sigint_session")) return false;

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

export async function login(password: string) {
  const correctPassword = process.env.DASHBOARD_PASSWORD;
  
  if (password === correctPassword) {
    const cookieStore = await cookies();
    cookieStore.set("sigint_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return true;
  }
  
  return false;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("sigint_session");
}
