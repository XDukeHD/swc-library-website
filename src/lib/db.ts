import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Game, Category, Publisher, DownloadLink, Comment, Report, Admin, Mirror, DirectDownloadOption } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!;

export function getPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

export async function getServerClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {}
      },
    },
  });
}

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const db = {
  async getCategories(): Promise<Category[]> {
    const supabase = getPublicClient();
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) console.error('getCategories error:', error.message);
    return data || [];
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const supabase = getPublicClient();
    const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle();
    if (error) console.error('getCategoryBySlug error:', error.message);
    return data;
  },

  async createCategory(name: string, slug: string): Promise<Category> {
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from('categories')
      .insert([{ id: generateId(), name, slug }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, name: string, slug: string): Promise<Category> {
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from('categories')
      .update({ name, slug })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCategory(id: string): Promise<void> {
    const supabase = await getServerClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },

  async getPublishers(): Promise<Publisher[]> {
    const supabase = getPublicClient();
    const { data, error } = await supabase.from('publishers').select('*').order('name');
    if (error) console.error('getPublishers error:', error.message);
    return data || [];
  },

  async getPublisherBySlug(slug: string): Promise<Publisher | null> {
    const supabase = getPublicClient();
    const { data, error } = await supabase.from('publishers').select('*').eq('slug', slug).maybeSingle();
    if (error) console.error('getPublisherBySlug error:', error.message);
    return data;
  },

  async createPublisher(name: string, slug: string, logo: string, description: string): Promise<Publisher> {
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from('publishers')
      .insert([{ id: generateId(), name, slug, logo, description }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePublisher(id: string, name: string, slug: string, logo: string, description: string): Promise<Publisher> {
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from('publishers')
      .update({ name, slug, logo, description })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletePublisher(id: string): Promise<void> {
    const supabase = await getServerClient();
    const { error } = await supabase.from('publishers').delete().eq('id', id);
    if (error) throw error;
  },

  async getGames(): Promise<(Game & { publisher?: Publisher; categories?: Category[]; download_links?: DownloadLink[] })[]> {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from('games')
      .select('*, publisher:publishers(*), game_categories(category:categories(*)), download_links(*), direct_download_options(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getGames error:', error.message);
      return [];
    }

    if (!data) return [];

    return data.map((game: any) => ({
      ...game,
      publisher: game.publisher || undefined,
      categories: game.game_categories?.map((gc: any) => gc.category).filter(Boolean) || [],
      download_links: game.download_links || [],
      direct_download_options: (game.direct_download_options || []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    }));
  },

  async getGameBySlug(slug: string): Promise<(Game & { publisher?: Publisher; categories?: Category[]; download_links?: DownloadLink[]; comments?: Comment[]; direct_download_options?: DirectDownloadOption[] }) | null> {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from('games')
      .select('*, publisher:publishers(*), game_categories(category:categories(*)), download_links(*), comments(*), direct_download_options(*)')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('getGameBySlug error:', error.message);
      return null;
    }

    if (!data) return null;

    const comments = (data.comments || []).sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const directOpts = (data.direct_download_options || []).sort(
      (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );

    return {
      ...data,
      publisher: data.publisher || undefined,
      categories: data.game_categories?.map((gc: any) => gc.category).filter(Boolean) || [],
      download_links: data.download_links || [],
      comments,
      direct_download_options: directOpts,
    };
  },

  async getGamesByPublisher(publisherId: string): Promise<(Game & { publisher?: Publisher; categories?: Category[] })[]> {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from('games')
      .select('*, publisher:publishers(*), game_categories(category:categories(*))')
      .eq('publisher_id', publisherId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getGamesByPublisher error:', error.message);
      return [];
    }

    if (!data) return [];

    return data.map((game: any) => ({
      ...game,
      publisher: game.publisher || undefined,
      categories: game.game_categories?.map((gc: any) => gc.category).filter(Boolean) || [],
    }));
  },

  async getGamesByCategory(categoryId: string): Promise<(Game & { publisher?: Publisher; categories?: Category[] })[]> {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from('game_categories')
      .select('game:games(*, publisher:publishers(*), game_categories(category:categories(*)))')
      .eq('category_id', categoryId);

    if (error) {
      console.error('getGamesByCategory error:', error.message);
      return [];
    }

    if (!data) return [];

    return data
      .map((row: any) => {
        const game = row.game;
        if (!game) return null;
        return {
          ...game,
          publisher: game.publisher || undefined,
          categories: game.game_categories?.map((gc: any) => gc.category).filter(Boolean) || [],
        };
      })
      .filter(Boolean) as any[];
  },

  async createGame(gameData: Partial<Game>, categoryIds: string[], downloadLinks: { version: string; mirrors: Mirror[] }[]): Promise<Game> {
    const supabase = await getServerClient();
    const id = generateId();
    const { data, error } = await supabase
      .from('games')
      .insert([{ ...gameData, id }])
      .select()
      .single();

    if (error) throw error;

    if (categoryIds.length > 0) {
      const gameCats = categoryIds.map((catId) => ({ game_id: id, category_id: catId }));
      await supabase.from('game_categories').insert(gameCats);
    }

    if (downloadLinks.length > 0) {
      const links = downloadLinks.map((link) => ({
        id: generateId(),
        game_id: id,
        version: link.version,
        mirrors: link.mirrors,
      }));
      await supabase.from('download_links').insert(links);
    }

    return data;
  },

  async updateGame(id: string, gameData: Partial<Game>, categoryIds: string[], downloadLinks: { version: string; mirrors: Mirror[] }[]): Promise<Game> {
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from('games')
      .update(gameData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('game_categories').delete().eq('game_id', id);
    if (categoryIds.length > 0) {
      const gameCats = categoryIds.map((catId) => ({ game_id: id, category_id: catId }));
      await supabase.from('game_categories').insert(gameCats);
    }

    await supabase.from('download_links').delete().eq('game_id', id);
    if (downloadLinks.length > 0) {
      const links = downloadLinks.map((link) => ({
        id: generateId(),
        game_id: id,
        version: link.version,
        mirrors: link.mirrors,
      }));
      await supabase.from('download_links').insert(links);
    }

    return data;
  },

  async deleteGame(id: string): Promise<void> {
    const supabase = await getServerClient();
    const { error } = await supabase.from('games').delete().eq('id', id);
    if (error) throw error;
  },

  async incrementLikes(id: string): Promise<number> {
    const supabase = getPublicClient();
    const { data } = await supabase.from('games').select('likes').eq('id', id).maybeSingle();
    const newLikes = (data?.likes || 0) + 1;
    await supabase.from('games').update({ likes: newLikes }).eq('id', id);
    return newLikes;
  },

  async getComments(): Promise<(Comment & { game_title?: string })[]> {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from('comments')
      .select('*, games(title)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getComments error:', error.message);
      return [];
    }

    if (!data) return [];

    return data.map((comm: any) => ({
      ...comm,
      game_title: comm.games?.title || 'Unknown Game',
    }));
  },

  async addComment(gameId: string, username: string, email: string, content: string): Promise<Comment> {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from('comments')
      .insert([{ id: generateId(), game_id: gameId, username, email, content }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteComment(id: string): Promise<void> {
    const supabase = await getServerClient();
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) throw error;
  },

  async getReports(): Promise<(Report & { game_title?: string })[]> {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from('reports')
      .select('*, games(title)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getReports error:', error.message);
      return [];
    }

    if (!data) return [];

    return data.map((rep: any) => ({
      ...rep,
      game_title: rep.games?.title || 'Unknown Game',
    }));
  },

  async addReport(gameId: string, email: string, reason: string): Promise<Report> {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from('reports')
      .insert([{ id: generateId(), game_id: gameId, email, reason, resolved: false }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async resolveReport(id: string): Promise<void> {
    const supabase = await getServerClient();
    const { error } = await supabase.from('reports').update({ resolved: true }).eq('id', id);
    if (error) throw error;
  },

  async getAdmins(): Promise<Admin[]> {
    const supabase = await getServerClient();
    const { data, error } = await supabase.from('admins').select('*');
    if (error) console.error('getAdmins error:', error.message);
    return data || [];
  },

  async addAdmin(userId: string, role: 'admin' | 'super_admin'): Promise<Admin> {
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from('admins')
      .insert([{ id: generateId(), user_id: userId, role }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async removeAdmin(id: string): Promise<void> {
    const supabase = await getServerClient();
    const { error } = await supabase.from('admins').delete().eq('id', id);
    if (error) throw error;
  },


  async getDirectDownloadOptions(gameId: string): Promise<DirectDownloadOption[]> {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from('direct_download_options')
      .select('*')
      .eq('game_id', gameId)
      .order('sort_order', { ascending: true });
    if (error) console.error('getDirectDownloadOptions error:', error.message);
    return data || [];
  },

  async createDirectDownloadOption(
    gameId: string,
    label: string,
    cdnUrl: string,
    fileSize?: string,
    version?: string,
    region?: string,
    sortOrder?: number
  ): Promise<DirectDownloadOption> {
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from('direct_download_options')
      .insert([{
        id: generateId(),
        game_id: gameId,
        label,
        cdn_url: cdnUrl,
        file_size: fileSize || null,
        version: version || null,
        region: region || 'Global',
        sort_order: sortOrder ?? 0,
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateDirectDownloadOption(
    id: string,
    label: string,
    cdnUrl: string,
    fileSize?: string,
    version?: string,
    region?: string,
    sortOrder?: number
  ): Promise<DirectDownloadOption> {
    const supabase = await getServerClient();
    const { data, error } = await supabase
      .from('direct_download_options')
      .update({ label, cdn_url: cdnUrl, file_size: fileSize, version, region, sort_order: sortOrder })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteDirectDownloadOption(id: string): Promise<void> {
    const supabase = await getServerClient();
    const { error } = await supabase.from('direct_download_options').delete().eq('id', id);
    if (error) throw error;
  },

  async replaceDirectDownloadOptions(
    gameId: string,
    options: Omit<DirectDownloadOption, 'id' | 'created_at'>[]
  ): Promise<void> {
    const supabase = await getServerClient();
    const { error: deleteError } = await supabase.from('direct_download_options').delete().eq('game_id', gameId);
    if (deleteError) throw deleteError;
    if (options.length > 0) {
      const rows = options.map((opt, idx) => ({
        id: generateId(),
        game_id: gameId,
        label: opt.label,
        cdn_url: opt.cdn_url,
        file_size: opt.file_size || null,
        version: opt.version || null,
        region: opt.region || 'Global',
        sort_order: opt.sort_order ?? idx,
      }));
      const { error: insertError } = await supabase.from('direct_download_options').insert(rows);
      if (insertError) throw insertError;
    }
  },


  async getGameByIdentifier(identifier: string): Promise<(Game & { publisher?: Publisher; categories?: Category[]; download_links?: DownloadLink[]; direct_download_options?: DirectDownloadOption[] }) | null> {
    const supabase = getPublicClient();

    let { data, error } = await supabase
      .from('games')
      .select('*, publisher:publishers(*), game_categories(category:categories(*)), download_links(*), direct_download_options(*)')
      .eq('slug', identifier)
      .maybeSingle();

    if (!data && !error) {
      ({ data, error } = await supabase
        .from('games')
        .select('*, publisher:publishers(*), game_categories(category:categories(*)), download_links(*), direct_download_options(*)')
        .eq('title_id', identifier)
        .maybeSingle());
    }

    if (!data && !error) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(identifier)) {
        ({ data, error } = await supabase
          .from('games')
          .select('*, publisher:publishers(*), game_categories(category:categories(*)), download_links(*), direct_download_options(*)')
          .eq('id', identifier)
          .maybeSingle());
      }
    }

    if (error) {
      console.error('getGameByIdentifier error:', error.message);
      return null;
    }

    if (!data) return null;

    const directOpts = (data.direct_download_options || []).sort(
      (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );

    return {
      ...data,
      publisher: data.publisher || undefined,
      categories: data.game_categories?.map((gc: any) => gc.category).filter(Boolean) || [],
      download_links: data.download_links || [],
      direct_download_options: directOpts,
    };
  },
};

