import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaFileAlt, FaEye, FaDownload } from "react-icons/fa";

const Files = ({ uuid, moduleName }) => {
  const [inputFiles, setInputFiles] = useState([]);
  const [outputFiles, setOutputFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState([]);
  const [modalContent, setModalContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchInputFiles = async () => {
      try {
        const response = await axios.get(`https://aiida.materialscloud.org/${moduleName}/api/v4/calcjobs/${uuid}/input_files`);
        setInputFiles(response.data.data);
      } catch (error) {
        console.error('Error fetching input files:', error);
        setError(true);
      }
    };

    const fetchOutputFiles = async () => {
      try {
        const response = await axios.get(`https://aiida.materialscloud.org/${moduleName}/api/v4/calcjobs/${uuid}/output_files`);
        setOutputFiles(response.data.data);
      } catch (error) {
        console.error('Error fetching output files:', error);
        setError(true);
      }
    };

    const getData = async () => {
      try {
        const res = await fetch(`https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/${uuid}?attributes=true`);
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await res.json();
        setData(data.data.nodes[0].attributes);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getData();
    fetchInputFiles();
    fetchOutputFiles();
  }, [uuid, moduleName]);

  const [isLoading, setIsLoading] = useState(false);

  const fetchFileContent = async (filename) => {
    setIsLoading(true);
    setIsModalOpen(true);
    try {
      const response = await axios.get(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/${uuid}/repo/contents?filename="${filename}"`);
      if (typeof response.data === 'object') {
        setModalContent(JSON.stringify(response.data, null, 2));
      } else {
        setModalContent(response.data);
      }
    } catch (error) {
      console.error('Error fetching file content:', error);
      setModalContent('Error loading file content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const response = await axios.get(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/${uuid}/repo/contents?filename="${filename}"`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  if (error || (inputFiles.length === 0 && outputFiles.length === 0)) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-1 bg-gray-100 p-4 overflow-auto">
        <h2 className='font-semibold font-mono text-lg mb-2'>INFO:</h2>
        <div className="space-y-2 text-blue-900">
          <p className="font-mono text-sm break-all">
            <span className='font-semibold text-black'>JobID:</span> {data.job_id}
          </p>
          <p className="font-mono text-sm break-all">
            <span className='font-semibold text-black'>Scheduler State:</span> {data.scheduler_state}
          </p>
          <p className="font-mono text-sm break-all">
            <span className='font-semibold text-black'>Remote WorkDir:</span> {data.remote_workdir}
          </p>
        </div>
      </div>

      <div className="col-span-1 grid grid-rows-2 gap-4">
        <div className="row-span-1 bg-gray-100 p-1">
          <span className='font-semibold font-mono'>Input Files:</span>
          {inputFiles.length > 0 ? (
            <ul className="list-disc text-wrap pl-5 text-cyan-900">
              {inputFiles.map((file, index) => (
                <li key={index} className="flex items-center font-mono text-wrap">
                  {/* <FaFileAlt className="mr-2" /> */}
                  <FaDownload className="cursor-pointer" onClick={() => handleDownload(typeof file === 'object' ? file.name : file)} />
                  <FaEye className=" ml-3 mr-2 cursor-pointer" onClick={() => fetchFileContent(typeof file === 'object' ? file.name : file)} />
                  {typeof file === 'object' ? file.name : file}
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
                  {/* <FaFileAlt className="mr-2" /> */}
                  <FaDownload className="cursor-pointer" onClick={() => handleDownload(typeof file === 'object' ? file.name : file)} />
                  <FaEye className="ml-3 mr-2 cursor-pointer" onClick={() => fetchFileContent(typeof file === 'object' ? file.name : file)} />
                  {typeof file === 'object' ? file.name : file}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-mono">No output files found.</p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">File Content</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsModalOpen(false)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-auto flex-grow">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-words">{modalContent}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Files;
