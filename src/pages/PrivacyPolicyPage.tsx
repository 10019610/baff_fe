import { Link } from 'react-router-dom';

export function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">Privacy Policy</h1>

        <div className="space-y-6 text-muted-foreground">
          <p>
            This privacy policy applies to the ChangeUp app (hereby referred to
            as &quot;Application&quot;) for mobile devices that was created by
            Lumpen (hereby referred to as &quot;Service Provider&quot;) as a
            Free service. This service is intended for use &quot;AS IS&quot;.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Information Collection and Use
          </h2>
          <p>
            The Application collects information when you download and use it.
            This information may include information such as:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your device's Internet Protocol address (e.g. IP address)</li>
            <li>
              The pages of the Application that you visit, the time and date of
              your visit, the time spent on those pages
            </li>
            <li>The time spent on the Application</li>
            <li>The operating system you use on your mobile device</li>
          </ul>

          <p>
            The Application does not gather precise information about the
            location of your mobile device.
          </p>

          <p>
            The Application collects your device's location, which helps the
            Service Provider determine your approximate geographical location
            and make use of in below ways:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-medium text-foreground">
                Geolocation Services:
              </span>{' '}
              The Service Provider utilizes location data to provide features
              such as personalized content, relevant recommendations, and
              location-based services.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Analytics and Improvements:
              </span>{' '}
              Aggregated and anonymized location data helps the Service Provider
              to analyze user behavior, identify trends, and improve the overall
              performance and functionality of the Application.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Third-Party Services:
              </span>{' '}
              Periodically, the Service Provider may transmit anonymized
              location data to external services. These services assist them in
              enhancing the Application and optimizing their offerings.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Third Party Access
          </h2>
          <p>
            Only aggregated, anonymized data is periodically transmitted to
            external services to aid the Service Provider in improving the
            Application and their service. The Service Provider may share your
            information with third parties in the ways that are described in
            this privacy statement.
          </p>

          <p>
            Please note that the Application utilizes third-party services that
            have their own Privacy Policy about handling data. Below are the
            links to the Privacy Policy of the third-party service providers
            used by the Application:
          </p>
          <ul className="list-disc pl-6">
            <li>
              <a
                href="https://www.google.com/policies/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground underline"
              >
                Google Play Services
              </a>
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Opt-Out Rights
          </h2>
          <p>
            You can stop all collection of information by the Application easily
            by uninstalling it. You may use the standard uninstall processes as
            may be available as part of your mobile device or via the mobile
            application marketplace or network.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Data Retention Policy
          </h2>
          <p>
            The Service Provider will retain User Provided data for as long as
            you use the Application and for a reasonable time thereafter. If
            you'd like them to delete User Provided Data that you have provided
            via the Application, please contact them at{' '}
            <a
              href="mailto:20220330jin@gmail.com"
              className="text-muted-foreground hover:text-foreground underline"
            >
              20220330jin@gmail.com
            </a>{' '}
            and they will respond in a reasonable time.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Children
          </h2>
          <p>
            The Service Provider does not use the Application to knowingly
            solicit data from or market to children under the age of 13.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Security
          </h2>
          <p>
            The Service Provider is concerned about safeguarding the
            confidentiality of your information. The Service Provider provides
            physical, electronic, and procedural safeguards to protect
            information the Service Provider processes and maintains.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Changes
          </h2>
          <p>
            This Privacy Policy may be updated from time to time for any reason.
            The Service Provider will notify you of any changes to the Privacy
            Policy by updating this page with the new Privacy Policy. You are
            advised to consult this Privacy Policy regularly for any changes, as
            continued use is deemed approval of all changes.
          </p>

          <p className="italic">
            This privacy policy is effective as of 2025-09-20
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Your Consent
          </h2>
          <p>
            By using the Application, you are consenting to the processing of
            your information as set forth in this Privacy Policy now and as
            amended by us.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">
            Contact Us
          </h2>
          <p>
            If you have any questions regarding privacy while using the
            Application, or have questions about the practices, please contact
            the Service Provider via email at{' '}
            <a
              href="mailto:20220330jin@gmail.com"
              className="text-muted-foreground hover:text-foreground underline"
            >
              20220330jin@gmail.com
            </a>
          </p>

          <div className="mt-12 text-center">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground underline"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
