"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type CatSelection = { category_id?: string; subcategory_id?: string; subsub_id?: string };

export default function CreatePromptForm({ initial, onSaved }: { initial?: any, onSaved?: (p: any) => void }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [promptText, setPromptText] = useState(initial?.prompt_text || '');
  const [requirementsText, setRequirementsText] = useState((initial?.requirements || []).join('\n') || '');
  const [instructionsText, setInstructionsText] = useState((initial?.instructions || []).join('\n') || '');
  const [seoTitle, setSeoTitle] = useState(initial?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(initial?.seo_description || '');
  const [prevTitle, setPrevTitle] = useState(initial?.title || '');
  const [loading, setLoading] = useState(false);
  const [categoriesTree, setCategoriesTree] = useState<any[]>([]);
  const [selections, setSelections] = useState<CatSelection[]>([{}]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategoriesTree(d.categories || []));
  }, []);

  // keep SEO title prefilled with prompt title unless user edits it
  useEffect(() => {
    if (!seoTitle || seoTitle === prevTitle) {
      setSeoTitle(title);
    }
    setPrevTitle(title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const addSelection = () => {
    if (selections.length >= 3) return alert('Max 3 category selections');
    setSelections([...selections, {}]);
  };

  const removeSelection = (idx: number) => {
    const s = [...selections]; s.splice(idx,1); setSelections(s);
  };

  const updateSelection = (idx: number, patch: Partial<CatSelection>) => {
    const s = [...selections]; s[idx] = { ...(s[idx]||{}), ...patch };
    if (patch.category_id) { s[idx].subcategory_id = undefined; s[idx].subsub_id = undefined; }
    if (patch.subcategory_id) { s[idx].subsub_id = undefined; }
    setSelections(s);
  };

  const handleFiles = (ev: any) => {
    const chosen: File[] = Array.from(ev.target.files || []);
    if (chosen.length + files.length > 5) return alert('Maximum 5 media files allowed');
    const videoCount = [...files, ...chosen].filter(f => f.type.startsWith('video/')).length;
    if (videoCount > 1) return alert('Only one video allowed');
    setFiles(prev => [...prev, ...chosen]);
  };

  const uploadAll = async (userId: string) => {
    if (files.length === 0) return [];
    if (!userId) throw new Error('no user id for upload');
    setUploading(true);
    const uploaded: any[] = [];
    const uploadErrors: any[] = [];
    for (const f of files) {
      const ext = f.name.split('.').pop();
      const key = `uploads/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('results').upload(key, f, { cacheControl: '3600', upsert: false });
      if (error) {
        console.error('upload error', error);
        uploadErrors.push({ file: f.name, error });
        continue;
      }
      // getPublicUrl may return different shapes across SDK versions; handle defensively
      const pub = supabase.storage.from('results').getPublicUrl(key) as any;
      const publicURL = (pub?.data && (pub.data.publicUrl || pub.data.publicURL)) || pub?.publicURL || pub?.publicUrl || '';
      if (!publicURL) {
        uploadErrors.push({ file: f.name, error: 'no public url returned' });
        continue;
      }
      const type = f.type.startsWith('image/') ? 'image' : (f.type.startsWith('video/') ? 'video' : (f.type.startsWith('audio/') ? 'audio' : 'scenario'));
      uploaded.push({ url: publicURL, type });
    }
    setUploading(false);
    if (uploadErrors.length > 0) {
      // throw the first error for the UI to show; keep console details for debugging
      const first = uploadErrors[0];
      throw new Error(first.error?.message || first.error || `upload failed for ${first.file}`);
    }
    return uploaded;
  };

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    // ensure user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    const token = session?.access_token;
    if (!token || !user) { setLoading(false); return alert('Please sign in'); }

    let result_urls: any[] = [];
    try {
      result_urls = await uploadAll(user.id);
    } catch (err: any) {
      console.error('[CreatePromptForm] upload failed', err, { session, user });
      // RLS hint
      if (String(err.message || '').toLowerCase().includes('row-level security')) {
        alert('Upload failed: row-level security prevented storage write. Ensure you are signed in, or configure storage permissions / upload via server.');
      } else {
        alert('Upload failed: ' + (err.message || String(err)));
      }
      setLoading(false);
      return;
    }
    if (result_urls.length < 1) { setLoading(false); return alert('Please upload at least one image'); }
    const videoCount = result_urls.filter(r => r.type === 'video').length; if (videoCount > 1) { setLoading(false); return alert('Only one video allowed'); }

    const catsPayload = selections.map(s => ({ category_id: s.category_id, subcategory_id: s.subcategory_id, subsub_id: s.subsub_id }));

    const requirements = (requirementsText || '').split('\n').map(s => s.trim()).filter(Boolean);
    const instructions = (instructionsText || '').split('\n').map(s => s.trim()).filter(Boolean);

    const payload = { title, slug, description, prompt_text: promptText, result_urls, categories: catsPayload, requirements, instructions, seo_title: seoTitle, seo_description: seoDescription };
    const res = await fetch('/api/prompts/create', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
    let json: any = {};
    try {
      json = await res.json();
    } catch (err) {
      const text = await res.text();
      setLoading(false);
      return alert('Create failed: ' + text);
    }
    setLoading(false);
    if (!res.ok) return alert(json.error || json.message || 'Create failed');
    onSaved?.(json.prompt);
    alert('Prompt saved' + (json.prompt.status === 'pending' ? ' (pending review)' : ''));
  };

  return (
    <form onSubmit={submit} className="space-y-3 bg-white/3 p-4 rounded">
      <div>
        <label className="block text-sm">Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-black/20 rounded" />
      </div>
      <div>
        <label className="block text-sm">Slug (unique)</label>
        <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full p-2 bg-black/20 rounded" />
      </div>
      <div>
        <label className="block text-sm">Description</label>
        <input value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 bg-black/20 rounded" />
      </div>
      <div>
        <label className="block text-sm">Prompt Text</label>
        <textarea value={promptText} onChange={e => setPromptText(e.target.value)} rows={6} className="w-full p-2 bg-black/20 rounded" />
      </div>

      <div>
        <label className="block text-sm">Requirements (one per line, optional)</label>
        <textarea value={requirementsText} onChange={e => setRequirementsText(e.target.value)} rows={3} className="w-full p-2 bg-black/20 rounded" />
      </div>

      <div>
        <label className="block text-sm">Instructions / Steps (one per line, optional)</label>
        <textarea value={instructionsText} onChange={e => setInstructionsText(e.target.value)} rows={4} className="w-full p-2 bg-black/20 rounded" />
      </div>

      <div>
        <label className="block text-sm">SEO Title (optional)</label>
        <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="w-full p-2 bg-black/20 rounded" />
      </div>

      <div>
        <label className="block text-sm">SEO Description (optional)</label>
        <textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} rows={2} className="w-full p-2 bg-black/20 rounded" />
      </div>

      <div>
        <label className="block text-sm">Media (1-5 files, max 1 video)</label>
        <input type="file" multiple onChange={handleFiles} accept="image/*,video/*,audio/*" />
        <div className="flex gap-2 mt-2 flex-wrap">
          {files.map((f, i) => <div key={i} className="text-sm bg-black/20 px-2 py-1 rounded">{f.name}</div>)}
        </div>
      </div>

      <div>
        <label className="block text-sm">Categories (select up to 3)</label>
        {selections.map((sel, idx) => (
          <div key={idx} className="flex gap-2 items-center my-2">
            <select value={sel.category_id || ''} onChange={e => updateSelection(idx, { category_id: e.target.value })} className="p-2 bg-black/20 rounded">
              <option value="">Choose category</option>
              {categoriesTree.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
            </select>
            <select value={sel.subcategory_id || ''} onChange={e => updateSelection(idx, { subcategory_id: e.target.value })} className="p-2 bg-black/20 rounded">
              <option value="">Choose subcategory</option>
              {(categoriesTree.find(c => c.id === sel.category_id)?.subcategories || []).map((s: any) => <option value={s.id} key={s.id}>{s.name}</option>)}
            </select>
            <select value={sel.subsub_id || ''} onChange={e => updateSelection(idx, { subsub_id: e.target.value })} className="p-2 bg-black/20 rounded">
              <option value="">Choose sub-sub</option>
              {(categoriesTree.flatMap(c => c.subcategories).find((s: any) => s.id === sel.subcategory_id)?.subsub || []).map((ss: any) => <option value={ss.id} key={ss.id}>{ss.name}</option>)}
            </select>
            <button type="button" onClick={() => removeSelection(idx)} className="px-2 py-1 bg-red-600 rounded">Remove</button>
          </div>
        ))}
        <div>
          <button type="button" onClick={addSelection} className="px-3 py-1 bg-white/6 rounded">Add Category</button>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="px-4 py-2 bg-pink-600 rounded" disabled={loading || uploading}>{(loading||uploading) ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}
