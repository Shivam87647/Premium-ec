"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Loader2, Save, Globe } from "lucide-react";

export default function AdminSeoPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // States
  const [globalSeo, setGlobalSeo] = React.useState<any>({
    meta_title_template: "{Page Title} | {Site Name}",
    default_meta_description: "",
    ga_tracking_id: "",
    search_console_meta: "",
    robots_txt: "User-agent: *\nDisallow: /admin\nSitemap: /sitemap.xml",
  });

  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    async function loadSeoSettings() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("seo_settings")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setGlobalSeo(data);
        }
      } catch (err: any) {
        console.error(err);
        addToast({ title: "Failed to load SEO settings", description: err.message, type: "error" });
      } finally {
        setLoading(false);
      }
    }

    loadSeoSettings();
  }, [supabase, addToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGlobalSeo((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        meta_title_template: globalSeo.meta_title_template,
        default_meta_description: globalSeo.default_meta_description,
        ga_tracking_id: globalSeo.ga_tracking_id,
        search_console_meta: globalSeo.search_console_meta,
        robots_txt: globalSeo.robots_txt,
      };

      if (globalSeo.id) {
        const { error } = await supabase
          .from("seo_settings")
          .update(payload)
          .eq("id", globalSeo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("seo_settings")
          .insert([payload]);
        if (error) throw error;
      }

      addToast({ title: "SEO Saved", description: "Global configuration indexes updated.", type: "success" });
    } catch (err: any) {
      console.error(err);
      addToast({ title: "Save Failed", description: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm max-w-2xl mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
        <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Loading meta engines...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] font-serif tracking-tight">SEO Settings</h2>
        <p className="text-sm text-[#6B6B6B] mt-1">Configure metadata templates, tracking scripts, search console tags, and robots directives.</p>
      </div>

      <form onSubmit={handleSubmit} className="card-base p-6 md:p-8 space-y-6">
        <h3 className="font-serif text-lg font-bold border-b border-[rgba(0,0,0,0.06)] pb-3.5 flex items-center gap-1.5 text-[#1A1A1A]">
          <Globe className="w-4.5 h-4.5 text-[#9CA3AF]" />
          Global Configuration
        </h3>

        <Input
          label="Meta Title Template"
          name="meta_title_template"
          value={globalSeo.meta_title_template}
          onChange={handleChange}
          required
          placeholder="{Page Title} | {Site Name}"
        />

        <div>
          <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">Default Meta Description</label>
          <textarea
            name="default_meta_description"
            value={globalSeo.default_meta_description}
            onChange={handleChange}
            rows={3}
            placeholder="Default meta description used when page specific description is not set..."
            className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#1A1A1A] resize-none transition-colors"
          />
        </div>

        <Input
          label="Google Analytics ID (GA4)"
          name="ga_tracking_id"
          value={globalSeo.ga_tracking_id}
          onChange={handleChange}
          placeholder="e.g. G-XXXXXXXXXX"
        />

        <Input
          label="Google Search Console HTML Verification Tag"
          name="search_console_meta"
          value={globalSeo.search_console_meta}
          onChange={handleChange}
          placeholder='e.g. <meta name="google-site-verification" content="..." />'
        />

        <div>
          <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">Robots.txt Content</label>
          <textarea
            name="robots_txt"
            value={globalSeo.robots_txt}
            onChange={handleChange}
            rows={4}
            placeholder="User-agent: * ..."
            className="w-full rounded-lg border border-[rgba(0,0,0,0.08)] bg-white px-4 py-3 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A] resize-none transition-colors font-mono"
          />
        </div>

        <div className="flex justify-end border-t border-[rgba(0,0,0,0.06)] pt-5">
          <Button type="submit" disabled={saving} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider shimmer-btn">
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saving ? "Saving Changes..." : "Save SEO Settings"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
