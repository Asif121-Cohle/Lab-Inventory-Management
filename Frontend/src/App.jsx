import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LabProvider } from "./context/LabContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatBot from "./components/ChatBot";

// Pages
import LoginPage from "./pages/loginPage";
import SignupPage from "./pages/signupPage";
import DashboardPage from "./pages/dashboardPage";
import LabDetailPage from "./pages/labDetailPage";
import MaterialDetailPage from "./pages/materialDetailPage";

// Student Pages
import RequestMaterialPage from "./pages/requestMaterialPage";
import RequestStatusPage from "./pages/requestStatusPage";

// Professor Pages
import ScheduleLabPage from "./pages/scheduleLabPage";
import CheckLabSchedulePage from "./pages/checkLabSchedulePage";

// Lab Assistant Pages
import ApproveRequestsPage from "./pages/approveRequestsPage";

// Authenticated ChatBot Wrapper
const AuthenticatedChatBot = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <ChatBot /> : null;
};

function App() {
  return (
    <AuthProvider>
      <LabProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signupForm" element={<SignupPage />} />

            {/* Protected Routes - All Authenticated Users */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab/:labId"
              element={
                <ProtectedRoute>
                  <LabDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/material/:materialId"
              element={
                <ProtectedRoute>
                  <MaterialDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Student Only Routes */}
            <Route
              path="/request-material"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <RequestMaterialPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request-status"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <RequestStatusPage />
                </ProtectedRoute>
              }
            />

            {/* Professor Only Routes */}
            <Route
              path="/schedule-lab"
              element={
                <ProtectedRoute allowedRoles={["professor"]}>
                  <ScheduleLabPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-schedule"
              element={
                <ProtectedRoute allowedRoles={["professor", "lab_assistant"]}>
                  <CheckLabSchedulePage />
                </ProtectedRoute>
              }
            />

            {/* Lab Assistant Only Routes */}
            <Route
              path="/approve-request"
              element={
                <ProtectedRoute allowedRoles={["lab_assistant"]}>
                  <ApproveRequestsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
          
          {/* AI Chat Assistant - Only available when authenticated */}
          <AuthenticatedChatBot />
        </Router>
      </LabProvider>
    </AuthProvider>
  );
}

export default App;
