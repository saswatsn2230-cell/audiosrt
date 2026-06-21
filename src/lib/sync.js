// Cloud sync for Starter/Pro users — subtitle JSON only, no audio/video files

const SUPABASE_URL = 'https://mjqtgkytimwjzchtfnix.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcXRna3l0aW13anpjaHRmbml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTcyNzEsImV4cCI6MjA5NzM3MzI3MX0.8Ed1p_XfbYP7nscVoiXfdm2LsMDb5pvTj4NZqARinEc'

async function _supabaseFetch(path, method, body, accessToken) {
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
  }
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok && res.status !== 404) {
    const text = await res.text()
    throw new Error(text)
  }
  return res.status === 204 ? null : res.json().catch(() => null)
}

export async function syncProjectToCloud(userId, projectId, config, accessToken) {
  const payload = {
    id: `${userId}_${projectId}`,
    user_id: userId,
    project_name: config.filename,
    subtitle_data: JSON.stringify({
      segments: config.segments,
      settings: config.settings,
    }),
    updated_at: new Date().toISOString(),
  }

  try {
    await _supabaseFetch(
      `projects?id=eq.${encodeURIComponent(payload.id)}`,
      'DELETE',
      null,
      accessToken
    )
    await _supabaseFetch('projects', 'POST', payload, accessToken)
    console.log('[Sync] Project synced to cloud:', config.filename)
    return true
  } catch (err) {
    console.warn('[Sync] Cloud sync failed (non-critical):', err.message)
    return false
  }
}

export async function loadProjectsFromCloud(userId, accessToken) {
  try {
    const data = await _supabaseFetch(
      `projects?user_id=eq.${userId}&order=updated_at.desc`,
      'GET',
      null,
      accessToken
    )
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.warn('[Sync] Could not load cloud projects:', err.message)
    return []
  }
}

export async function deleteProjectFromCloud(userId, projectId, accessToken) {
  const id = `${userId}_${projectId}`
  try {
    await _supabaseFetch(
      `projects?id=eq.${encodeURIComponent(id)}`,
      'DELETE',
      null,
      accessToken
    )
  } catch (err) {
    console.warn('[Sync] Delete failed:', err.message)
  }
}
