import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaFileAlt } from "react-icons/fa";

const Files = ({ uuid }) => {
  const [inputFiles, setInputFiles] = useState([]);
  const [outputFiles, setOutputFiles] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchInputFiles = async () => {
      try {
        const response = await axios.get(`https://aiida.materialscloud.org/mc3d/api/v4/calcjobs/${uuid}/input_files`);
        setInputFiles(response.data.data);
      } catch (error) {
        console.error('Error fetching input files:', error);
        setError(true);
      }
    };

    const fetchOutputFiles = async () => {
      try {
        const response = await axios.get(`https://aiida.materialscloud.org/mc3d/api/v4/calcjobs/${uuid}/output_files`);
        setOutputFiles(response.data.data);
      } catch (error) {
        console.error('Error fetching output files:', error);
        setError(true);
      }
    };

    fetchInputFiles();
    fetchOutputFiles();
  }, [uuid]);

  if (error || (inputFiles.length === 0 && outputFiles.length === 0)) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
    <div className="col-span-1 bg-gray-100 p-1">
      <span className='font-semibold font-mono'>INFO:</span>
      {/* INFO content goes here */}
    </div>
    <div className="col-span-1 grid grid-rows-2 gap-4">
      <div className="row-span-1 bg-gray-100 p-1">
        <span className='font-semibold font-mono'>Input Files:</span>
        {inputFiles.length > 0 ? (
          <ul className="list-disc text-wrap pl-5 text-cyan-900">
          {inputFiles.map((file, index) => (
            <li key={index} className="flex items-center font-mono text-wrap">
              <FaFileAlt className="mr-2" />{typeof file === 'object' ? file.name : file}
            </li>
          ))}
        </ul>
        ) : (
          <p className="font-mono">No input files found.</p>
        )}
      </div>
      <div className="row-span-1 bg-gray-100 p-1">
        <span className='font-semibold font-mono'>Output Files:</span>
        {outputFiles.length > 0 ? (
          <ul className="list-disc text-wrap pl-5 text-cyan-900">
          {outputFiles.map((file, index) => (
            <li key={index} className="flex items-center font-mono text-wrap">
              <FaFileAlt className="mr-2" />{typeof file === 'object' ? file.name : file}
            </li>
          ))}
        </ul> 
        ) : (
          <p className="font-mono">No output files found.</p>
        )}
      </div>
    </div>
  </div>
  

  );
}

export default Files;
