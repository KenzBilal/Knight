import { NextResponse } from "next/server";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

const VERSION_FILE = join(process.cwd(), ".build-version");

function getBuildVersion(): string {
  // In production, prefer git commit SHA
  const gitSha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (gitSha) return gitSha.slice(0, 7);

  // Try to read existing version file
  if (existsSync(VERSION_FILE)) {
    try {
      return readFileSync(VERSION_FILE, "utf-8").trim();
    } catch {}
  }

  // Generate a new version based on current time and write it
  const version = `dev-${Date.now()}`;
  try {
    writeFileSync(VERSION_FILE, version, "utf-8");
  } catch {}
  return version;
}

export async function GET() {
  return NextResponse.json({
    version: getBuildVersion(),
    timestamp: new Date().toISOString(),
  });
}
