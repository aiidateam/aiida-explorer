import { Link } from "react-router-dom";

export default function HomePage({ backendMapping }) {
  const knownBackends = Object.keys(backendMapping || {});

  return (
    <div className="flex flex-col h-[calc(75vh)] items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-6">
          Welcome to the Materials Cloud Explore
        </h1>

        <p className="text-gray-700 text-lg mb-4">
          Use the URL format: <code>{`.../#/{databasepath}?rootNode=...`}</code>
        </p>

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
      </div>
    </div>
  );
}
