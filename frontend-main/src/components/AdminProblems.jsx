import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Search, Video, BookOpen } from 'lucide-react';
import api from '../utils/api';

const AdminProblems = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProblem, setEditingProblem] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        videoUrl: '',
        theory: ''
    });

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            const response = await api.get('/api/problems');
            // The API might return { problems: [...] } or just [...]
            const data = response.data.problems || response.data;
            setProblems(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching problems:', error);
            setLoading(false);
        }
    };

    const openEdit = (problem) => {
        setEditingProblem(problem);
        setFormData({
            videoUrl: problem.videoUrl || '',
            theory: problem.theory || ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingProblem) return;

        try {
            // NOTE: verify the endpoint for updating a problem
            // Usually PUT /api/problems/:id
            await api.put(`/api/problems/${editingProblem._id}`, {
                ...editingProblem, // Keep existing fields
                videoUrl: formData.videoUrl,
                theory: formData.theory
            });

            // Update local state
            setProblems(problems.map(p =>
                p._id === editingProblem._id
                    ? { ...p, videoUrl: formData.videoUrl, theory: formData.theory }
                    : p
            ));

            setEditingProblem(null);
            alert('Problem updated successfully!');
        } catch (error) {
            console.error('Error updating problem:', error);
            alert('Failed to update problem');
        }
    };

    const filteredProblems = problems.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-4">Loading problems...</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Manage Problems (Video & Theory)</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search problems..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {editingProblem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <h3 className="text-xl font-bold text-gray-800">Edit Solution: {editingProblem.title}</h3>
                            <button onClick={() => setEditingProblem(null)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Video size={18} className="text-red-600" />
                                    YouTube Video URL
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formData.videoUrl}
                                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                                <p className="text-xs text-gray-500 mt-1">Paste the full YouTube URL here.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <BookOpen size={18} className="text-blue-600" />
                                    Theory / Approach
                                </label>
                                <textarea
                                    rows={8}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                                    value={formData.theory}
                                    onChange={(e) => setFormData({ ...formData, theory: e.target.value })}
                                    placeholder="Explain the intuition and approach..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setEditingProblem(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    <Save size={18} /> Update Solution
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="overflow-hidden border rounded-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="p-4 font-semibold text-gray-600">Problem Title</th>
                            <th className="p-4 font-semibold text-center text-gray-600">Video</th>
                            <th className="p-4 font-semibold text-center text-gray-600">Theory</th>
                            <th className="p-4 font-semibold text-right text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProblems.map((problem) => (
                            <tr key={problem._id} className="border-b hover:bg-gray-50 transition">
                                <td className="p-4 font-medium text-gray-800">{problem.title}</td>
                                <td className="p-4 text-center">
                                    {problem.videoUrl ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Available
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Missing
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-center">
                                    {problem.theory ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Available
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Missing
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => openEdit(problem)}
                                        className="flex items-center gap-1 ml-auto text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                                    >
                                        <Edit size={16} /> Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredProblems.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500">
                                    No problems found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProblems;
