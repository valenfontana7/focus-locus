import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HelpOutlineSharpIcon from "@mui/icons-material/HelpOutlineSharp";
import { Link } from "react-router-dom";

function AppLayout({ children }) {
  return (
    <>
      <header className="header w-full flex items-center justify-between p-8">
        <h1 className="text-2xl font-bold text-center">FocusLocus</h1>
        <nav className="flex items-center justify-center">
          <Link to="/" className="mx-4 text-black-500 hover:underline">
            <HelpOutlineSharpIcon />
          </Link>
          <Link to="#" className="mx-4 text-black-500 hover:underline">
            <AccountCircleIcon />
          </Link>
        </nav>
      </header>
      <main className="app-layout flex items-center justify-center">
        {typeof children === Array ? children.map((child) => child) : children}
      </main>
    </>
  );
}

export default AppLayout;
