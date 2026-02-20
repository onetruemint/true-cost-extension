import { Footer } from "@/components";
import { LogoLink, BackLink } from "@/components/ui";

export const metadata = {
  title: "Privacy Policy - Savest",
};

export default function PrivacyPage() {
  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-mint to-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="mb-10">
            <LogoLink size={40} />
          </div>

          <h1 className="text-3xl font-bold text-dark mb-2">Privacy Policy</h1>
          <p className="text-dark/50 text-sm mb-10">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          <div className="space-y-8 text-dark/80 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-dark mb-3">Overview</h2>
              <p>
                Savest is a browser extension that helps you make more
                intentional spending decisions by showing the opportunity cost
                of purchases on Amazon. We are committed to protecting your
                privacy and being transparent about what data we collect and how
                we use it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark mb-3">
                Data We Collect
              </h2>

              <h3 className="font-medium text-dark mt-4 mb-2">
                Without an account
              </h3>
              <p>
                If you use Savest without creating an account, all data stays on
                your device. This includes your settings (return rate,
                investment horizon, price threshold) and any savings you track
                by skipping purchases. None of this data is sent to our servers.
              </p>

              <h3 className="font-medium text-dark mt-4 mb-2">
                With an account
              </h3>
              <p>
                If you create an account to sync data across devices, we store:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Your email address (used for authentication)</li>
                <li>Your extension settings</li>
                <li>
                  Purchase decision records: the price, currency, product URL,
                  product title, your response to the prompt, and whether you
                  skipped or proceeded with the purchase
                </li>
                <li>
                  Aggregated effectiveness data about which question prompts
                  help you save the most
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark mb-3">
                Data We Do Not Collect
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>We do not track your general browsing history</li>
                <li>
                  We do not collect data on any pages other than Amazon product
                  pages and your cart
                </li>
                <li>
                  We do not collect payment information or financial account
                  details
                </li>
                <li>We do not use cookies for advertising or tracking</li>
                <li>
                  We do not sell, rent, or share your personal data with third
                  parties
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark mb-3">
                How We Use Your Data
              </h2>
              <p>Your data is used exclusively to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Sync your settings and savings across devices</li>
                <li>Show you how much money you have saved over time</li>
                <li>
                  Determine which question prompts are most effective at helping
                  you make intentional decisions
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark mb-3">
                Third-Party Services
              </h2>
              <p>
                If you create an account, your data is stored securely using{" "}
                <a
                  href="https://supabase.com"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Supabase
                </a>
                , an open-source backend platform. Authentication is handled
                through Supabase Auth, which supports email/password and Google
                sign-in. We do not share your data with any other third-party
                services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark mb-3">
                Data Security
              </h2>
              <p>
                All communication between the extension, our servers, and the
                database is encrypted in transit using HTTPS. Access to your
                data is protected by authentication tokens and row-level
                security policies, ensuring you can only access your own data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark mb-3">
                Data Deletion
              </h2>
              <p>
                You can delete your local data at any time by uninstalling the
                extension. If you have an account and wish to delete all your
                stored data, please contact us and we will remove your account
                and all associated data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark mb-3">
                Permissions
              </h2>
              <p>Savest requests the following browser permissions:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <strong>Storage</strong> — to save your settings and tracked
                  savings locally on your device
                </li>
                <li>
                  <strong>Alarms</strong> — to periodically refresh your
                  authentication session in the background
                </li>
                <li>
                  <strong>Host access to Amazon sites</strong> — to read product
                  prices and display opportunity cost badges on Amazon pages
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-dark mb-3">
                Changes to This Policy
              </h2>
              <p>
                We may update this privacy policy from time to time. If we make
                significant changes, we will notify users through the extension
                or on this page. Continued use of Savest after changes
                constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* <section>
              <h2 className="text-xl font-semibold text-dark mb-3">Contact</h2>
              <p>
                If you have questions about this privacy policy or your data,
                please reach out at{" "}
                <a
                  href="mailto:support@onetruemint.com"
                  className="text-primary hover:underline"
                >
                  support@onetruemint.com
                </a>
                .
              </p>
            </section> */}
          </div>

          <div className="mt-12">
            <BackLink />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
