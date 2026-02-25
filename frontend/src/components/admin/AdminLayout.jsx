import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    PlusCircle,
    FolderTree,
    ShoppingBag,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        {
            path: '/admin',
            name: 'Dashboard',
            icon: <LayoutDashboard size={20} />
        },
        {
            path: '/admin/products',
            name: 'Products',
            icon: <Package size={20} />
        },
        {
            path: '/admin/add-product',
            name: 'Add Product',
            icon: <PlusCircle size={20} />
        },
        {
            path: '/admin/categories',
            name: 'Categories',
            icon: <FolderTree size={20} />,  // Updated
            soon: true
        },
        {
            path: '/admin/orders',
            name: 'Orders',
            icon: <ShoppingBag size={20} />,
            soon: true // For future
        },
        {
            path: '/admin/settings',
            name: 'Settings',
            icon: <Settings size={20} />,
            soon: true // For future
        }
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed top-0 left-0 h-full bg-white shadow-lg z-30
        transition-transform duration-300 ease-in-out
        w-64 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b">
                    <h1 className="text-xl font-bold text-blue-600 font-khmer">Admin Panel</h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 hover:bg-gray-100 rounded"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Sidebar Menu */}
                <div className="p-4">
                    <div className="space-y-1">
                        {menuItems.map((item) => (
                            <div key={item.path}>
                                {item.soon ? (
                                    <div className="flex items-center justify-between px-4 py-2 text-gray-400 rounded-lg cursor-not-allowed">
                                        <div className="flex items-center gap-3">
                                            {item.icon}
                                            <span className="font-sans">{item.name}</span>
                                        </div>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Soon</span>
                                    </div>
                                ) : (
                                    <Link
                                        to={item.path}
                                        className={`
                      flex items-center gap-3 px-4 py-2 rounded-lg transition-colors font-sans
                      ${isActive(item.path)
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }
                    `}
                                    >
                                        {item.icon}
                                        <span>{item.name}</span>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Logout Button */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-sans"
                        >
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Top Bar */}
                <div className="h-16 bg-white shadow-sm flex items-center px-4 sticky top-0 z-10">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="ml-auto flex items-center gap-4">
                        <span className="text-sm text-gray-600 font-sans">
                            Welcome, Admin
                        </span>
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;