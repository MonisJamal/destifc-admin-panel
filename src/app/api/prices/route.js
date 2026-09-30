import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const DEFAULT_OVR_PRICES = {
  125: { min_price: 16000000000, max_price: 32000000000, quicksell: 11200000000 },
  124: { min_price: 8000000000, max_price: 16000000000, quicksell: 5600000000 },
  123: { min_price: 4000000000, max_price: 8000000000, quicksell: 2800000000 },
  122: { min_price: 2000000000, max_price: 4000000000, quicksell: 1400000000 },
  121: { min_price: 900000000, max_price: 1800000000, quicksell: 630000000 },
  120: { min_price: 400000000, max_price: 800000000, quicksell: 280000000 },
  119: { min_price: 70000000, max_price: 140000000, quicksell: 49000000 },
  118: { min_price: 65000000, max_price: 130000000, quicksell: 45500000 },
  117: { min_price: 60000000, max_price: 120000000, quicksell: 42000000 },
  116: { min_price: 10000000, max_price: 20000000, quicksell: 7000000 },
  115: { min_price: 9000000, max_price: 18000000, quicksell: 6300000 },
  114: { min_price: 8000000, max_price: 16000000, quicksell: 5600000 },
  113: { min_price: 7000000, max_price: 14000000, quicksell: 4900000 },
  112: { min_price: 6000000, max_price: 12000000, quicksell: 4200000 },
  111: { min_price: 5000000, max_price: 10000000, quicksell: 3500000 },
  110: { min_price: 4000000, max_price: 8000000, quicksell: 2800000 },
  109: { min_price: 3000000, max_price: 6000000, quicksell: 2100000 },
  108: { min_price: 2000000, max_price: 4000000, quicksell: 1400000 },
  107: { min_price: 1000000, max_price: 2000000, quicksell: 700000 },
  106: { min_price: 500000, max_price: 1000000, quicksell: 350000 },
  105: { min_price: 250000, max_price: 500000, quicksell: 175000 },
  104: { min_price: 200000, max_price: 400000, quicksell: 140000 },
  103: { min_price: 150000, max_price: 300000, quicksell: 105000 },
  102: { min_price: 100000, max_price: 200000, quicksell: 70000 },
  101: { min_price: 75000, max_price: 150000, quicksell: 52500 },
  100: { min_price: 50000, max_price: 100000, quicksell: 35000 },
};

export async function GET() {
  try {
    const res = await query("SELECT value FROM system_settings WHERE key = 'ovr_prices'");
    if (res.rows.length === 0) {
      return NextResponse.json({ success: true, prices: DEFAULT_OVR_PRICES });
    }
    const val = res.rows[0].value;
    const parsed = typeof val === 'string' ? JSON.parse(val) : (val || {});
    return NextResponse.json({
      success: true,
      prices: { ...DEFAULT_OVR_PRICES, ...parsed }
    });
  } catch (error) {
    console.error('Error fetching OVR price settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const prices = body.prices || body;

    await query(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES ('ovr_prices', $1, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
    `, [JSON.stringify(prices)]);

    return NextResponse.json({ success: true, message: 'OVR Price Limits saved successfully!', prices });
  } catch (error) {
    console.error('Error saving OVR price settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
