"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginAdmin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Create a fresh client instance to guarantee the new auth cookies are attached to the REST request
  const authenticatedClient = await createClient();

  const { data: profile, error: profileError } = await authenticatedClient
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "admin") {
    await authenticatedClient.auth.signOut();
    return { error: profileError ? `Error fetching role: ${profileError.message}` : "Access Denied: You do not have administrator privileges." };
  }

  redirect("/admin");
}
