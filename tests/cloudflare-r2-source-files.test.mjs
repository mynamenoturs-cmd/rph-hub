import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const source = await fs.readFile(new URL('../functions/api/source-files/[[path]].js', import.meta.url), 'utf8');
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;

const cache = new Map();
globalThis.caches = {
  default: {
    async match(request) { return cache.get(request.url)?.clone() || null; },
    async put(request, response) { cache.set(request.url, response.clone()); },
  },
};

globalThis.fetch = async url => {
  if (String(url).includes('/auth/v1/user')) return Response.json({ id: 'user-1', email: 'g-test@moe-dl.edu.my' });
  if (String(url).includes('/rest/v1/authorized_users')) return Response.json([{ status: 'allowed' }]);
  return new Response('Not found', { status: 404 });
};

const objects = new Map(), uploads = new Map();
const bucket = {
  async put(key, body, options) {
    objects.set(key, { body: new Uint8Array(await new Response(body).arrayBuffer()), type: options?.httpMetadata?.contentType || '' });
  },
  async get(key) {
    const value = objects.get(key);if (!value) return null;
    return {
      body: value.body,
      httpEtag: 'etag-get',
      writeHttpMetadata(headers) { headers.set('content-type', value.type || 'application/octet-stream'); },
    };
  },
  async delete(key) { objects.delete(key); },
  async createMultipartUpload(key, options) {
    const uploadId = `upload-${uploads.size + 1}`;
    uploads.set(uploadId, { key, type: options?.httpMetadata?.contentType || '', parts: new Map() });
    return { key, uploadId };
  },
  resumeMultipartUpload(key, uploadId) {
    const upload = uploads.get(uploadId);
    if (!upload || upload.key !== key) throw new Error('Upload tidak ditemui');
    return {
      async uploadPart(partNumber, body) {
        upload.parts.set(partNumber, new Uint8Array(await new Response(body).arrayBuffer()));
        return { partNumber, etag: `etag-${partNumber}` };
      },
      async complete(parts) {
        const bytes = parts.flatMap(part => [...upload.parts.get(part.partNumber)]);
        objects.set(key, { body: new Uint8Array(bytes), type: upload.type });
        uploads.delete(uploadId);
        return { httpEtag: 'etag-complete' };
      },
      async abort() { uploads.delete(uploadId); },
    };
  },
};

const env = { RPH_SOURCE_FILES: bucket, SUPABASE_URL: 'https://project.supabase.co', SUPABASE_ANON_KEY: 'publishable-test' };
const auth = { authorization: 'Bearer valid-test-token' };
const mod = await import(moduleUrl);
const path = ['user-1', 'subject-1', 'textbook', 'large.pdf'];

const create = await mod.onRequestPost({
  env,
  params: { path },
  request: new Request(`https://example.test/api/source-files/${path.join('/')}?action=mpu-create`, { method: 'POST', headers: { ...auth, 'x-file-content-type': 'application/pdf' } }),
});
assert.equal(create.status, 200);
const { uploadId } = await create.json();

const uploadedParts = [];
for (const [partNumber, text] of [[1, 'abc'], [2, 'def']]) {
  const response = await mod.onRequestPut({
    env,
    params: { path },
    request: new Request(`https://example.test/api/source-files/${path.join('/')}?action=mpu-uploadpart&uploadId=${uploadId}&partNumber=${partNumber}`, { method: 'PUT', headers: auth, body: text }),
  });
  assert.equal(response.status, 200);
  uploadedParts.push(await response.json());
}

const complete = await mod.onRequestPost({
  env,
  params: { path },
  request: new Request(`https://example.test/api/source-files/${path.join('/')}?action=mpu-complete&uploadId=${uploadId}`, { method: 'POST', headers: { ...auth, 'content-type': 'application/json' }, body: JSON.stringify({ parts: uploadedParts }) }),
});
assert.equal(complete.status, 200);
assert.equal((await complete.json()).bucket, 'r2');

const get = await mod.onRequestGet({
  env,
  params: { path },
  request: new Request(`https://example.test/api/source-files/${path.join('/')}`, { headers: auth }),
});
assert.equal(get.status, 200);
assert.equal(await get.text(), 'abcdef');
assert.equal(get.headers.get('content-type'), 'application/pdf');

console.log('Cloudflare R2 source-files tests passed');
