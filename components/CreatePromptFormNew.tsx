"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type CatSelection = { category_id?: string; subcategory_id?: string; subsub_id?: string };

interface ResultItem {
  id?: string;
  name: string;
  type: 'image' | 'result_video' | 'tutorial_video' | 'video_link';
  prompt: string;
  url: string;
  is_public_link: boolean;
  file?: File;
  display_order: number;
}

export default function CreatePromptFormNew({ initial, onSaved }: { initial?: any; onSaved?: (p: any) => void }) {
  // Basic fields
  const [title, setTitle] = useState(initial?.title || '');
  const [contentType, setContentType] = useState(initial?.content_type || 'prompt');
  const [resultOutputType, setResultOutputType] = useState(initial?.result_output_type || 'image');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [promptText, setPromptText] = useState(initial?.prompt_text || '');
  const [promptTemplate, setPromptTemplate] = useState(initial?.prompt_template || '');
  const [requirementsText, setRequirementsText] = useState((initial?.requirements || []).join('\n') || '');
  const [instructionsText, setInstructionsText] = useState((initial?.instructions || []).join('\n') || '');
  const [seoTitle, setSeoTitle] = useState(initial?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(initial?.seo_description || '');
  const [tagsText, setTagsText] = useState((initial?.tags || []).join(', ') || '');

  // Categories & selections
  const [categoriesTree, setCategoriesTree] = useState<any[]>([]);
  const [selections, setSelections] = useState<CatSelection[]>([{}]);

  // Results management
  const [results, setResults] = useState<ResultItem[]>([]);
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'image' | 'video' | 'link'>('image');

  // State
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [prevTitle, setPrevTitle] = useState(initial?.title || '');
  const [videoTutorialCategories, setVideoTutorialCategories] = useState<any[]>(initial?.video_tutorial_categories || []);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategoriesTree(d.categories || []));
  }, []);

  // Auto-update SEO title
  useEffect(() => {
    if (!seoTitle || seoTitle === prevTitle) {
      setSeoTitle(title);
    }
    setPrevTitle(title);
  }, [title, seoTitle, prevTitle]);

  // Category helpers
  const addSelection = () => {
    if (selections.length >= 3) return alert('Max 3 category selections');
    setSelections([...selections, {}]);
  };

  const removeSelection = (idx: number) => {
    const s = [...selections];
    s.splice(idx, 1);
    setSelections(s);
  };

  const updateSelection = (idx: number, patch: Partial<CatSelection>) => {
    const s = [...selections];
    s[idx] = { ...(s[idx] || {}), ...patch };
    if (patch.category_id) {
      s[idx].subcategory_id = undefined;
      s[idx].subsub_id = undefined;
    }
    if (patch.subcategory_id) {
      s[idx].subsub_id = undefined;
    }
    setSelections(s);
  };

  const filteredCategories = contentType === 'all' ? categoriesTree : categoriesTree.filter(c => c.type === contentType);

  // Result management
  const addResult = (type: ResultItem['type']) => {
    setResults([
      ...results,
      {
        id: `new-${Date.now()}`,
        name: '',
        type,
        prompt: '',
        url: '',
        is_public_link: type === 'video_link',
        display_order: results.length,
      },
    ]);
  };

  const updateResult = (id: string, patch: Partial<ResultItem>) => {
    setResults(results.map(r => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeResult = (id: string) => {
    setResults(results.filter(r => r.id !== id));
  };

  const handleFileForResult = (id: string, file: File) => {
    updateResult(id, { file, url: URL.createObjectURL(file) });
  };

  const uploadResultFiles = async (userId: string): Promise<any[]> => {
    const uploaded: any[] = [];
    const uploadErrors: any[] = [];

    for (const result of results) {
      if (!result.file) continue;

      const ext = result.file.name.split('.').pop();
      const key = `uploads/${userId}/result-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage.from('results').upload(key, result.file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        uploadErrors.push({ file: result.file.name, error });
        continue;
      }

      const pub = supabase.storage.from('results').getPublicUrl(key) as any;
      const publicURL = pub?.data?.publicUrl || pub?.publicURL || pub?.publicUrl || '';

      if (!publicURL) {
        uploadErrors.push({ file: result.file.name, error: 'no public url returned' });
        continue;
      }

      uploaded.push({
        resultId: result.id,
        url: publicURL,
      });
    }

    if (uploadErrors.length > 0) {
      const first = uploadErrors[0];
      throw new Error(first.error?.message || first.error || `upload failed for ${first.file}`);
    }

    return uploaded;
  };

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Auth
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      const token = session?.access_token;

      if (!token || !user) {
        alert('Please sign in');
        setLoading(false);
        return;
      }

      // Validate results
      if (results.length === 0) {
        alert('Please add at least one result (image, video, or link)');
        setLoading(false);
        return;
      }

      // Validate each result has name and prompt
      for (const r of results) {
        if (!r.name.trim()) {
          alert(`Result missing name`);
          setLoading(false);
          return;
        }
        if (!r.prompt.trim()) {
          alert(`Result "${r.name}" missing prompt/description`);
          setLoading(false);
          return;
        }
      }

      // Upload files
      setUploading(true);
      let uploadedFiles: any[] = [];
      try {
        uploadedFiles = await uploadResultFiles(user.id);
      } catch (err: any) {
        alert('Upload failed: ' + (err.message || String(err)));
        setLoading(false);
        setUploading(false);
        return;
      }
      setUploading(false);

      // Update result URLs from uploads
      const updatedResults = results.map(r => {
        const uploaded = uploadedFiles.find(u => u.resultId === r.id);
        return {
          ...r,
          url: uploaded?.url || r.url,
        };
      });

      // Build payload
      const catsPayload = selections.map(s => ({
        category_id: s.category_id,
        subcategory_id: s.subcategory_id,
        subsub_id: s.subsub_id,
      }));

      const requirements = (requirementsText || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      const instructions = (instructionsText || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      const tags = tagsText
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const payload = {
        title,
        slug,
        description,
        prompt_text: promptText,
        prompt_template: promptTemplate,
        categories: catsPayload,
        requirements,
        instructions,
        seo_title: seoTitle,
        seo_description: seoDescription,
        content_type: contentType,
        result_output_type: resultOutputType,
        video_tutorial_categories: contentType === 'video_tutorial' ? videoTutorialCategories : null,
        tags,
        results: updatedResults.map(r => ({
          name: r.name,
          type: r.type,
          prompt_description: r.prompt,
          url: r.url,
          is_public_link: r.is_public_link,
          display_order: r.display_order,
        })),
      };

      const res = await fetch('/api/prompts/create', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let json: any = {};
      try {
        json = await res.json();
      } catch (err) {
        const text = await res.text();
        alert('Create failed: ' + text);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        alert(json.error || json.message || 'Create failed');
        setLoading(false);
        return;
      }

      onSaved?.(json.prompt);
      alert('Prompt saved' + (json.prompt.status === 'pending' ? ' (pending review)' : ''));
    } catch (err: any) {
      console.error('submit error', err);
      alert('Error: ' + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 bg-white/3 p-6 rounded-lg">
      {/* Basic Info */}
      <section className="space-y-3 border-b border-white/10 pb-4">
        <h3 className="text-lg font-semibold text-white">Basic Information</h3>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Content Type</label>
          <select
            value={contentType}
            onChange={e => {
              setContentType(e.target.value);
              if (e.target.value === 'video_tutorial') setResultOutputType('video');
            }}
            className="w-full p-2 bg-black/20 rounded border border-white/10 text-white"
          >
            <option value="prompt">Prompt</option>
            <option value="video_tutorial">Video Tutorial</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Expected Output Type</label>
          {contentType === 'video_tutorial' ? (
            <div className="p-2 bg-black/20 rounded text-sm text-gray-300">Video (Default for tutorials)</div>
          ) : (
            <select
              value={resultOutputType}
              onChange={e => setResultOutputType(e.target.value)}
              className="w-full p-2 bg-black/20 rounded border border-white/10 text-white"
            >
              <option value="image">Image</option>
              <option value="text">Text</option>
              <option value="video">Video</option>
              <option value="code">Code</option>
              <option value="design">Design / File</option>
              <option value="other">Other</option>
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-2 bg-black/20 rounded border border-white/10 text-white"
            placeholder="Prompt title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Slug (unique URL identifier) *</label>
          <input
            value={slug}
            onChange={e => setSlug(e.target.value)}
            className="w-full p-2 bg-black/20 rounded border border-white/10 text-white"
            placeholder="unique-slug"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Short Description</label>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full p-2 bg-black/20 rounded border border-white/10 text-white"
            placeholder="One-line description for listing"
          />
        </div>
      </section>

      {/* Prompt Content */}
      <section className="space-y-3 border-b border-white/10 pb-4">
        <h3 className="text-lg font-semibold text-white">Prompt Content</h3>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Main Prompt / Instructions *</label>
          <textarea
            value={promptText}
            onChange={e => setPromptText(e.target.value)}
            rows={8}
            className="w-full p-2 bg-black/20 rounded border border-white/10 text-white font-mono text-sm"
            placeholder="Enter the main prompt text that users will copy..."
            required
          />
          <p className="text-xs text-gray-400 mt-1">Users will copy this prompt to use with AI models</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Prompt Template (Optional)</label>
          <textarea
            value={promptTemplate}
            onChange={e => setPromptTemplate(e.target.value)}
            rows={6}
            className="w-full p-2 bg-black/20 rounded border border-white/10 text-white font-mono text-sm"
            placeholder="Template with variables like [CITY_NAME], [COLOR], etc. Users can customize..."
          />
          <p className="text-xs text-gray-400 mt-1">Provide a customizable template if applicable</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Requirements (one per line)</label>
          <textarea
            value={requirementsText}
            onChange={e => setRequirementsText(e.target.value)}
            rows={3}
            className="w-full p-2 bg-black/20 rounded border border-white/10 text-white"
            placeholder="e.g. ChatGPT Plus&#10;Stable Diffusion account"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Instructions / Steps (one per line)</label>
          <textarea
            value={instructionsText}
            onChange={e => setInstructionsText(e.target.value)}
            rows={4}
            className="w-full p-2 bg-black/20 rounded border border-white/10 text-white"
            placeholder="Step 1: Copy the prompt&#10;Step 2: Paste into ChatGPT"
          />
        </div>
      </section>

      {/* Results/Media */}
      <section className="space-y-3 border-b border-white/10 pb-4">
        <h3 className="text-lg font-semibold text-white">Results & Examples *</h3>
        <p className="text-sm text-gray-300">
          Each result (image, video, or link) must have a name and description of how it was created
        </p>

        {results.length > 0 && (
          <div className="space-y-2 bg-black/30 rounded-lg p-3">
            {results.map((result, idx) => (
              <div key={result.id} className="bg-white/5 rounded p-3 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-pink-600 px-2 py-1 rounded text-white font-semibold">
                      {result.type === 'result_video' ? 'Video' : result.type === 'tutorial_video' ? 'Tutorial' : result.type === 'video_link' ? 'Link' : 'Image'}
                    </span>
                    <span className="text-sm font-medium text-white">{result.name || '(no name)'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      removeResult(result.id!);
                    }}
                    className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white"
                  >
                    Remove
                  </button>
                </div>
                <div className="text-sm text-gray-300 line-clamp-2">{result.prompt || '(no description)'}</div>
              </div>
            ))}
          </div>
        )}

        {/* Add Result Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addResult('image')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium text-white transition"
          >
            + Add Image
          </button>
          <button
            type="button"
            onClick={() => addResult('result_video')}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium text-white transition"
          >
            + Add Video
          </button>
          <button
            type="button"
            onClick={() => addResult('video_link')}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium text-white transition"
          >
            + Add Video Link
          </button>
          {contentType === 'video_tutorial' && (
            <button
              type="button"
              onClick={() => addResult('tutorial_video')}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm font-medium text-white transition"
            >
              + Add Tutorial Video
            </button>
          )}
        </div>

        {/* Result Editor */}
        {results.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="text-sm font-semibold text-white">Edit Results</h4>
            {results.map((result, idx) => (
              <div
                key={result.id}
                className="bg-black/40 rounded-lg border border-white/20 p-4 transition"
              >
                <div 
                  className="flex items-center justify-between cursor-pointer hover:opacity-80"
                  onClick={() => setExpandedResultId(expandedResultId === result.id ? null : result.id)}
                >
                  <div className="flex items-center gap-2">
                    <svg className={`w-4 h-4 text-pink-400 transform transition-transform ${expandedResultId === result.id ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-medium text-white">
                      {result.type === 'result_video' ? '🎬' : result.type === 'tutorial_video' ? '📹' : result.type === 'video_link' ? '🔗' : '🖼️'} {result.name || `Result ${idx + 1}`}
                    </span>
                  </div>
                </div>

                {expandedResultId === result.id && (
                  <div className="mt-4 space-y-3 pt-4 border-t border-white/10" onClick={e => e.stopPropagation()}>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Name/Title *</label>
                      <input
                        value={result.name}
                        onChange={e => updateResult(result.id!, { name: e.target.value })}
                        className="w-full p-2 bg-black/20 rounded border border-white/10 text-white text-sm"
                        placeholder="e.g. Seoul Travel Poster, Code Example Output"
                      />
                      <p className="text-xs text-gray-400 mt-1">Used as alt text for SEO and to identify the result</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Prompt/Description *</label>
                      <textarea
                        value={result.prompt}
                        onChange={e => updateResult(result.id!, { prompt: e.target.value })}
                        rows={4}
                        className="w-full p-2 bg-black/20 rounded border border-white/10 text-white text-sm"
                        placeholder="Describe how this result was created, what prompts were used, settings, etc."
                      />
                    </div>

                    {(result.type === 'image' || result.type === 'result_video' || result.type === 'tutorial_video') && (
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Upload {result.type === 'image' ? 'Image' : 'Video'} *
                        </label>
                        <input
                          type="file"
                          accept={result.type === 'image' ? 'image/*' : 'video/*'}
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleFileForResult(result.id!, file);
                          }}
                          className="w-full p-2 bg-black/20 rounded border border-white/10 text-white text-sm"
                        />
                        {result.file && (
                          <p className="text-xs text-green-400 mt-1">✓ {result.file.name} selected</p>
                        )}
                      </div>
                    )}

                    {result.type === 'video_link' && (
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">Video URL *</label>
                        <input
                          value={result.url}
                          onChange={e => updateResult(result.id!, { url: e.target.value })}
                          className="w-full p-2 bg-black/20 rounded border border-white/10 text-white text-sm"
                          placeholder="https://youtu.be/... or https://vimeo.com/..."
                        />
                        <p className="text-xs text-gray-400 mt-1">YouTube, Vimeo, or other video platform URL</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Display Order</label>
                      <input
                        type="number"
                        value={result.display_order}
                        onChange={e => updateResult(result.id!, { display_order: parseInt(e.target.value) || 0 })}
                        className="w-full p-2 bg-black/20 rounded border border-white/10 text-white text-sm"
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="space-y-3 border-b border-white/10 pb-4">
        <h3 className="text-lg font-semibold text-white">Categories</h3>

        {selections.map((sel, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <select
              value={sel.category_id || ''}
              onChange={e => updateSelection(idx, { category_id: e.target.value })}
              className="flex-1 p-2 bg-black/20 rounded border border-white/10 text-white text-sm"
            >
              <option value="">Choose category</option>
              {filteredCategories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {sel.category_id && (
              <select
                value={sel.subcategory_id || ''}
                onChange={e => updateSelection(idx, { subcategory_id: e.target.value })}
                className="flex-1 p-2 bg-black/20 rounded border border-white/10 text-white text-sm"
              >
                <option value="">Choose subcategory</option>
                {(filteredCategories.find(c => c.id === sel.category_id)?.subcategories || []).map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}

            {contentType !== 'video_tutorial' && sel.subcategory_id && (
              <select
                value={sel.subsub_id || ''}
                onChange={e => updateSelection(idx, { subsub_id: e.target.value })}
                className="flex-1 p-2 bg-black/20 rounded border border-white/10 text-white text-sm"
              >
                <option value="">Choose sub-subcategory</option>
                {(categoriesTree
                  .flatMap(c => c.subcategories)
                  .find((s: any) => s.id === sel.subcategory_id)?.subsub || []).map((ss: any) => (
                  <option key={ss.id} value={ss.id}>
                    {ss.name}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={() => removeSelection(idx)}
              className="px-2 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addSelection}
          className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm"
        >
          + Add Category
        </button>
      </section>

      {/* Tags & SEO */}
      <section className="space-y-3 border-b border-white/10 pb-4">
        <h3 className="text-lg font-semibold text-white">Tags & SEO</h3>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Tags (comma-separated)</label>
          <input
            value={tagsText}
            onChange={e => setTagsText(e.target.value)}
            className="w-full p-2 bg-black/20 rounded border border-white/10 text-white"
            placeholder="stable diffusion, anime, portrait, chatgpt"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">SEO Title</label>
          <input
            value={seoTitle}
            onChange={e => setSeoTitle(e.target.value)}
            className="w-full p-2 bg-black/20 rounded border border-white/10 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">SEO Description</label>
          <textarea
            value={seoDescription}
            onChange={e => setSeoDescription(e.target.value)}
            rows={2}
            className="w-full p-2 bg-black/20 rounded border border-white/10 text-white"
          />
        </div>
      </section>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 rounded-lg text-white font-semibold transition"
        >
          {loading || uploading ? 'Saving & Uploading...' : 'Save Prompt'}
        </button>
      </div>
    </form>
  );
}
