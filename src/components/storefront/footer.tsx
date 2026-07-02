import Link from "next/link";

const Instagram = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const Facebook = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const Twitter = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);
const Youtube = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
);

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-[1440px] px-6 lg:px-16 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                PREMIUM.
              </span>
            </Link>
            <p className="text-sm text-white/50 max-w-xs leading-relaxed">
              Elevating everyday essentials with uncompromising quality, timeless design, and sustainable craftsmanship.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-white/40 hover:text-white transition-colors duration-200" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-colors duration-200" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-colors duration-200" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-colors duration-200" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-6">
              Shop
            </h4>
            <ul className="space-y-3.5">
              <li><Link href="/products?sort=newest" className="text-sm text-white/60 hover:text-white transition-colors duration-200">New Arrivals</Link></li>
              <li><Link href="/products?sort=best-selling" className="text-sm text-white/60 hover:text-white transition-colors duration-200">Best Sellers</Link></li>
              <li><Link href="/products?category=men" className="text-sm text-white/60 hover:text-white transition-colors duration-200">Men</Link></li>
              <li><Link href="/products?category=women" className="text-sm text-white/60 hover:text-white transition-colors duration-200">Women</Link></li>
              <li><Link href="/products?category=accessories" className="text-sm text-white/60 hover:text-white transition-colors duration-200">Accessories</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-6">
              Company
            </h4>
            <ul className="space-y-3.5">
              <li><Link href="/about" className="text-sm text-white/60 hover:text-white transition-colors duration-200">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-white/60 hover:text-white transition-colors duration-200">Contact</Link></li>
              <li><Link href="/faq" className="text-sm text-white/60 hover:text-white transition-colors duration-200">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-6">
              Legal
            </h4>
            <ul className="space-y-3.5">
              <li><Link href="/shipping" className="text-sm text-white/60 hover:text-white transition-colors duration-200">Shipping Policy</Link></li>
              <li><Link href="/returns" className="text-sm text-white/60 hover:text-white transition-colors duration-200">Returns & Refunds</Link></li>
              <li><Link href="/privacy" className="text-sm text-white/60 hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-white/60 hover:text-white transition-colors duration-200">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-6">
              Stay Updated
            </h4>
            <p className="text-xs text-white/40 mb-4 leading-relaxed">
              Subscribe for early access to new collections and exclusive offers.
            </p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-white text-[#1A1A1A] rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-white/90 transition-colors cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-16 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/30 tracking-wide">
            © {new Date().getFullYear()} PREMIUM. All rights reserved.
          </p>
          
          {/* Payment Icons */}
          <div className="flex items-center gap-3">
            {["Visa", "Mastercard", "UPI", "RuPay"].map((method) => (
              <span
                key={method}
                className="px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-white/20 border border-white/8 rounded"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
