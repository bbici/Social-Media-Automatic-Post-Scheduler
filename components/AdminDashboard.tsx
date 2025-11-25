
import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { getAllUsers } from '../services/authService';
import { LayoutDashboard, Users, Activity, Settings, LogOut, TrendingUp, ShieldCheck, Search, Bell, Eye } from 'lucide-react';

interface AdminDashboardProps {
  admin: User;
  onLogout: () => void;
  onImpersonate: (user: User) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onLogout, onImpersonate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'settings'>('overview');

  useEffect(() => {
    // Filter out the current admin from the list to prevent impersonating yourself
    const allUsers = getAllUsers().filter(u => u.id !== admin.id);
    setUsers(allUsers);
  }, [admin.id]);

  const stats = [
    { label: 'Total Users', value: users.length, change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Posts', value: '1,234', change: '+25%', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'API Usage', value: '89%', change: '+5%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'System Health', value: '99.9%', change: 'Stable', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500 p-2 rounded-lg">
                <ShieldCheck size={20} className="text-white" />
             </div>
             <div>
               <h1 className="font-bold text-lg leading-tight">AdminPanel</h1>
               <span className="text-xs text-slate-400">v2.0.1</span>
             </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveView('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            Overview
          </button>
          <button 
             onClick={() => setActiveView('users')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users size={20} />
            User Management
          </button>
          <button 
             onClick={() => setActiveView('settings')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Settings size={20} />
            System Settings
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={admin.avatar} alt="Admin" className="w-8 h-8 rounded-full bg-slate-700" />
            <div className="flex-1 overflow-hidden">
               <p className="text-sm font-medium truncate">{admin.name}</p>
               <p className="text-xs text-slate-500 truncate">{admin.email}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2 justify-center px-4 py-2 bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-200 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
           <h2 className="text-xl font-bold capitalize text-slate-800">{activeView}</h2>
           <div className="flex items-center gap-4">
              <div className="relative">
                 <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64" />
              </div>
              <button className="p-2 relative text-slate-500 hover:bg-slate-100 rounded-full">
                 <Bell size={20} />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
           </div>
        </header>

        <div className="p-8">
          
          {/* Overview View */}
          {activeView === 'overview' && (
            <div className="space-y-8 animate-fade-in">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                       <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                          <stat.icon size={24} />
                       </div>
                       <div>
                          <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                          <div className="flex items-end gap-2">
                             <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                             <span className={`text-xs font-bold ${stat.change === 'Stable' ? 'text-slate-500' : 'text-green-600'}`}>{stat.change}</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="font-bold text-slate-800 mb-4">Recent Activity</h3>
                     <div className="space-y-4">
                        {[1,2,3,4,5].map((i) => (
                          <div key={i} className="flex items-center gap-4 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">U{i}</div>
                             <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">User_{i} generated a new campaign</p>
                                <p className="text-xs text-slate-500">2 minutes ago</p>
                             </div>
                             <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Completed</span>
                          </div>
                        ))}
                     </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="font-bold text-slate-800 mb-4">Server Load</h3>
                     <div className="flex items-end justify-between h-48 gap-2">
                        {[40, 60, 30, 80, 50, 70, 45, 90, 60, 40].map((h, i) => (
                           <div key={i} className="w-full bg-indigo-100 rounded-t-sm relative group">
                              <div className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-sm transition-all duration-500" style={{ height: `${h}%` }}></div>
                              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded">{h}%</div>
                           </div>
                        ))}
                     </div>
                     <p className="text-center text-xs text-slate-400 mt-4">Real-time CPU Usage (Last 10m)</p>
                  </div>
               </div>
            </div>
          )}

          {/* Users View */}
          {activeView === 'users' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                       <tr>
                          <th className="px-6 py-4">User</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Joined</th>
                          <th className="px-6 py-4">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {users.length === 0 ? (
                         <tr>
                           <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                             No registered users found.
                           </td>
                         </tr>
                       ) : (
                         users.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-6 py-4 flex items-center gap-3">
                                <img src={u.avatar} alt="" className="w-8 h-8 rounded-full bg-slate-200" />
                                <div>
                                   <p className="font-medium text-slate-900">{u.name}</p>
                                   <p className="text-xs text-slate-500">{u.email}</p>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}`}>
                                   {u.role}
                                </span>
                             </td>
                             <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${u.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                   <span className={`w-1.5 h-1.5 rounded-full ${u.isVerified ? 'bg-green-600' : 'bg-yellow-600'}`}></span> 
                                   {u.isVerified ? 'Active' : 'Pending'}
                                </span>
                             </td>
                             <td className="px-6 py-4">
                                {new Date(u.joinedAt).toLocaleDateString()}
                             </td>
                             <td className="px-6 py-4">
                                <button 
                                  onClick={() => onImpersonate(u)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md transition-colors text-xs font-bold"
                                  title={`View as ${u.name}`}
                                >
                                  <Eye size={14} /> View As
                                </button>
                             </td>
                          </tr>
                         ))
                       )}
                    </tbody>
                 </table>
               </div>
            </div>
          )}
          
          {/* Settings View */}
          {activeView === 'settings' && (
             <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm text-center animate-fade-in">
                <Settings size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-800">System Configuration</h3>
                <p className="text-slate-500 mb-6">Manage global API keys, rate limits, and server maintenance modes.</p>
                <button className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">Access Advanced Config</button>
             </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
