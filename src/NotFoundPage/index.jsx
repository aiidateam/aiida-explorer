import MaterialsCloudHeader from "mc-react-header";
import { Link } from "react-router-dom";

export default function NotFoundPage({ backendMapping, attemptedPath }) {
  const knownBackends = Object.keys(backendMapping || {});

  return (
    <MaterialsCloudHeader
      activeSection="explore"
      breadcrumbsPath={[
        { name: "Explore", link: "https://www.materialscloud.org/explore" },
        { name: "404", link: null },
      ]}
    >
      <div className="flex flex-col mx-4 h-[calc(100vh-64px)] items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <h1 className="text-3xl font-bold mb-6">404: Page Not Found</h1>

          {attemptedPath && (
            <div className="mb-6 p-4 border border-red-400 bg-red-100 text-red-700 rounded text-left">
              ⚠️ You attempted to navigate to{" "}
              <code className="font-mono">{attemptedPath}</code>, but this
              suffix was not found in our database.
            </div>
          )}

          <div className="p-4 border border-gray-300 bg-gray-50 rounded text-left">
            <p className="mb-2 font-semibold">Known backends:</p>
            <ul className="list-disc list-inside text-gray-700">
              {knownBackends.map((b) => (
                <li key={b}>
                  <Link
                    to={`/${b}`}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {b}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 text-gray-700">
            Go back to the{" "}
            <a href="/" className="text-blue-600 underline">
              homepage
            </a>{" "}
            or choose a valid backend.
          </p>
        </div>
      </div>
    </MaterialsCloudHeader>
  );
}
