'use server';

import { revalidatePath } from 'next/cache';
import { db, getPublicClient, getServerClient } from './db';
import { Game, Mirror } from './types';

export async function likeGameAction(gameId: string) {
  const newLikes = await db.incrementLikes(gameId);
  revalidatePath(`/roms/${gameId}`);
  revalidatePath('/');
  return newLikes;
}

export async function addCommentAction(gameId: string, username: string, email: string, content: string) {
  if (!username || !email || !content) {
    throw new Error('All fields are required');
  }
  const comment = await db.addComment(gameId, username, email, content);
  revalidatePath(`/roms/${gameId}`);
  revalidatePath('/admin');
  return comment;
}

export async function deleteCommentAction(commentId: string) {
  await db.deleteComment(commentId);
  revalidatePath('/admin');
  return { success: true };
}

export async function addReportAction(gameId: string, email: string, reason: string) {
  if (!email || !reason) {
    throw new Error('Email and Reason are required');
  }
  const report = await db.addReport(gameId, email, reason);
  revalidatePath(`/roms/${gameId}`);
  revalidatePath('/admin');
  return report;
}

export async function resolveReportAction(reportId: string) {
  await db.resolveReport(reportId);
  revalidatePath('/admin');
  return { success: true };
}

export async function createGameAction(
  gameData: Partial<Game>,
  categoryIds: string[],
  downloadLinks: { version: string; mirrors: Mirror[] }[]
) {
  const newGame = await db.createGame(gameData, categoryIds, downloadLinks);
  revalidatePath('/');
  revalidatePath('/category');
  revalidatePath('/admin');
  return newGame;
}

export async function updateGameAction(
  gameId: string,
  gameData: Partial<Game>,
  categoryIds: string[],
  downloadLinks: { version: string; mirrors: Mirror[] }[]
) {
  const updated = await db.updateGame(gameId, gameData, categoryIds, downloadLinks);
  revalidatePath(`/roms/${gameId}`);
  revalidatePath(`/roms/${updated.slug}`);
  revalidatePath('/');
  revalidatePath('/admin');
  return updated;
}

export async function deleteGameAction(gameId: string) {
  await db.deleteGame(gameId);
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function createCategoryAction(name: string, slug: string) {
  const newCat = await db.createCategory(name, slug);
  revalidatePath('/category');
  revalidatePath('/admin');
  return newCat;
}

export async function updateCategoryAction(id: string, name: string, slug: string) {
  const updated = await db.updateCategory(id, name, slug);
  revalidatePath('/category');
  revalidatePath('/admin');
  return updated;
}

export async function deleteCategoryAction(id: string) {
  await db.deleteCategory(id);
  revalidatePath('/category');
  revalidatePath('/admin');
  return { success: true };
}

export async function createPublisherAction(name: string, slug: string, logo: string, description: string) {
  const newPub = await db.createPublisher(name, slug, logo, description);
  revalidatePath('/admin');
  return newPub;
}

export async function updatePublisherAction(id: string, name: string, slug: string, logo: string, description: string) {
  const updated = await db.updatePublisher(id, name, slug, logo, description);
  revalidatePath(`/publisher/${slug}`);
  revalidatePath('/admin');
  return updated;
}

export async function deletePublisherAction(id: string) {
  await db.deletePublisher(id);
  revalidatePath('/admin');
  return { success: true };
}

export async function adminLoginAction(email: string, password: string): Promise<{ success: boolean; error?: string; role?: string }> {
  try {
    const supabase = await getServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { success: false, error: error.message || 'Credenciais inválidas.' };
    }

    if (!data.user) {
      return { success: false, error: 'Login falhou. Tente novamente.' };
    }

    const { data: adminRecords, error: adminError } = await supabase
      .from('admins')
      .select('role')
      .or(`user_id.eq.${data.user.email},user_id.eq.${data.user.id}`);

    if (adminError) {
      console.error('Admin check error:', adminError.message);
    }

    const adminRecord = adminRecords && adminRecords.length > 0 ? adminRecords[0] : null;

    if (!adminRecord) {
      await supabase.auth.signOut();
      return { success: false, error: 'Acesso negado. Este usuário não é administrador.' };
    }

    return { success: true, role: adminRecord.role };
  } catch (err: any) {
    console.error('adminLoginAction exception:', err);
    return { success: false, error: err?.message || 'Erro inesperado. Tente novamente.' };
  }
}

export async function adminLogoutAction() {
  try {
    const supabase = await getServerClient();
    await supabase.auth.signOut();
  } catch {}
  return { success: true };
}

export async function checkAdminSessionAction(): Promise<{ isLoggedIn: boolean; role?: string }> {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { isLoggedIn: false };
    }

    const { data: adminRecords } = await supabase
      .from('admins')
      .select('role')
      .or(`user_id.eq.${user.email},user_id.eq.${user.id}`);

    const adminRecord = adminRecords && adminRecords.length > 0 ? adminRecords[0] : null;

    if (!adminRecord) {
      return { isLoggedIn: false };
    }

    return { isLoggedIn: true, role: adminRecord.role };
  } catch {
    return { isLoggedIn: false };
  }
}

export async function addAdminAction(email: string, role: 'admin' | 'super_admin') {
  const admin = await db.addAdmin(email, role);
  revalidatePath('/admin');
  return admin;
}

export async function removeAdminAction(id: string) {
  await db.removeAdmin(id);
  revalidatePath('/admin');
  return { success: true };
}
