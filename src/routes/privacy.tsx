import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <div className="prose prose-lg max-w-none text-gray-700">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              1. Information We Collect
            </h2>
            <p className="mb-4">
              We collect information you provide directly to us when you create
              an account, make a blood donation appointment, or contact us for
              support.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Personal Information
            </h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Name, email address, and phone number</li>
              <li>Date of birth and gender</li>
              <li>Address and location information</li>
              <li>Blood type and medical eligibility information</li>
              <li>Donation history and preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Health Information
            </h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Medical history relevant to blood donation eligibility</li>
              <li>Health screening results</li>
              <li>Medication information</li>
              <li>Travel history</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              2. How We Use Your Information
            </h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Process and manage your blood donation appointments</li>
              <li>Verify your eligibility to donate blood</li>
              <li>
                Send you appointment reminders and follow-up communications
              </li>
              <li>Match blood types with recipients in emergency situations</li>
              <li>Maintain donation records for health and safety purposes</li>
              <li>Improve our platform and services</li>
              <li>Comply with legal and regulatory requirements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              3. Information Sharing and Disclosure
            </h2>
            <p className="mb-4">
              We may share your information in the following circumstances:
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Healthcare Providers
            </h3>
            <p className="mb-4">
              We share necessary medical information with qualified healthcare
              providers and blood banks to facilitate safe blood donation and
              transfusion processes.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Legal Requirements
            </h3>
            <p className="mb-4">
              We may disclose your information if required by law, regulation,
              or legal process, or to protect the rights, property, or safety of
              our users or others.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Emergency Situations
            </h3>
            <p className="mb-4">
              In life-threatening emergencies, we may share blood type and
              availability information with hospitals and emergency services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              4. Data Security
            </h2>
            <p className="mb-4">
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. This includes:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication measures</li>
              <li>Employee training on data protection practices</li>
              <li>
                Compliance with healthcare data protection standards (HIPAA)
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              5. Your Rights and Choices
            </h2>
            <p className="mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Access and review your personal information</li>
              <li>Request corrections to inaccurate information</li>
              <li>
                Request deletion of your account and data (subject to legal
                requirements)
              </li>
              <li>Control communication preferences</li>
              <li>Withdraw consent for non-essential data processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              6. Data Retention
            </h2>
            <p className="mb-4">
              We retain your information for as long as necessary to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide our services and maintain your account</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Maintain donation records for health and safety purposes</li>
              <li>Resolve disputes and enforce our agreements</li>
            </ul>
            <p className="mb-4">
              Medical records related to blood donation are typically retained
              for a minimum period as required by healthcare regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              7. Cookies and Tracking Technologies
            </h2>
            <p className="mb-4">We use cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Remember your preferences and settings</li>
              <li>Analyze platform usage and performance</li>
              <li>Provide personalized content and features</li>
              <li>Ensure platform security</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              8. Third-Party Services
            </h2>
            <p className="mb-4">
              Our platform may integrate with third-party services such as:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Payment processors for donation-related fees</li>
              <li>Mapping services for location-based features</li>
              <li>Communication services for notifications</li>
              <li>Analytics services for platform improvement</li>
            </ul>
            <p className="mb-4">
              These third parties have their own privacy policies, and we
              encourage you to review them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              9. Children's Privacy
            </h2>
            <p className="mb-4">
              Our services are not intended for individuals under 18 years of
              age. We do not knowingly collect personal information from
              children under 18. If we become aware that we have collected
              personal information from a child under 18, we will take steps to
              delete such information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              10. Changes to This Privacy Policy
            </h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last updated" date below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-4">
              11. Contact Us
            </h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please
              contact us through our platform's support system or privacy
              officer.
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
