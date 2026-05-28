import { createClient } from "@supabase/supabase-js";

const supabaseUrl = ((import.meta as any).env?.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = (
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ""
).trim();

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const isSupabaseConfigured =
  !!supabaseUrl && !!supabaseAnonKey && isHttpUrl(supabaseUrl);

if (supabaseUrl && !isHttpUrl(supabaseUrl)) {
  console.warn(
    "Invalid VITE_SUPABASE_URL. Expected a URL like https://your-project.supabase.co.",
  );
}

// Lazy create the client if variables exist
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
