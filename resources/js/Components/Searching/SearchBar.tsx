import React, { useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void; // Callback function to handle search
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Search...", onSearch }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(searchQuery); // Pass the search query to the parent
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center justify-center z-50"
    >
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="border rounded-l-full px-4 py-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white rounded-r-full px-6 py-2 hover:bg-blue-600 transition-all"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
