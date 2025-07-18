import AppLayout from "../components/AppLayout.jsx";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Lists from "../components/Lists.jsx";
import { useProjectContext } from "../context/ProjectContext";
import { useState } from "react";

function Home() {
  const { activeProject } = useProjectContext();
  const [search, setSearch] = useState("");
  return (
    <AppLayout>
      <div className="home bg-white rounded-2xl">
        <Navbar search={search} setSearch={setSearch} />
        <div className="home__content flex h-full">
          <Sidebar search={search} setSearch={setSearch} />
          <div className="home__content-main w-full bg-gray-100 px-10 py-10 rounded-br-2xl flex flex-col">
            <div className="home__content-main-header">
              <h1 className="text-3xl font-bold">📌 {activeProject}</h1>
            </div>
            <Lists />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Home;
