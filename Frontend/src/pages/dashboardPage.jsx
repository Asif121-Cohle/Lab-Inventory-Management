import Dashboard from "../components/dashboardForm";
import "./styling.css";

const DashboardPage = () => {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1 className="mt-2 text-white">Lab Inventory Dashboard</h1>
        <p className="text-white text-base opacity-80">Manage and track your laboratory equipment and supplies</p>
      </header>
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
