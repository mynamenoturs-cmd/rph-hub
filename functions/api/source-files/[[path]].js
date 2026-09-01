async function allowedUser(request, env) {
  const token = request.headers.get('authorization') || '';
  if (!token.startsWith('Bearer ') || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;
  const tokenBytes = new TextEncoder().encode(token);
  const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', tokenBytes))].map(byte => byte.toString(16).padStart(2, '0')).join('');
  const cacheKey = new Request(`https://r2-auth-cache.invalid/${digest}`);
  const edgeCache = typeof caches !== 'undefined' ? caches.default : null;
  const cached = edgeCache ? await edgeCache.match(cacheKey) : null;
  if (cached) return cached.json();
  const headers = { authorization: token, apikey: env.SUPABASE_ANON_KEY };
  const user = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers });
  if (!user.ok) return null;
  const profile = await user.json();
  const access = await fetch(`${env.SUPABASE_URL}/rest/v1/authorized_users?select=status&email=eq.${encodeURIComponent(profile.email || '')}`, { headers });
  const rows = access.ok ? await access.json() : [];
  if (rows[0]?.status !== 'allowed') return null;
  if (edgeCache) await edgeCache.put(cacheKey, json(profile, { headers: { 'cache-control': 'public, max-age=60' } }));
  return profile;
}

function objectKey(ctx, user) {
  return keyFor(ctx, user);
}

function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

function errorResponse(error, status = 400) {
  return json({ error: error?.message || String(error || 'Ralat tidak diketahui') }, { status });
}

function keyFor(ctx, user, supplied = '') {
  const routePath = Array.isArray(ctx.params.path) ? ctx.params.path.join('/') : String(ctx.params.path || '');
  const path = String(supplied || routePath).replace(/^\/+/, '');
  if (!path || path.includes('..') || !path.startsWith(`${user.id}/`)) return '';
  return path;
}

export async function onRequestPost(ctx) {
  if (!ctx.env.RPH_SOURCE_FILES) return new Response('R2 belum dikonfigurasi', { status: 503 });
  const user = await allowedUser(ctx.request, ctx.env);
  if (!user) return new Response('Unauthorized', { status: 401 });
  const action = new URL(ctx.request.url).searchParams.get('action');

  if (action === 'mpu-create') {
    const key = objectKey(ctx, user);
    if (!key) return errorResponse('Path tidak sah');
    try {
      const contentType = ctx.request.headers.get('x-file-content-type') || 'application/octet-stream';
      const upload = await ctx.env.RPH_SOURCE_FILES.createMultipartUpload(key, {
        httpMetadata: { contentType },
      });
      return json({ key: upload.key, uploadId: upload.uploadId });
    } catch (error) {
      return errorResponse(error);
    }
  }

  if (action === 'mpu-complete') {
    const url = new URL(ctx.request.url);
    const key = objectKey(ctx, user), uploadId = url.searchParams.get('uploadId');
    if (!key || !uploadId) return errorResponse('Path atau uploadId tidak sah');
    try {
      const body = await ctx.request.json();
      const parts = Array.isArray(body?.parts) ? body.parts : [];
      if (!parts.length || parts.some(part => !Number.isInteger(part?.partNumber) || !part?.etag)) {
        return errorResponse('Senarai bahagian upload tidak sah');
      }
      const upload = ctx.env.RPH_SOURCE_FILES.resumeMultipartUpload(key, uploadId);
      const object = await upload.complete(parts);
      return json({ path: key, bucket: 'r2', status: 'uploaded-r2-multipart' }, {
        headers: { etag: object.httpEtag },
      });
    } catch (error) {
      return errorResponse(error);
    }
  }

  if (action) return errorResponse(`Tindakan POST tidak dikenali: ${action}`);
  const form = await ctx.request.formData();
  const file = form.get('file'), key = keyFor(ctx, user, form.get('path'));
  if (!file || typeof file.stream !== 'function' || !key) return new Response('Fail atau path tidak sah', { status: 400 });
  await ctx.env.RPH_SOURCE_FILES.put(key, file.stream(), { httpMetadata: { contentType: file.type || 'application/octet-stream' } });
  return Response.json({ path: key, bucket: 'r2', status: 'uploaded-r2' });
}

export async function onRequestPut(ctx) {
  if (!ctx.env.RPH_SOURCE_FILES) return new Response('R2 belum dikonfigurasi', { status: 503 });
  const user = await allowedUser(ctx.request, ctx.env);
  if (!user) return new Response('Unauthorized', { status: 401 });
  const url = new URL(ctx.request.url), action = url.searchParams.get('action');
  if (action !== 'mpu-uploadpart') return errorResponse('Tindakan PUT tidak dikenali');
  const key = objectKey(ctx, user), uploadId = url.searchParams.get('uploadId');
  const partNumber = Number(url.searchParams.get('partNumber'));
  if (!key || !uploadId || !Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10000 || !ctx.request.body) {
    return errorResponse('Bahagian upload tidak sah');
  }
  try {
    const upload = ctx.env.RPH_SOURCE_FILES.resumeMultipartUpload(key, uploadId);
    const part = await upload.uploadPart(partNumber, ctx.request.body);
    return json(part);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function onRequestGet(ctx) {
  if (!ctx.env.RPH_SOURCE_FILES) return new Response('R2 belum dikonfigurasi', { status: 503 });
  const user = await allowedUser(ctx.request, ctx.env), key = user && keyFor(ctx, user);
  if (!user) return new Response('Unauthorized', { status: 401 });
  if (!key) return new Response('Path tidak sah', { status: 400 });
  const object = await ctx.env.RPH_SOURCE_FILES.get(key);
  if (!object) return new Response('Tidak ditemui', { status: 404 });
  const headers = new Headers(); object.writeHttpMetadata(headers); headers.set('etag', object.httpEtag); headers.set('cache-control', 'private, max-age=900');
  return new Response(object.body, { headers });
}

export async function onRequestDelete(ctx) {
  if (!ctx.env.RPH_SOURCE_FILES) return new Response('R2 belum dikonfigurasi', { status: 503 });
  const user = await allowedUser(ctx.request, ctx.env), key = user && keyFor(ctx, user);
  if (!user) return new Response('Unauthorized', { status: 401 });
  if (!key) return new Response('Path tidak sah', { status: 400 });
  const url = new URL(ctx.request.url), action = url.searchParams.get('action');
  if (action === 'mpu-abort') {
    const uploadId = url.searchParams.get('uploadId');
    if (!uploadId) return errorResponse('uploadId tidak sah');
    try {
      const upload = ctx.env.RPH_SOURCE_FILES.resumeMultipartUpload(key, uploadId);
      await upload.abort();
      return new Response(null, { status: 204 });
    } catch (error) {
      return errorResponse(error);
    }
  }
  await ctx.env.RPH_SOURCE_FILES.delete(key);
  return new Response(null, { status: 204 });
}
