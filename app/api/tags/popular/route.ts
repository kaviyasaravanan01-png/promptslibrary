import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

export async function GET() {
  try {
    // Fetch all approved prompts with tags
    const { data, error } = await supabaseAdmin
      .from('prompts')
      .select('tags')
      .eq('status', 'approved')
      .not('tags', 'is', null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Aggregate all tags and count their frequency
    const tagCount: Record<string, number> = {};
    (data || []).forEach((prompt: any) => {
      if (Array.isArray(prompt.tags)) {
        prompt.tags.forEach((tag: string) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    // Sort by frequency and return top 20
    const sortedTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag]) => tag);

    return NextResponse.json({ tags: sortedTags });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'server error' }, { status: 500 });
  }
}
