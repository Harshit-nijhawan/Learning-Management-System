import React, { useEffect, useState } from "react";
import { Trash2, Pencil, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function InstructorCourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      const response = await api.get("/api/my-courses");
      // Handle both array or { courses: [] } format
      const data = Array.isArray(response.data) ? response.data : (response.data.courses || []);
      setCourses(data);
    } catch (err) {
      console.error("Error fetching courses:", err);
      // If error is 404 or others, default to empty
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      setDeletingId(id);
      try {
        await api.delete(`/api/courses/${id}`);
        setCourses((prev) => prev.filter((course) => course._id !== id));
      } catch (err) {
        console.error("Error deleting course:", err);
        alert(err.response?.data?.message || "Failed to delete course");
      }
      setDeletingId(null);
    }
  };

  const handleEdit = (id) => {
    navigate(`/update-course/${id}`);
  };

  const handleCreateCourse = () => {
    navigate("/create-course");
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-700">My Courses</h2>
        <button
          onClick={handleCreateCourse}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <Plus size={18} />
          Create Course
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-8">
          Loading your courses...
        </p>
      ) : courses.length > 0 ? (
        <div className="grid gap-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      ₹{course.price}
                    </span>
                    <span>Rating: {course.rating || "Not rated"}</span>
                    <span>Students: {course.studentsEnrolled || 0}</span>
                    <span>
                      Created: {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {course.image && (
                  <img
                    src={`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/images/${course.image}`}
                    alt={course.title}
                    className="w-24 h-24 object-cover rounded-lg ml-4 border border-gray-200"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => handleEdit(course._id)}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1 rounded transition flex items-center gap-1"
                  title="Edit"
                >
                  <Pencil size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(course._id)}
                  className={`bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition flex items-center gap-1 ${deletingId === course._id
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                    }`}
                  title="Delete"
                  disabled={deletingId === course._id}
                >
                  <Trash2 size={16} />
                  {deletingId === course._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            You haven't created any courses yet
          </p>
          <button
            onClick={handleCreateCourse}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Create Your First Course
          </button>
        </div>
      )}
    </div>
  );
}

export default InstructorCourseList;
