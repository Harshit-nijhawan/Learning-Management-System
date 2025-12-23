import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Check } from 'lucide-react';
import api from '../utils/api';

const AdminArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        category: 'Web Development',
        subcategory: 'React',
        difficulty: 'Beginner',
        description: '',
        content: [], // Simplified for now, or just text area for raw content
        tags: ''
    });

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const response = await api.get('/api/articles?limit=100');
            setArticles(response.data.articles || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching articles:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this article?')) return;
        try {
            await api.delete(`/api/articles/${id}`);
            setArticles(articles.filter(a => a._id !== id));
        } catch (error) {
            console.error('Error deleting article:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Basic validation and formatting
            const articleData = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                // Simplified content structure for this basic editor
                content: [
                    {
                        sectionTitle: 'Main Content',
                        sectionType: 'text',
                        text: formData.description, // Just reusing description for now as main text to start
                        order: 1
                    }
                ]
            };

            if (editingArticle) {
                await api.put(`/api/articles/${editingArticle._id}`, articleData);
            } else {
                await api.post('/api/articles', articleData);
            }

            setShowForm(false);
            setEditingArticle(null);
            setFormData({
                title: '',
                category: 'Web Development',
                subcategory: 'React',
                difficulty: 'Beginner',
                description: '',
                tags: ''
            });
            fetchArticles();
        } catch (error) {
            console.error('Error saving article:', error);
            alert('Failed to save article');
        }
    };

    const openEdit = (article) => {
        setEditingArticle(article);
        setFormData({
            title: article.title,
            category: article.category,
            subcategory: article.subcategory,
            difficulty: article.difficulty,
            description: article.description,
            tags: article.tags ? article.tags.join(', ') : ''
        });
        setShowForm(true);
    };

    if (loading) return <div className="p-4">Loading articles...</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Manage Articles</h2>
                <button
                    onClick={() => {
                        setEditingArticle(null);
                        setFormData({
                            title: '',
                            category: 'Web Development',
                            subcategory: '',
                            difficulty: 'Beginner',
                            description: '',
                            tags: ''
                        });
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus size={20} /> Add Article
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold">{editingArticle ? 'Edit Article' : 'New Article'}</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option>Web Development</option>
                                        <option>Algorithms</option>
                                        <option>Data Structures</option>
                                        <option>Python</option>
                                        <option>Java</option>
                                        <option>System Design</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded"
                                        value={formData.subcategory}
                                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                        placeholder="e.g. React, Sorting"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                >
                                    <option>Beginner</option>
                                    <option>Easy</option>
                                    <option>Medium</option>
                                    <option>Hard</option>
                                    <option>Expert</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full p-2 border rounded"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="e.g. react, hooks, frontend"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {editingArticle ? 'Update Article' : 'Create Article'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="p-4 font-semibold text-gray-600">Title</th>
                            <th className="p-4 font-semibold text-gray-600">Category</th>
                            <th className="p-4 font-semibold text-gray-600">Difficulty</th>
                            <th className="p-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map((article) => (
                            <tr key={article._id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">{article.title}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                                        {article.category}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-sm ${article.difficulty === 'Easy' || article.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                                            article.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {article.difficulty}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button
                                        onClick={() => openEdit(article)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(article._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminArticles;
