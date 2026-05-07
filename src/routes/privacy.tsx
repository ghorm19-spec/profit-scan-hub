import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Score Flipp" }, { name: "description", content: "How Score Flipp collects, uses and protects your data." }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-5 py-8 max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4"><ArrowLeft className="h-4 w-4" />Back</Link>
      <h1 className="text-3xl font-extrabold">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mt-1">Last updated: May 7, 2026</p>

      <div className="prose prose-sm dark:prose-invert mt-6 space-y-4 text-sm leading-relaxed">
        <section>
          <h2 className="font-bold text-base mt-4">1. What we collect</h2>
          <p>Score Flipp collects only what is needed to give you a resale estimate: your email (for sign-in), photos and notes you upload for scans, your region/currency preference, and the scans you save.</p>
        </section>
        <section>
          <h2 className="font-bold text-base mt-4">2. How we use it</h2>
          <p>Photos and text you submit are sent to a third-party AI provider (Google Gemini via Lovable AI Gateway) to identify items and estimate prices. We don't sell your data, ever.</p>
        </section>
        <section>
          <h2 className="font-bold text-base mt-4">3. Storage</h2>
          <p>Your scans and uploaded images are stored on our secure backend (Supabase) and tied to your account. They are private to you by default.</p>
        </section>
        <section>
          <h2 className="font-bold text-base mt-4">4. Your rights</h2>
          <p>You can delete your account at any time from <strong>Profile → Delete account</strong>. This permanently removes your scans, images, and profile.</p>
        </section>
        <section>
          <h2 className="font-bold text-base mt-4">5. Children</h2>
          <p>Score Flipp is not intended for users under 13.</p>
        </section>
        <section>
          <h2 className="font-bold text-base mt-4">6. Contact</h2>
          <p>Questions? Email support@scoreflipp.app.</p>
        </section>
      </div>
    </div>
  );
}
