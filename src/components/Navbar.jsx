import SearchBar from "./SearchBar.jsx";

function Navbar() {
  return (
    <nav className="navbar w-full h-18 rounded-tl-2xl rounded-tr-2xl flex items-center p-6">
      <SearchBar />
    </nav>
  );
}

export default Navbar;
