import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return new NextResponse('Missing URL parameter', { status: 400 });
    }

    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://renderz.app/'
      }
    });

    if (!resp.ok) {
      return new NextResponse('Failed to fetch upstream image', { status: resp.status });
    }

    const buffer = await resp.arrayBuffer();
    let contentType = resp.headers.get('content-type') || 'image/png';
    if (contentType.includes('octet-stream') || contentType.includes('text/plain') || !contentType.startsWith('image/')) {
      contentType = 'image/png';
    }

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new NextResponse(err.message, { status: 500 });
  }
}
