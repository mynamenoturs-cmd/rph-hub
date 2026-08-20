async function allowedUser(request, env) {
  const token = request.headers.get('authorization') || '';
  if (!token.startsWith('Bearer ') || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;
  const headers = { authorization: token, apikey: env.SUPABASE_ANON_KEY };
  const user = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers });
  if (!user.ok) return null;
  const profile = await user.json();
  const access = await fetch(`${env.SUPABASE_URL}/rest/v1/authorized_users?select=status&email=eq.${encodeURIComponent(profile.email || '')}`, { headers });
  const rows = access.ok ? await access.json() : [];
  return rows[0]?.status === 'allowed' ? profile : null;
}

function keyFor(ctx, user, supplied = '') {
  const path = String(supplied || (ctx.params.path || []).join('/')).replace(/^\/+/, '');
  if (!path || path.includes('..') || !path.startsWith(`${user.id}/`)) return '';
  return path;
}

export async function onRequestPost(ctx) {
  if (!ctx.env.RPH_SOURCE_FILES) return new Response('R2 belum dikonfigurasi', { status: 503 });
  const user = await allowedUser(ctx.request, ctx.env);
  if (!user) return new Response('Unauthorized', { status: 401 });
  const form = await ctx.request.formData();
  const file = form.get('file'), key = keyFor(ctx, user, form.get('path'));
  if (!file || typeof file.stream !== 'function' || !key) return new Response('Fail atau path tidak sah', { status: 400 });
  await ctx.env.RPH_SOURCE_FILES.put(key, file.stream(), { httpMetadata: { contentType: file.type || 'application/octet-stream' } });
  return Response.json({ path: key, bucket: 'r2', status: 'uploaded-r2' });
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
  await ctx.env.RPH_SOURCE_FILES.delete(key);
  return new Response(null, { status: 204 });
}
