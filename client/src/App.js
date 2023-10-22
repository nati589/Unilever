import { Routes, Route } from "react-router-dom";
import BookingPage from "./pages/BookingPage";
import DashboardPage from "./pages/DashboardPage";
import "./styles/index.css";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import EmployeePage from "./pages/EmployeePage";

export default function App() {
  return (
    <div>
      <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/employee" element={<EmployeePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </div>
  );
}

// <Route path="/learning/:id" element={<LearningPage />}>
//   <Route
//     path={`/learning/:id/text/:sectionId`}
//     element={<TextContent />}
//   />
//   <Route
//     path={`/learning/:id/video/:sectionId`}
//     element={<VideoContent />}
//   />
//   <Route
//     path={`/learning/:id/assignment/:sectionId`}
//     element={<AssignmentContent />}
//   />
//   <Route
//     path={`/learning/:id/quiz/:sectionId`}
//     element={<QuizContent />}
//   />
// </Route>
