import Dashboard from "../components/dashboardForm";
import Header from "./header";
import Footer from "./footer";
import "./CSS/header.css";
import "./CSS/card.css";
import "./CSS/dashboard.css";
import "./CSS/Blob.css";

const DashboardPage = () => {
  return (
    <div className="page-wrapper dashboard-page">
      <div className="animated-bg">
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      <div className="dashboard-content">
        <Header />
        <header className="dashboard-header">
          <h2 className="header">
            Manage and track your laboratory equipment and supplies
          </h2>
        </header>
        <Dashboard />
        <Footer />
      </div>
    </div>
  );
};

export default DashboardPage;
