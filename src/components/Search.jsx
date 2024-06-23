import React, { useState } from 'react';
import { CiSearch } from 'react-icons/ci';

const Search = ({ moduleName }) => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-3/4 md:w-1/2 lg:w-1/3 flex items-center border-2 border-gray-400 hover:border-gray-600 rounded-md shadow-md bg-white">
        <input
          type="search"
          placeholder="Search UUID"
          className="w-full p-3 border-0 outline-none rounded-l-md"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              window.location.href = `/details/${searchValue}`;
            }
          }}
        />
        <CiSearch
          className="text-center size-6 cursor-pointer mr-3"
          onClick={() => {
            window.location.href = `/details/${searchValue}`;
          }}
        />
      </div>
    </div>
  );
};

export default Search;
