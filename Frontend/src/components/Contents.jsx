import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaFileAlt } from 'react-icons/fa';

const RepoFiles = ({ uuid }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/${uuid}/repo/list/`);
        const filesList = response.data.data.repo_list;
        const filesWithContent = await Promise.all(filesList.map(async (file) => {
          try {
            const fileContentResponse = await axios.get(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/${uuid}/repo/contents?filename=${file.name}`);
            return { name: file.name, content: fileContentResponse.data };
          } catch (error) {
            console.error(`Error fetching content for file ${file.name}:`, error);
            return { name: file.name, content: 'Error fetching content' };
          }
        }));
        setFiles(filesWithContent);
      } catch (error) {
        console.error('Error fetching files:', error);
        setError(true);
      }
    };

    fetchFiles();
  }, [uuid]);

  if (error || files.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="col-span-1 row-span-2 bg-gray-100 p-1">
        <span className='font-semibold font-mono'>Repository Files:</span>
      </div>
      <div className="bg-gray-100 p-1">
        {files.length > 0 ? (
          <ul className="list-disc text-wrap pl-5 text-cyan-900">
            {files.map((file, index) => (
              <li key={index} className="mb-4">
                <div className="flex items-center font-mono text-wrap">
                  <FaFileAlt className="mr-2" />{file.name}
                </div>
                <pre className="bg-gray-200 p-2 mt-1 mr-4 text-sm rounded text-wrap break-words">{file.content}</pre>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-mono">No repository files found.</p>
        )}
      </div>
    </div>
  );
};

export default RepoFiles;
