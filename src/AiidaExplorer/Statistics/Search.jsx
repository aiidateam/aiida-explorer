import React, { useState } from 'react';
import { CiSearch } from 'react-icons/ci';
import { useLocation, useNavigate } from 'react-router-dom';

const Search = ({ apiUrl ,uuid }) => {
  const [searchValue, setSearchValue] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleDetailsClick = () => {
    if (searchValue.trim() !== '') {
      const currentPath = location.pathname;
      const detailsIndex = currentPath.indexOf('/details/');
      let newPath;
  
      if (detailsIndex !== -1) {
        newPath = `${currentPath.substring(0, detailsIndex + 9)}${searchValue}`;
      } else {
        newPath = `${currentPath}/${searchValue}`;
      }
  
      navigate(newPath);
    }
  };
  

  return (
    <div className="bg-gray-100">
      <div className="flex mt-4 items-center border-2 border-gray-300 hover:border-gray-600 rounded-md shadow-md bg-white">
        <input
          type="search"
          placeholder={uuid}
          className="flex-grow p-1 border-0 outline-none rounded-l-md"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && searchValue.trim() !== '') {
              handleDetailsClick();
            }
          }}
        />
        <div className={`p-2 ${searchValue.trim() === '' ? 'bg-gray-400' : 'bg-blue-500'} text-white rounded-r-md`}>
          <button
            onClick={handleDetailsClick}
            disabled={searchValue.trim() === ''}
            className="disabled:cursor-not-allowed"
          >
            Explore
          </button>
        </div>
      </div>
    </div>
  );
};

export default Search;
