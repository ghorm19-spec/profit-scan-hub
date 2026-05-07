import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — Score Flipp" }, { name: "description", content: "Terms for using Score Flipp." }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background px-5 py-8 max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4"><ArrowLeft className="h-4 w-4" />Back</Link>
      <h1 className="text-3xl font-extrabold">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mt-1">Last updated: May 7, 2026</p>

      <div className="prose prose-sm dark:prose-invert mt-6 space-y-4 text-sm leading-relaxed">
        <section>
          <h2 className="font-bold text-base mt-4">1. Acceptance</h2>
          <p>By using Score Flipp you agree to these terms. If you don't agree, don't use the app.</p>
        </section>
        <section>
          <h2 className="font-bold text-base mt-4">2. Estimates are not guarantees</h2>
          <p>Resale prices, demand levels, fees, and profit numbers are AI-generated estimates based on public market data. Real selling prices can vary. We are not liable for buying or selling decisions you make based on our output.</p>
        </section>
        <section>
          <h2 className="font-bold text-base mt-4">3. Acceptable use</h2>
          <p>Don't upload illegal, infringing, or harmful content. Don't try to scrape, abuse, or reverse-engineer the service.</p>
        </section>
        <section>
          <h2 className="font-bold text-base mt-4">4. Subscriptions</h2>
          <p>Free accounts include a limited number of scans per month. Paid plans (when available) auto-renew until cancelled in your app store settings.</p>
        </section>
        <section>
          <h2 className="font-bold text-base mt-4">5. Termination</h2>
          <p>You can delete your account anytime. We may suspend accounts that violate these terms.</p>
        </section>
        <section>
          <h2 className="font-bold text-base mt-4">6. Contact</h2>
          <p>support@scoreflipp.app</p>
        </section>
      </div>
    </div>
  );
}
