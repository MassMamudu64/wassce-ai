import type { PastPaper, PaperType, SourceType } from "../core/types/passPaper";
import type { LearningStateData } from "../stores/learningStore";
import type { WorkspaceStateData } from "../stores/workspaceStore";
import type { BillingStateData } from "../stores/billingStore";
import type { UserProfile, UserSettings } from "./settings";
import { isSupabaseConfigured, supabase } from "./supabase";

const ensureSupabase = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured.");
  }
  return supabase;
};

export const fetchUserSettings = async (userId: string): Promise<UserSettings | null> => {
  const client = ensureSupabase();
  const { data, error } = await client.from("user_settings").select("openai_api_key, theme").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    openAiApiKey: data.openai_api_key ?? undefined,
    theme: data.theme ?? undefined,
  };
};

export const upsertUserSettings = async (userId: string, settings: UserSettings) => {
  const client = ensureSupabase();
  const payload = {
    user_id: userId,
    openai_api_key: settings.openAiApiKey ?? null,
    theme: settings.theme ?? null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await client.from("user_settings").upsert(payload);
  if (error) throw error;
};

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const client = ensureSupabase();
  const { data, error } = await client.from("user_profiles").select("display_name, avatar_url, updated_at").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    displayName: data.display_name ?? "",
    avatarDataUrl: data.avatar_url ?? undefined,
    updatedAt: data.updated_at ?? new Date().toISOString(),
  };
};

export const upsertUserProfile = async (userId: string, profile: UserProfile) => {
  const client = ensureSupabase();
  const payload = {
    user_id: userId,
    display_name: profile.displayName,
    avatar_url: profile.avatarDataUrl ?? null,
    updated_at: profile.updatedAt,
  };
  const { error } = await client.from("user_profiles").upsert(payload);
  if (error) throw error;
};

export const deleteUserProfile = async (userId: string) => {
  const client = ensureSupabase();
  const { error } = await client.from("user_profiles").delete().eq("user_id", userId);
  if (error) throw error;
};

export const fetchLearningState = async (userId: string): Promise<LearningStateData | null> => {
  const client = ensureSupabase();
  const { data, error } = await client.from("learning_states").select("data").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data?.data ?? null;
};

export const upsertLearningState = async (userId: string, data: LearningStateData) => {
  const client = ensureSupabase();
  const payload = { user_id: userId, data, updated_at: new Date().toISOString() };
  const { error } = await client.from("learning_states").upsert(payload);
  if (error) throw error;
};

export const fetchWorkspaceState = async (userId: string): Promise<WorkspaceStateData | null> => {
  const client = ensureSupabase();
  const { data, error } = await client.from("workspace_states").select("data").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data?.data ?? null;
};

export const upsertWorkspaceState = async (userId: string, data: WorkspaceStateData) => {
  const client = ensureSupabase();
  const payload = { user_id: userId, data, updated_at: new Date().toISOString() };
  const { error } = await client.from("workspace_states").upsert(payload);
  if (error) throw error;
};

export const fetchBillingState = async (userId: string): Promise<BillingStateData | null> => {
  const client = ensureSupabase();
  const { data, error } = await client.from("billing_states").select("is_premium, last_payment_id").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { isPremium: data.is_premium ?? false, lastPaymentId: data.last_payment_id ?? null };
};

export const upsertBillingState = async (userId: string, data: BillingStateData) => {
  const client = ensureSupabase();
  const payload = {
    user_id: userId,
    is_premium: data.isPremium,
    last_payment_id: data.lastPaymentId,
    updated_at: new Date().toISOString(),
  };
  const { error } = await client.from("billing_states").upsert(payload);
  if (error) throw error;
};

type PastPaperRow = {
  id: string;
  subject: string;
  year: number;
  paper_type: PaperType;
  title: string;
  has_answers: boolean;
  pdf_url: string;
  source: SourceType;
};

const toPastPaper = (row: PastPaperRow): PastPaper => ({
  id: row.id,
  subject: row.subject,
  year: row.year,
  paperType: row.paper_type,
  title: row.title,
  hasAnswers: row.has_answers,
  pdfUrl: row.pdf_url,
  source: row.source,
});

export const fetchUserPastPapers = async (userId: string): Promise<PastPaper[]> => {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("user_past_papers")
    .select("id, subject, year, paper_type, title, has_answers, pdf_url, source")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toPastPaper);
};

export const insertUserPastPaper = async (userId: string, paper: Omit<PastPaper, "id">) => {
  const client = ensureSupabase();
  const payload = {
    user_id: userId,
    subject: paper.subject,
    year: paper.year,
    paper_type: paper.paperType,
    title: paper.title,
    has_answers: paper.hasAnswers,
    pdf_url: paper.pdfUrl,
    source: paper.source,
  };
  const { data, error } = await client
    .from("user_past_papers")
    .insert(payload)
    .select("id, subject, year, paper_type, title, has_answers, pdf_url, source")
    .single();
  if (error) throw error;
  return toPastPaper(data as PastPaperRow);
};

export const deleteUserPastPaper = async (userId: string, paperId: string) => {
  const client = ensureSupabase();
  const { error } = await client.from("user_past_papers").delete().eq("user_id", userId).eq("id", paperId);
  if (error) throw error;
};
