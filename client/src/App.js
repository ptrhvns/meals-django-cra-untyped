import Navbar from "./components/Navbar";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Outlet } from "react-router-dom";

import "./App.scss";

function App() {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Meals</title>
      </Helmet>
      <Navbar />
      <Outlet />
    </HelmetProvider>
  );
}

export default App;
