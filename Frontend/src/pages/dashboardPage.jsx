import Dashboard from "../components/dashboardForm";
import Header from "./header";
import Footer from "./footer";
import "./CSS/styling.css";
import "./CSS/fa.css";
import "./CSS/header.css";
import "./CSS/card.css";

const DashboardPage = () => {
  return (
    <div className="dashboard-page">
      <Header/>
      <header className="dashboard-header">
        <h1 className="mt-2 text-white">Lab Inventory Dashboard</h1>
        <p className="text-white text-base opacity-80">Manage and track your laboratory equipment and supplies</p>
      </header>
      <Dashboard />
      <Footer/>
    </div>
  );
};

export default DashboardPage;
