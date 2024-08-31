import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

import { IconContext } from "react-icons";
import { FaArrowRight } from "react-icons/fa";

import AiidaExplorer from "./AiidaExplorer";
// import DetailsPage from "./AiidaExplorer/DetailsPage";

const Home = ({ setCustomApiUrl }) => {
  const [inputValue, setInputvalue] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue) {
      setCustomApiUrl(inputValue);
      navigate("custom");
    }
  };
  return (
    <div className="flex justify-center items-center h-[90vh]">
      <div className="flex-col m-auto justify-center items-center">
        <ul className="m-auto flex justify-center">
          <li className="bg-transparent text-blue-500 hover:text-blue-700 font-semibold py-2 px-4 rounded">
            <Link to="/mc3d">Explore MC3D</Link>
          </li>
          <li className="bg-transparent text-blue-500 hover:text-blue-700 font-semibold py-2 px-4 rounded">
            <Link to="/mc2d">Explore MC2D</Link>
          </li>
        </ul>
        <br />
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputvalue(e.target.value)}
            placeholder="Enter custom API URL"
            className="px-6 py-2 border border-gray-300"
          />
          <button
            type="submit"
            className="flex items-center justify-center border border-blue-400 py-3 px-4 bg-blue-400 text-white"
          >
            <IconContext.Provider value={{ className: "text-white" }}>
              <FaArrowRight />
            </IconContext.Provider>
          </button>
        </form>
      </div>
    </div>
  );
};

const App = () => {
  const [customApiUrl, setCustomApiUrl] = useState("");

  return (
    <div className="p-1">
      <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || "/"}>
        <Routes>
          <Route
            path="/*"
            element={<Home setCustomApiUrl={setCustomApiUrl} />}
          />
          {/* This route, based on the custom URL, will, obviously, not be accessible via direct linking
              or refreshing the page. However, using back/forward will be fine. For future: for these cases,
              it might make sense to include the apiUrl as a url parameter instead/in-addition. */}
          <Route
            path="/custom/*"
            element={<AiidaExplorer apiUrl={customApiUrl} />}
          />
          {/* The routes below will work with direct linking, refresh as well. */}
          <Route
            path="/mc3d/*"
            element={
              <AiidaExplorer
                apiUrl={"https://aiida.materialscloud.org/mc3d/api/v4"}
              />
            }
          />
          <Route
            path="/mc2d/*"
            element={
              <AiidaExplorer
                apiUrl={"https://aiida.materialscloud.org/mc2d/api/v4"}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
