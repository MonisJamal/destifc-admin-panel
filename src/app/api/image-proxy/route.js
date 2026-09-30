export const dynamic = 'force-dynamic';

// In-memory cache to prevent redundant upstream fetches
const IMAGE_CACHE = new Map();
const MAX_CACHE_SIZE = 1000;

export async function GET(request) {
  try {
    const rawReqUrl = request.url;
    let url = '';

    const urlIdx = rawReqUrl.indexOf('url=');
    if (urlIdx !== -1) {
      const rawParam = rawReqUrl.substring(urlIdx + 4);
      // Safely decode only once without converting %2B to spaces
      url = decodeURIComponent(rawParam);
    }

    if (!url) {
      return new Response('Missing URL parameter', { status: 400 });
    }

    // Handle base64 data URLs directly
    if (url.startsWith('data:image')) {
      const parts = url.split(',', 2);
      const mime = parts[0].split(';')[0].replace('data:', '') || 'image/png';
      const buffer = Buffer.from(parts[1], 'base64');
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': mime,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Ensure relative URLs are absolute RenderZ URLs
    if (url.startsWith('/')) {
      url = `https://renderz.app${url}`;
    }

    // Check memory cache
    if (IMAGE_CACHE.has(url)) {
      const cached = IMAGE_CACHE.get(url);
      return new Response(cached.bytes, {
        status: 200,
        headers: {
          'Content-Type': cached.contentType,
          'Content-Length': cached.bytes.byteLength.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://renderz.app/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!resp.ok) {
      return new Response('Failed to fetch upstream image', { status: resp.status });
    }

    const arrayBuf = await resp.arrayBuffer();
    const bytes = new Uint8Array(arrayBuf);
    
    let contentType = resp.headers.get('content-type') || 'image/png';
    if (contentType.includes('octet-stream') || contentType.includes('text/plain') || !contentType.startsWith('image/')) {
      contentType = 'image/png';
    }

    if (IMAGE_CACHE.size >= MAX_CACHE_SIZE) {
      const firstKey = IMAGE_CACHE.keys().next().value;
      IMAGE_CACHE.delete(firstKey);
    }
    IMAGE_CACHE.set(url, { bytes, contentType });

    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': bytes.byteLength.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
