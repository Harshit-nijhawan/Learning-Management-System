import React, { useState, useEffect } from "react";
import Sidebar, { SidebarItem } from "./Sidebar";
import {
  LayoutDashboard,
  MessageSquare,
  LogOut,
  Users,
  BookOpen,
  CircleUser,
  DollarSign
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import DashCard from "./DashCard";
import InstructorCourseList from "./InstructorCourseList";
import UserList from "./UserList";
import api from "../utils/api";

function InstructorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [courseCount, setCourseCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0); // Add student count logic if API available

  useEffect(() => {
    // Determine course count
    api.get("/api/my-courses")
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.courses || []);
        setCourseCount(data.length);
      })
      .catch(() => setCourseCount(0));

    // Placeholder for student count if API exists for "my students"
    // api.get("/api/my-students").then(...) 
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dashData = [
    {
      title: "My Courses",
      value: courseCount.toString(),
      change: "Active",
      icon: BookOpen,
    },
    {
      title: "Total Students",
      value: "N/A", // user.studentsCount if available in user object
      change: "Enrolled",
      icon: Users
    },
    {
      title: "Earnings",
      value: "$0",
      change: "This Month",
      icon: DollarSign,
    },
  ];

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
          icon={<BookOpen size={20} />}
          text="My Courses"
          active={activeSection === "courses"}
          onClick={() => setActiveSection("courses")}
        />
        <SidebarItem
          icon={<Users size={20} />}
          text="My Students"
          active={activeSection === "students"}
          onClick={() => setActiveSection("students")}
        />
        <SidebarItem
          icon={<MessageSquare size={20} />}
          text="Messages"
          active={activeSection === "messages"}
          onClick={() => setActiveSection("messages")}
        />
        <hr className="my-2 border-slate-700" />
        <SidebarItem
          icon={<CircleUser size={20} />}
          text="Profile"
          onClick={() => {
            const userId = user?._id || user?.id;
            if (userId) navigate(`/user/${userId}`);
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name || "Instructor"}
              </h1>
              <p className="text-gray-600 mt-2">Manage your courses and track your progress.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
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

            {/* Recent Courses Preview or Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/create-course')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <BookOpen size={20} />
                  Create New Course
                </button>
                <button
                  onClick={() => setActiveSection('courses')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  View All Courses
                </button>
              </div>
            </div>
          </>
        )}

        {activeSection === "courses" && (
          <div>
            <InstructorCourseList />
          </div>
        )}

        {activeSection === "students" && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Students</h1>
            {/* Reusing UserList but simplified, assuming it can filter by instructor if supported. 
                For now generic UserList is administrative. 
                Ideally we need an endpoint /api/my-students */}
            <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
              Student list management coming soon.
            </div>
          </div>
        )}

        {activeSection === "messages" && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Messages</h2>
            <div className="text-center py-12 text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>No new messages.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default InstructorDashboard;
