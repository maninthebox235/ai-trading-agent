#!/usr/bin/env python3
"""Mock backend server for testing the frontend without real API keys."""

import json
from datetime import datetime, timedelta, timezone
from aiohttp import web
import random

# Generate mock diary entries
def generate_mock_diary_entries(count=100):
    entries = []
    assets = ['BTC', 'ETH', 'SOL', 'BNB', 'MATIC']
    actions = ['buy', 'sell', 'hold', 'close']

    base_time = datetime.now(timezone.utc) - timedelta(hours=24)

    for i in range(count):
        action = random.choice(actions)
        asset = random.choice(assets)
        timestamp = base_time + timedelta(minutes=i*15)

        entry = {
            "timestamp": timestamp.isoformat(),
            "asset": asset,
            "action": action,
        }

        if action in ['buy', 'sell']:
            entry.update({
                "allocation_usd": round(random.uniform(100, 5000), 2),
                "amount": round(random.uniform(0.01, 2.0), 4),
                "entry_price": round(random.uniform(20000, 95000) if asset == 'BTC' else random.uniform(1000, 4000), 2),
                "tp_price": round(random.uniform(21000, 100000) if asset == 'BTC' else random.uniform(1100, 4500), 2),
                "sl_price": round(random.uniform(19000, 90000) if asset == 'BTC' else random.uniform(900, 3800), 2),
                "tp_oid": random.randint(1000000, 9999999),
                "sl_oid": random.randint(1000000, 9999999),
                "exit_plan": random.choice([
                    "Exit if MACD crosses below signal line",
                    "Close when RSI exceeds 70",
                    "Exit on EMA50 cross",
                    "Stop loss triggered"
                ]),
                "rationale": random.choice([
                    "Strong bullish momentum with RSI at 45 and MACD turning positive",
                    "Bearish divergence on 4h chart, taking profits",
                    "Price consolidating near support, good entry point",
                    "Overbought conditions, reducing position size",
                    "Following trend with strong volume confirmation"
                ]),
                "filled": random.choice([True, False]),
                "opened_at": timestamp.isoformat()
            })
        else:
            entry["rationale"] = random.choice([
                "Waiting for better entry point",
                "Market conditions uncertain, staying on sidelines",
                "No clear signal, maintaining current positions",
                "Volatility too high, holding steady"
            ])

        entries.append(entry)

    return entries

# Mock log content
MOCK_LOGS = """
[2025-10-22 00:15:32] INFO - Starting trading agent for assets: ['BTC', 'ETH', 'SOL'] at interval: 5m
[2025-10-22 00:15:33] INFO - Connected to Hyperliquid exchange
[2025-10-22 00:15:34] INFO - Fetching market data for BTC
[2025-10-22 00:15:35] INFO - Current BTC price: $67,234.50
[2025-10-22 00:15:36] INFO - RSI(14): 52.3, MACD: 234.5, EMA(20): $67,100
[2025-10-22 00:15:40] INFO - LLM Decision: BUY BTC - Strong momentum with bullish indicators
[2025-10-22 00:15:41] INFO - Placed buy order for 0.0745 BTC at $67,234.50
[2025-10-22 00:15:42] INFO - TP set at $68,500, SL set at $66,000
[2025-10-22 00:20:32] INFO - Fetching market data for ETH
[2025-10-22 00:20:33] INFO - Current ETH price: $3,421.75
[2025-10-22 00:20:34] INFO - RSI(14): 48.7, MACD: -12.3, EMA(20): $3,445
[2025-10-22 00:20:38] INFO - LLM Decision: HOLD ETH - Waiting for clearer signal
[2025-10-22 00:25:32] INFO - Fetching market data for SOL
[2025-10-22 00:25:33] INFO - Current SOL price: $145.23
[2025-10-22 00:25:34] INFO - RSI(14): 67.2, MACD: 8.9, EMA(20): $143.50
[2025-10-22 00:25:38] INFO - LLM Decision: SELL SOL - Overbought conditions detected
[2025-10-22 00:25:39] INFO - Placed sell order for 34.5 SOL at $145.23
[2025-10-22 00:30:32] INFO - Combined prompt length: 12456 chars for 3 assets
[2025-10-22 00:30:45] INFO - LLM response received in 13.2s
[2025-10-22 00:35:32] INFO - Checking exit conditions for active trades
[2025-10-22 00:35:33] INFO - BTC position: Entry $67,234.50, Current: $67,456.20, PnL: +$16.52
[2025-10-22 00:40:32] INFO - Market volatility detected, adjusting strategy
[2025-10-22 00:45:32] INFO - Account balance: $15,234.56, Total PnL: +2.34%
"""

# Store mock entries globally
mock_entries = generate_mock_diary_entries(100)

async def handle_diary(request):
    """Handle /diary endpoint"""
    try:
        limit = int(request.query.get('limit', '200'))
        download = request.query.get('download')
        raw = request.query.get('raw')

        if raw or download:
            # Return JSONL format
            jsonl = '\n'.join(json.dumps(entry) for entry in mock_entries)
            headers = {}
            if download:
                headers["Content-Disposition"] = "attachment; filename=diary.jsonl"
            return web.Response(text=jsonl, content_type="text/plain", headers=headers)

        # Return JSON
        entries_to_return = mock_entries[-limit:] if len(mock_entries) > limit else mock_entries
        return web.json_response({"entries": entries_to_return})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

async def handle_logs(request):
    """Handle /logs endpoint"""
    try:
        path = request.query.get('path', 'llm_requests.log')
        download = request.query.get('download')
        limit_param = request.query.get('limit')

        logs = MOCK_LOGS

        if download or (limit_param and (limit_param.lower() == 'all' or limit_param == '-1')):
            headers = {}
            if download:
                headers["Content-Disposition"] = f"attachment; filename={path}"
            return web.Response(text=logs, content_type="text/plain", headers=headers)

        limit = int(limit_param) if limit_param else 2000
        return web.Response(text=logs[-limit:], content_type="text/plain")
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

async def handle_health(request):
    """Health check endpoint"""
    return web.json_response({"status": "ok", "mode": "mock"})

def main():
    app = web.Application()
    app.router.add_get('/diary', handle_diary)
    app.router.add_get('/logs', handle_logs)
    app.router.add_get('/health', handle_health)

    print("=" * 60)
    print("🤖 Mock Trading Agent Backend")
    print("=" * 60)
    print("✅ Server starting on http://localhost:3000")
    print("📊 Serving mock data for frontend testing")
    print(f"📝 Generated {len(mock_entries)} mock diary entries")
    print("\nEndpoints:")
    print("  - GET /diary?limit=200")
    print("  - GET /logs?path=llm_requests.log")
    print("  - GET /health")
    print("\n⚠️  This is MOCK data - no real trading occurs")
    print("=" * 60)

    web.run_app(app, host='0.0.0.0', port=3000)

if __name__ == '__main__':
    main()
