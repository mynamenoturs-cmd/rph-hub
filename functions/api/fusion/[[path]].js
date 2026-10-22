/**
 * RPH Hub -> FUSION bridge (Cloudflare Pages Function)
 * Runtime bindings refresh: 2026-10-22 (deployment-only, no logic change)
 * Re-deploy after Cloudflare FUSION_SERVICE_TOKEN_V2 was configured.
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
 *   FUSION_SERVICE_TOKEN               required shared secret for the FUSION Worker
 *   FUSION_SERVICE_TOKEN_V2            optional rotated replacement (preferred when set)
 *   FUSION_DEV_BYPASS                  '1' ONLY for local PoC; requires x-fusion-dev header
 */

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

// These are public, publishable frontend settings (also shipped in
// app-v03334-original.js), NOT server/service-role credentials. Prefer
// Cloudflare bindings when present. Binding fallback preserves existing RPH
// Hub login validation without requiring the admin to copy a public key.
const RPH_PUBLIC_SUPABASE_URL = 'https://syqhegxtwsjnkoutlwno.supabase.co';
const RPH_PUBLIC_SUPABASE_KEY = 'sb_publishable_OeKcLCfDnw7FlWrSjUXGfg_t1YAD-zP';

async function teacherFromBearer(request, env) {
  const auth = request.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  const supabaseUrl = String(env.SUPABASE_URL || RPH_PUBLIC_SUPABASE_URL).replace(/\\/$/, '');
  const publishableKey = String(env.SUPABASE_ANON_KEY || RPH_PUBLIC_SUPABASE_KEY);
  const headers = { authorization: auth, apikey: publishableKey };
  try {
    const r = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers, signal: AbortSignal.timeout(12_000),
    });
    if (!r.ok) return null;
    const user = await r.json();
    if (!user?.id || !user?.email) return null;
    const email = String(user.email).trim().toLowerCase();
    const a = await fetch(
      `${supabaseUrl}/rest/v1/authorized_users?select=status&email=eq.${encodeURIComponent(email)}`,
      { headers, signal: AbortSignal.timeout(12_000) },
    );
    if (!a.ok) return null;
    const rows = await a.json().catch(() => []);
    // RPH Hub checks status 'allowed', not 'active'.
    if (!Array.isArray(rows) || rows[0]?.status !== 'allowed') return null;
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
  // Prefer the replacement secret to allow safe rotation when the legacy
  // Pages secret cannot be updated or deleted from the Cloudflare dashboard.
  const serviceToken = String(env.FUSION_SERVICE_TOKEN_V2 || env.FUSION_SERVICE_TOKEN || '').trim();
  if (!serviceToken) return json({ ok: false, error: 'FUSION_SERVICE_TOKEN belum diset' }, 503);

  // kesediaan jambatan: tiada data guru, jadi tidak perlu sesi (UI guna ini untuk
  // tentukan sama ada butang "Sunting dengan Fusion" patut dipaparkan)
  if (path === 'health') {
    // Check the actual RPH edit capability, not just a generic /health 200.
    // This keeps the UI hidden until both the Worker and shared token work.
    const r = await fetch(`${fusionBase}/v1/skills/rph/edit/health`, {
      headers: { authorization: `Bearer ${serviceToken}` },
      signal: AbortSignal.timeout(15_000),
    }).catch(() => null);
    const body = r?.ok ? await r.json().catch(() => ({})) : null;
    const ready = Boolean(r?.ok && body?.ready === true);
    return json({ ok: ready, fusion: body, bridge: 'rph-hub' }, ready ? 200 : 502);
  }

  if (path === 'edit' && request.method !== 'POST') return json({ ok: false, error: 'POST sahaja' }, 405);

  // auth: real teacher session, or explicit local-dev bypass
  let teacher = await teacherFromBearer(request, env);
  if (!teacher) {
    const devOk =
      env.FUSION_DEV_BYPASS === '1' && request.headers.get('x-fusion-dev') === '1';
    if (!devOk) return json({ ok: false, error: 'UNAUTHORIZED', detail: 'Sesi DELIMa tidak sah atau guru belum diluluskan. Log masuk semula jika perlu.' }, 401);
    teacher = { email: 'dev-bypass@localhost', id: 'dev' };
  }

  if (path === 'edit') {
    const body = await request.json().catch(() => null);
    if (!body || !Array.isArray(body.blocks) || !body.blocks.length) {
      return json({ ok: false, error: 'blocks diperlukan' }, 400);
    }
    if (typeof body.instruction !== 'string' || !body.instruction.trim()) {
      return json({ ok: false, error: 'instruction diperlukan' }, 400);
    }

    const headers = {
      'content-type': 'application/json',
      authorization: `Bearer ${serviceToken}`,
    };

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
