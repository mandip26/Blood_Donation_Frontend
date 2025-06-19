import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-magenta via-primary-rose to-primary-orange p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <div className="mb-8">
          <Link
            to="/"
            className="text-primary-magenta hover:text-primary-rose transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Terms of Service
        </h1>

        <div className="prose prose-lg max-w-none text-gray-700">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="mb-4">
              By accessing and using this Blood Donation Platform, you accept
              and agree to be bound by the terms and provision of this
              agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              2. Use License
            </h2>
            <p className="mb-4">
              Permission is granted to temporarily use this blood donation
              platform for personal, non-commercial transitory viewing only.
              This is the grant of a license, not a transfer of title, and under
              this license you may not:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>modify or copy the materials</li>
              <li>
                use the materials for any commercial purpose or for any public
                display
              </li>
              <li>
                attempt to reverse engineer any software contained on the
                platform
              </li>
              <li>
                remove any copyright or other proprietary notations from the
                materials
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              3. Blood Donation Guidelines
            </h2>
            <p className="mb-4">Users registering as donors agree to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate and truthful health information</li>
              <li>Follow all medical guidelines and eligibility criteria</li>
              <li>Undergo required health screenings before donation</li>
              <li>Notify the platform of any changes in health status</li>
              <li>
                Follow post-donation care instructions provided by medical
                professionals
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              4. Hospital and Organization Responsibilities
            </h2>
            <p className="mb-4">
              Healthcare institutions and organizations using this platform
              agree to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Maintain proper medical credentials and certifications</li>
              <li>Follow all applicable health and safety regulations</li>
              <li>Ensure proper handling and storage of donated blood</li>
              <li>Provide safe and sterile donation environments</li>
              <li>Respect donor privacy and confidentiality</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              5. Privacy and Data Protection
            </h2>
            <p className="mb-4">
              We are committed to protecting your privacy. All personal health
              information is handled in accordance with applicable healthcare
              privacy laws and regulations. See our Privacy Policy for detailed
              information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              6. Disclaimer
            </h2>
            <p className="mb-4">
              The materials on this blood donation platform are provided on an
              'as is' basis. We make no warranties, expressed or implied, and
              hereby disclaim and negate all other warranties including without
              limitation, implied warranties or conditions of merchantability,
              fitness for a particular purpose, or non-infringement of
              intellectual property or other violation of rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              7. Limitations
            </h2>
            <p className="mb-4">
              In no event shall the Blood Donation Platform or its suppliers be
              liable for any damages (including, without limitation, damages for
              loss of data or profit, or due to business interruption) arising
              out of the use or inability to use the materials on this platform,
              even if we or our authorized representative has been notified
              orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              8. Revisions and Errata
            </h2>
            <p className="mb-4">
              The materials appearing on this blood donation platform could
              include technical, typographical, or photographic errors. We do
              not warrant that any of the materials on its platform are
              accurate, complete, or current. We may make changes to the
              materials contained on its platform at any time without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              9. Contact Information
            </h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please
              contact us through our platform's support system.
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
