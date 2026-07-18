import { NextResponse } from "next/server";

const SENTRY_HOST = "o4511712287195136.ingest.de.sentry.io";

export async function POST(request: Request) {
  try {
    const envelope = await request.text();
    const piece = envelope.split("\n")[0];
    const header = JSON.parse(piece);

    const dsn = new URL(header.dsn);
    if (dsn.hostname !== SENTRY_HOST) {
      return NextResponse.json({ error: "Invalid Sentry host" }, { status: 403 });
    }

    const projectId = dsn.pathname.replace("/", "");
    const sentryUrl = `https://${SENTRY_HOST}/api/${projectId}/store/`;

    const response = await fetch(sentryUrl, {
      method: "POST",
      body: envelope,
      headers: {
        "Content-Type": "application/x-sentry-envelope",
      },
    });

    return new NextResponse(response.body, {
      status: response.status,
    });
  } catch {
    return NextResponse.json({ error: "Tunnel failed" }, { status: 500 });
  }
}
