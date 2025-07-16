import SearchIcon from "@mui/icons-material/Search";

function SearchBar() {
  return (
    <div className="search-bar flex items-center bg-gray-100 gap-x-2 rounded-lg p-2 pl-3 pr-3 w-1/2 max-w-4xl shadow-sm">
      <SearchIcon className="search-bar__searchIcon" />
      <input
        className="search-bar__searchInput"
        type="text"
        name="search"
        placeholder="Buscar proyectos..."
      />
    </div>
  );
}

export default SearchBar;
