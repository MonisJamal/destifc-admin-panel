import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory cache to prevent re-fetching the same image repeatedly
const IMAGE_CACHE = new Map();
const MAX_CACHE_SIZE = 500;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return new NextResponse('Missing URL parameter', { status: 400 });
    }

    // Check memory cache first
    if (IMAGE_CACHE.has(url)) {
      const cached = IMAGE_CACHE.get(url);
      return new NextResponse(cached.buffer, {
        status: 200,
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=2592000, immutable',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
        'Referer': 'https://renderz.app/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'image',
        'sec-fetch-mode': 'no-cors',
        'sec-fetch-site': 'same-site'
      }
    });

    if (!resp.ok) {
      return new NextResponse('Failed to fetch upstream image', { status: resp.status });
    }

    const arrayBuf = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    
    let contentType = resp.headers.get('content-type') || 'image/png';
    if (contentType.includes('octet-stream') || contentType.includes('text/plain') || !contentType.startsWith('image/')) {
      contentType = 'image/png';
    }

    if (IMAGE_CACHE.size < MAX_CACHE_SIZE) {
      IMAGE_CACHE.set(url, { buffer, contentType });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=2592000, immutable',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new NextResponse(err.message, { status: 500 });
  }
}
