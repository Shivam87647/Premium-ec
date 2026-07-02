import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CartProvider } from "@/components/storefront/cart-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";
import { createClient } from "@/lib/supabase/server";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let announcementText = "";
  let announcementLink = "";
  let announcementColor = "#000000";
  let showAnnouncement = false;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("site_settings")
        .select("announcement_bar_active, announcement_bar_text, announcement_bar_link, announcement_bar_color")
        .limit(1)
        .maybeSingle();

      if (data && data.announcement_bar_active) {
        showAnnouncement = true;
        announcementText = data.announcement_bar_text || "";
        announcementLink = data.announcement_bar_link || "";
        announcementColor = data.announcement_bar_color || "#000000";
      }
    }
  } catch (e) {
    console.error("Failed to fetch site settings in storefront layout:", e);
  }

  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          {showAnnouncement && (
            <AnnouncementBar 
              text={announcementText} 
              link={announcementLink} 
              bgColor={announcementColor} 
            />
          )}
          <div className="sticky top-0 z-40 flex flex-col">
            <Header />
          </div>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
