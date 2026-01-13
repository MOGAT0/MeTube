"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation"; // Use next/navigation for app router
import { useState } from "react";

const SearchInput = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Redirect to search page with query param
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return ( 
    <form onSubmit={handleSubmit} className="flex w-full max-w-[600px]">
      <div className="relative w-full">
        <input 
          type="text" 
          placeholder="Search" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-4 py-2 pr-12 rounded-l-full border focus:outline-none focus:border-blue-500"
        />
      </div>
      <button 
        type="submit" 
        disabled={!query.trim()}
        className="px-5 py-2.5 bg-gray-100 border border-l-0 rounded-r-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <SearchIcon className="size-5"/>
      </button>
    </form>
  );
}
 
export default SearchInput;