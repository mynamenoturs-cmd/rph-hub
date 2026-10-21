/**
 * RPH Hub -> FUSION bridge (Cloudflare Pages Function)
 *
 * Route:  POST /api/fusion/edit   { blocks:[{kind,text}], instruction, session? }
 *         GET  /api/fusion/health
 *
 * WHY A BRIDGE (not a direct browser call)
 * RPH Hub and FUSION are two different Supabase projects, so a teacher's RPH Hub
 * token is not valid on FUSION's user pool. The browser therefore never sees a
 * FUSION credential: this function verifies the RPH Hub teacher, then forwards to
 * FUSION with a server-side secret.
 *
 * ENV
 *   SUPABASE_URL / SUPABASE_ANON_KEY   RPH Hub project (already used by source-files)
 *   FUSION_API_URL                     e.g. https://fusion-api.<account>.workers.dev  (dev: http://localhost:8787)
 *   FUSION_SERVICE_TOKEN               optional bearer for the FUSION Worker
 *   FUSION_DEV_BYPASS                  '1' ONLY for local PoC; requires x-fusion-dev header
 */

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

async function teacherFromBearer(request, env) {
  const auth = request.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ') || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;
  const headers = { authorization: auth, apikey: env.SUPABASE_ANON_KEY };
  try {
    const r = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers });
    if (!r.ok) return null;
    const user = await r.json();
    if (!user?.email) return null;
    const a = await fetch(
      `${env.SUPABASE_URL}/rest/v1/authorized_users?select=status&email=eq.${encodeURIComponent(user.email)}`,
      { headers },
    );
    const rows = a.ok ? await a.json() : [];
    if (!Array.isArray(rows) || !rows[0] || rows[0].status !== 'active') return null;
    return user;
  } catch {
    return null;
  }
}

export async function bridge(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/fusion\/?/, '') || 'health';
  const fusionBase = String(env.FUSION_API_URL || '').replace(/\/$/, '');
  if (!fusionBase) return json({ ok: false, error: 'FUSION_API_URL belum diset' }, 503);

  // kesediaan jambatan: tiada data guru, jadi tidak perlu sesi (UI guna ini untuk
  // tentukan sama ada butang "Sunting dengan Fusion" patut dipaparkan)
  if (path === 'health') {
    const r = await fetch(`${fusionBase}/health`, { signal: AbortSignal.timeout(15_000) }).catch(() => null);
    const body = r?.ok ? await r.json().catch(() => ({})) : null;
    return json({ ok: Boolean(r?.ok), fusion: body, bridge: 'rph-hub' }, r?.ok ? 200 : 502);
  }

  // auth: real teacher session, or explicit local-dev bypass
  let teacher = await teacherFromBearer(request, env);
  if (!teacher) {
    const devOk =
      env.FUSION_DEV_BYPASS === '1' && request.headers.get('x-fusion-dev') === '1';
    if (!devOk) return json({ ok: false, error: 'UNAUTHORIZED' }, 401);
    teacher = { email: 'dev-bypass@localhost', id: 'dev' };
  }

  if (path === 'edit') {
    if (request.method !== 'POST') return json({ ok: false, error: 'POST sahaja' }, 405);
    const body = await request.json().catch(() => null);
    if (!body || !Array.isArray(body.blocks) || !body.blocks.length) {
      return json({ ok: false, error: 'blocks diperlukan' }, 400);
    }
    if (typeof body.instruction !== 'string' || !body.instruction.trim()) {
      return json({ ok: false, error: 'instruction diperlukan' }, 400);
    }

    const headers = { 'content-type': 'application/json' };
    if (env.FUSION_SERVICE_TOKEN) headers.authorization = `Bearer ${env.FUSION_SERVICE_TOKEN}`;

    const r = await fetch(`${fusionBase}/v1/skills/rph/edit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        blocks: body.blocks,
        instruction: body.instruction,
        workspace_id: body.workspace_id || null,
      }),
      signal: AbortSignal.timeout(300_000),
    }).catch((e) => ({ ok: false, status: 502, text: async () => String(e?.message || e) }));

    if (!r.ok) {
      const detail = typeof r.text === 'function' ? await r.text() : '';
      return json({ ok: false, error: 'FUSION gagal', status: r.status, detail: String(detail).slice(0, 800) }, 502);
    }
    const out = await r.json().catch(() => ({}));
    return json({ ...out, teacher: teacher.email }, out.ok ? 200 : 422);
  }

  return json({ ok: false, error: 'laluan tidak dikenali', path }, 404);
}

export const onRequest = (ctx) => bridge(ctx.request, ctx.env);
