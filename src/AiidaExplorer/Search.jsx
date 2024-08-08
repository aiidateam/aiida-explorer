import React, { useState } from 'react';
import { CiSearch } from 'react-icons/ci';

const Search = ({ apiUrl }) => {
  const [searchValue, setSearchValue] = useState('');

  return (
<div className="bg-gray-100">
  <div className="flex mt-4 items-center border-2 border-gray-300 hover:border-gray-600 rounded-md shadow-md bg-white">
    <input
      type="search"
      placeholder="Search UUID"
      className="flex-grow p-1 border-0 outline-none rounded-l-md"
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          window.location.href = `/details/${searchValue}`;
        }
      }}
    />
    <div className='bg-blue-500 p-2 text-white'>
      <CiSearch
        className="text-center size-6 cursor-pointer mr-1"
        onClick={() => {
          window.location.href = `/details/${searchValue}`;
        }}
      />
    </div>
  </div>
</div>

  );
};

export default Search;
