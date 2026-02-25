import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        nameKm: '',
        nameEn: '',
        icon: '📦'
    });

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const url = editingId
                ? `http://localhost:5000/api/categories/${editingId}`
                : 'http://localhost:5000/api/categories';

            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setFormData({ nameKm: '', nameEn: '', icon: '📦' });
                setShowForm(false);
                setEditingId(null);
                fetchCategories();
            }
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const handleEdit = (category) => {
        setFormData({
            nameKm: category.nameKm,
            nameEn: category.nameEn,
            icon: category.icon
        });
        setEditingId(category._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchCategories();
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8">Loading...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold font-khmer">គ្រប់គ្រងប្រភេទ</h2>
                    <p className="text-gray-600 font-sans">Categories Management</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ nameKm: '', nameEn: '', icon: '📦' });
                        setEditingId(null);
                        setShowForm(!showForm);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={20} />
                    <span>{showForm ? 'Cancel' : 'Add Category'}</span>
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-lg font-bold mb-4 font-sans">
                        {editingId ? 'Edit Category' : 'New Category'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block font-khmer mb-1">ឈ្មោះខ្មែរ</label>
                            <input
                                type="text"
                                value={formData.nameKm}
                                onChange={(e) => setFormData({ ...formData, nameKm: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-sans mb-1">English Name</label>
                            <input
                                type="text"
                                value={formData.nameEn}
                                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-sans mb-1">Icon (emoji)</label>
                            <input
                                type="text"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="📦"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            {editingId ? 'Update' : 'Save'}
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left">Icon</th>
                            <th className="px-4 py-3 text-left">Khmer</th>
                            <th className="px-4 py-3 text-left">English</th>
                            <th className="px-4 py-3 text-left">Slug</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat._id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3 text-2xl">{cat.icon}</td>
                                <td className="px-4 py-3 font-khmer">{cat.nameKm}</td>
                                <td className="px-4 py-3 font-sans">{cat.nameEn}</td>
                                <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => handleEdit(cat)}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded mr-2"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat._id)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
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

export default Categories;