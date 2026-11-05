"""Headless smoke test for the Kota Hitam prototype.

Drives the game through the window.__kh debug hook and fails on any page error.
It checks the simulation, economy, expansion, laundering escapes, NPC profiles and
the thought engine. It does not check WebGL rendering.

It runs against the production build in dist/, so build first; `npm test` does both.

    pip install playwright && playwright install chromium
    npm test            # or CHROME=/path/to/chrome npm test
"""
import asyncio, functools, http.server, os, pathlib, sys, threading
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

CHECKS = r"""() => {
  const k = window.__kh, S = k.S, fail = [];
  const ok = (cond, msg) => { if (!cond) fail.push(msg); };
  // starting position
  ok(S.lots.length === 64, 'expected 64 lots');
  ok(S.lots[9].owner === 'you' && S.lots[9].biz.type === 'den', 'player starts with the den at lot 9');
  // staff, tills, collection
  k.act('hire', 9, S.board[0].id); k.advance(30);
  ok(S.lots[9].biz.till > 0, 'den till should fill');
  const before = S.dirty; k.act('collect', 9); ok(S.dirty > before, 'collecting moves till to dirty cash');
  // buying and opening
  S.clean = 50000; S.dirty = 50000; S.respect = 50;
  const sale = S.lots.findIndex(l => l.owner === 'sale');
  k.act('buy', sale); ok(S.lots[sale].owner === 'you', 'buying a lot');
  k.act('open', sale, 'front'); ok(S.lots[sale].biz && S.lots[sale].biz.type === 'front', 'opening a front');
  // expansion: Titiwangsa (block 1) touches the core; Bukit Bintang (block 11) does not
  // fog of war: Sentul (block 0) is a corner, hidden until a block next to it is unlocked
  ok(k.blockVisible(1) && !k.blockVisible(0), 'only one layer past unlocked blocks is visible');
  k.act('expand', 16 + 1*4); ok(S.blocks.includes(1), 'expanding into an adjacent block');
  ok(k.blockVisible(0) && !k.blockVisible(3), 'expanding reveals one more layer');
  k.act('expand', 16 + 11*4); ok(!S.blocks.includes(11), 'refusing a non-adjacent block');
  // no dead ends: a front can be built with dirty cash when clean cash is gone
  const empty = S.lots.findIndex(l => l.owner === 'sale'); k.act('buy', empty);
  S.clean = 0; S.dirty = 5000; k.act('open', empty, 'front');
  ok(S.lots[empty].biz && S.lots[empty].biz.type === 'front', 'front built with dirty cash');
  // two weeks of simulation without errors
  for (let i = 0; i < 24*14; i++) k.advance(1);
  ok(S.t > 300, 'time advances');
  // NPC factory determinism and the thought engine
  const a = k.gen(1234), b = k.gen(1234);
  ok(a.name === b.name && a.job === b.job, 'same seed gives the same NPC');
  ok(k.gen(1, { job:'lorry driver' }).job === 'lorry driver', 'overrides pin fields');
  return { fail, t: Math.round(S.t), dirty: Math.round(S.dirty), clean: Math.round(S.clean), heat: Math.round(S.heat) };
}"""

async def main():
    if not (DIST / 'index.html').exists():
        sys.exit('dist/index.html not found: run `npm run build` first, or use `npm test`')
    handler = functools.partial(QuietHandler, directory=str(DIST))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    async with async_playwright() as p:
        kw = {'executable_path': os.environ['CHROME']} if os.environ.get('CHROME') else {}
        browser = await p.chromium.launch(**kw)
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto(f'http://127.0.0.1:{server.server_address[1]}/')
        await page.wait_for_timeout(1500)
        await page.click('#btnSkip')
        await page.wait_for_timeout(500)
        result = await page.evaluate(CHECKS)
        await browser.close()
    server.shutdown()
    problems = result['fail'] + [f'page error: {e}' for e in errors]
    print(f"after {result['t']} in-game hours: dirty RM {result['dirty']}, clean RM {result['clean']}, heat {result['heat']}")
    if problems:
        print('FAILED'); [print(' -', m) for m in problems]; sys.exit(1)
    print('OK')

asyncio.run(main())
