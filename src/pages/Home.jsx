import AppLayout from "../components/AppLayout.jsx";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Button from "../components/Button.jsx";
import AddIcon from "@mui/icons-material/Add";
import Lists from "../components/Lists.jsx";

function Home() {
  return (
    <AppLayout>
      <div className="home bg-white rounded-2xl">
        <Navbar />
        <div className="home__content flex h-full">
          <Sidebar />
          <div className="home__content-main w-full bg-gray-100 px-10 py-10 rounded-br-2xl flex flex-col">
            <div className="home__content-main-header flex justify-between">
              <h1 className="text-3xl font-bold">📌 Proyecto: Freelance Web</h1>
              <Button icon={<AddIcon />} type="button" variant="gray">
                Nueva tarea
              </Button>
            </div>
            <Lists />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Home;
