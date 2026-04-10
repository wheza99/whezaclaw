import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.headers.get("x-gateway-url");
  const token = req.headers.get("x-gateway-token");
  const authMode = req.headers.get("x-gateway-auth-mode") || "token";
  const path = req.headers.get("x-gateway-path") || "/v1/models";

  if (!url || !token) {
    return NextResponse.json({ error: "Missing gateway config" }, { status: 400 });
  }

  try {
    const res = await fetch(`${url}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const url = req.headers.get("x-gateway-url");
  const token = req.headers.get("x-gateway-token");
  const path = req.headers.get("x-gateway-path") || "/v1/chat/completions";

  if (!url || !token) {
    return NextResponse.json({ error: "Missing gateway config" }, { status: 400 });
  }

  try {
    const body = await req.text();
    const res = await fetch(`${url}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
      signal: AbortSignal.timeout(30000),
    });

    const contentType = res.headers.get("content-type") || "application/json";
    // Stream SSE passthrough
    if (contentType.includes("text/event-stream")) {
      const reader = res.body;
      return new NextResponse(reader, {
        status: res.status,
        headers: { "Content-Type": contentType },
      });
    }

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": contentType },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
