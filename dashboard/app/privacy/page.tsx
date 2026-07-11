import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="font-display text-4xl md:text-5xl text-[#111] mb-4">Privacy Policy</h1>
        <p className="text-sm text-[#888] mb-12">Last updated: July 10, 2026</p>

        <div className="space-y-8 text-[#666] leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">1. Introduction</h2>
            <p>
              Welcome to Knight. We protect your personal information and your right to privacy.
              This policy explains how we collect, use, and safeguard your data when you use our services.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">2. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Account information (name, email, password)</li>
              <li>Company profile (name, website, services)</li>
              <li>Payment information (processed via LemonSqueezy)</li>
              <li>Communication data (messages via contact form)</li>
              <li>API keys you provide for AI services</li>
              <li>Telegram account information (if you connect it)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide and maintain our services</li>
              <li>Process transactions and send related info</li>
              <li>Respond to inquiries and provide support</li>
              <li>Improve and personalize our services</li>
              <li>Detect and prevent fraud or unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">4. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share it only with service providers who help us operate
              (Supabase, LemonSqueezy, Resend), when required by law, or with your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">5. Data Security</h2>
            <p>
              We use appropriate technical measures to protect your data. No method of transmission is 100% secure,
              but we work to protect your information.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">6. Data Retention</h2>
            <p>
              We keep your data only as long as needed to provide our services. When you delete your account,
              we remove your personal information within 30 days.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">7. Your Rights</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-[#111] mb-4">8. Contact</h2>
            <p>
              Questions? Contact us at{" "}
              <a href="mailto:privacy@knight.com" className="text-[#111] hover:underline">privacy@knight.com</a>.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
