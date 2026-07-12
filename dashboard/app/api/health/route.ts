import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();

  try {
    // Check Supabase connectivity
    const { createServiceClient } = await import('@/lib/supabase');
    const supabase = createServiceClient();
    const { error } = await supabase.from('orgs').select('id', { count: 'exact', head: true });

    const dbOk = !error;
    const latency = Date.now() - start;

    return NextResponse.json({
      status: dbOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: dbOk ? 'ok' : 'error',
        api: 'ok',
      },
      latency: `${latency}ms`,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: err.message,
      },
      { status: 503 }
    );
  }
}
