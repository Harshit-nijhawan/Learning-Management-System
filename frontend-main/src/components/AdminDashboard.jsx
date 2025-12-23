import React, { useState, useEffect } from "react";
import Sidebar, { SidebarItem } from "./Sidebar";
import {
  LayoutDashboard,
  LogOut,
  Users,
  GraduationCap,
  BookOpen,
  CircleUser,
  DollarSign,
  FileText,
  Code
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import DashCard from "./DashCard";
import UserList from "./UserList";
import CourseList from "./CourseList";
import AdminArticles from "./AdminArticles";
import AdminProblems from "./AdminProblems";
import api from "../utils/api";

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");

  // State for actual counts
  const [studentCount, setStudentCount] = useState(0);
  const [instructorCount, setInstructorCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [articleCount, setArticleCount] = useState(0);
  const [problemCount, setProblemCount] = useState(0);

  useEffect(() => {
    // Fetch students count
    api.get("/api/protected/students").then((res) => setStudentCount(res.data.length)).catch(() => setStudentCount(0));
    // Fetch instructors count
    api.get("/api/protected/instructors").then((res) => setInstructorCount(res.data.length)).catch(() => setInstructorCount(0));
    // Fetch courses count
    api.get("/api/allCourses")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setCourseCount(res.data.length);
        } else if (res.data && Array.isArray(res.data.courses)) {
          setCourseCount(res.data.courses.length);
        }
      })
      .catch(() => setCourseCount(0));
    // Fetch articles count (approximate via list limit)
    api.get("/api/articles?limit=1").then(res => setArticleCount(res.data.total)).catch(() => setArticleCount(0));
    // Fetch problems count
    api.get("/api/problems").then(res => setProblemCount(res.data.problems?.length || res.data.length)).catch(() => setProblemCount(0));

  }, []);

  const dashData = [
    {
      title: "Total Students",
      value: studentCount,
      change: "+12.5%",
      icon: Users,
    },
    {
      title: "Instructors",
      value: instructorCount,
      change: "+5%",
      icon: GraduationCap,
    },
    {
      title: "Courses",
      value: courseCount || 0,
      change: "+8%",
      icon: BookOpen,
    },
    {
      title: "Articles",
      value: articleCount || 0,
      change: "+20%",
      icon: FileText,
    },
    {
      title: "Problems",
      value: problemCount || 0,
      change: "New",
      icon: Code,
    }
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar>
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
          active={activeSection === "dashboard"}
          onClick={() => setActiveSection("dashboard")}
        />
        <SidebarItem
          icon={<Users size={20} />}
          text="Students"
          active={activeSection === "students"}
          onClick={() => setActiveSection("students")}
        />
        <SidebarItem
          icon={<GraduationCap size={20} />}
          text="Instructor"
          active={activeSection === "instructor"}
          onClick={() => setActiveSection("instructor")}
        />
        <SidebarItem
          icon={<BookOpen size={20} />}
          text="Courses"
          active={activeSection === "courses"}
          onClick={() => setActiveSection("courses")}
        />
        <hr className="my-2 border-slate-700" />
        <SidebarItem
          icon={<FileText size={20} />}
          text="Articles"
          active={activeSection === "articles"}
          onClick={() => setActiveSection("articles")}
        />
        <SidebarItem
          icon={<Code size={20} />}
          text="Problems"
          active={activeSection === "problems"}
          onClick={() => setActiveSection("problems")}
        />
        <hr className="my-2 border-slate-700" />
        <SidebarItem
          icon={<CircleUser size={20} />}
          text="Profile"
          onClick={() => {
            const userId = user?._id || user?.id;
            if (userId) {
              navigate(`/user/${userId}`);
            }
          }}
        />
        <SidebarItem
          icon={<LogOut size={20} />}
          text="Logout"
          onClick={handleLogout}
        />
      </Sidebar>
      <main className="flex-1 p-8 bg-gray-100 min-h-screen ml-64 transition-all">
        {activeSection === "dashboard" && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dashData.map((data, index) => (
                <DashCard
                  key={index}
                  title={data.title}
                  value={data.value}
                  change={data.change}
                  Icon={data.icon}
                />
              ))}
            </div>
          </>
        )}

        {activeSection !== "dashboard" && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 capitalize">{activeSection} Management</h1>
          </div>
        )}

        {/* Dynamic Content */}
        {activeSection === "instructor" && <div className="mt-6"><UserList /></div>}
        {activeSection === "students" && <div className="mt-6"><UserList type="student" /></div>}
        {activeSection === "courses" && <div className="mt-6"><CourseList showEdit={false} /></div>}
        {activeSection === "articles" && <div className="mt-6"><AdminArticles /></div>}
        {activeSection === "problems" && <div className="mt-6"><AdminProblems /></div>}
      </main>
    </div>
  );
}

export default AdminDashboard;
