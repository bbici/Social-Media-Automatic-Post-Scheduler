
import React, { useEffect, useState } from 'react';
import { User, Role } from '../types';
import { getAllUsers, deleteUser, updateUserStatus, updateUserRole } from '../services/authService';
import { 
  LayoutDashboard, Users, Activity, Settings, LogOut, TrendingUp, 
  ShieldCheck, Search, Bell, Eye, Ban, CheckCircle, Trash2, 
  MoreVertical, FileText, Server, AlertTriangle, Download 
} from 'lucide-react';

interface AdminDashboardProps {
  admin: User;
  onLogout: () => void;
  onImpersonate: (user: User) => void;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  time: string;
  status: 'success' | 'warning' | 'error';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onLogout, onImpersonate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'settings' | 'logs'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [admin.id]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    }
  }, [users, searchQuery]);

  const loadUsers = () => {
    const allUsers = getAllUsers().filter(u => u.id !== admin.id);
    setUsers(allUsers);
    setFilteredUsers(allUsers);
  };

  const handleSuspend = (id: string, currentStatus: boolean | undefined) => {
    updateUserStatus(id, !currentStatus);
    loadUsers();
    setOpenActionMenu(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) {
      deleteUser(id);
      loadUsers();
      setOpenActionMenu(null);
    }
  };

  const handleRoleChange = (id: string, currentRole: Role) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    updateUserRole(id, newRole);
    loadUsers();
    setOpenActionMenu(null);
  };

  // Mock Data for Charts
  const platformUsage = [
    { platform: 'Twitter', count: 45, color: 'bg-slate-800' },
    { platform: 'LinkedIn', count: 30, color: 'bg-blue-600' },
    { platform: 'Instagram', count: 15, color: 'bg-pink-500' },
    { platform: 'TikTok', count: 10, color: 'bg-black' }
  ];

  const auditLogs: AuditLog[] = [
    { id: '1', action: 'System Backup', user: 'System', time: '10 mins ago', status: 'success' },
    { id: '2', action: 'Failed Login Attempt', user: 'unknown_ip', time: '1 hour ago', status: 'warning' },
    { id: '3', action: 'User Registration', user: 'jane@doe.com', time: '2 hours ago', status: 'success' },
    { id: '4', action: 'API Rate Limit Exceeded', user: 'System', time: '5 hours ago', status: 'error' },
    { id: '5', action: 'Admin Login', user: admin.email, time: 'Just now', status: 'success' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-screen shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500 p-2 rounded-lg">
                <ShieldCheck size={20} className="text-white" />
             </div>
             <div>
               <h1 className="font-bold text-lg leading-tight">AdminPanel</h1>
               <span className="text-xs text-slate-400">Pro v2.1.0</span>
             </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'logs', label: 'Audit Logs', icon: FileText },
            { id: 'settings', label: 'System Settings', icon: Settings },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeView === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg translate-x-1' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={admin.avatar} alt="Admin" className="w-9 h-9 rounded-full bg-slate-700 border-2 border-indigo-500" />
            <div className="flex-1 overflow-hidden">
               <p className="text-sm font-medium truncate">{admin.name}</p>
               <p className="text-xs text-slate-500 truncate capitalize">{admin.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2 justify-center px-4 py-2 bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-200 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
           <h2 className="text-xl font-bold capitalize text-slate-800 flex items-center gap-2">
             {activeView === 'overview' && <LayoutDashboard size={20} className="text-indigo-600" />}
             {activeView === 'users' && <Users size={20} className="text-indigo-600" />}
             {activeView === 'logs' && <FileText size={20} className="text-indigo-600" />}
             {activeView === 'settings' && <Settings size={20} className="text-indigo-600" />}
             {activeView === 'overview' ? 'Dashboard Overview' : activeView}
           </h2>
           <div className="flex items-center gap-4">
              <div className="relative group">
                 <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                 <input 
                    type="text" 
                    placeholder="Search anything..." 
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 bg-slate-50 focus:bg-white transition-all" 
                    disabled={activeView !== 'users'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
              <button className="p-2 relative text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                 <Bell size={20} />
                 <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
           </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          
          {/* Overview View */}
          {activeView === 'overview' && (
            <div className="space-y-8 animate-fade-in">
               {/* Stats Cards */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Users', value: users.length, change: '+12% vs last month', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'System Load', value: '42%', change: 'Optimal', icon: Server, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'API Requests', value: '8.2k', change: '+25% today', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Pending Issues', value: '3', change: 'Needs Attention', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                       <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                          <stat.icon size={24} />
                       </div>
                       <div>
                          <p className="text-sm text-slate-500 font-medium mb-1">{stat.label}</p>
                          <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                          <span className="text-xs text-slate-400 font-medium">{stat.change}</span>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Platform Distribution Chart */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                       <TrendingUp size={20} className="text-indigo-600"/> Platform Content Distribution
                     </h3>
                     <div className="space-y-6">
                        {platformUsage.map((p, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium text-slate-700">{p.platform}</span>
                              <span className="text-slate-500">{p.count}%</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${p.color} transition-all duration-1000 ease-out`} 
                                style={{ width: `${p.count}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                     </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
                     <div className="space-y-3">
                        <button className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-sm font-medium text-slate-700 flex items-center gap-3 transition-colors">
                           <Download size={16} className="text-indigo-600"/> Export User Data (CSV)
                        </button>
                        <button className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-sm font-medium text-slate-700 flex items-center gap-3 transition-colors">
                           <FileText size={16} className="text-indigo-600"/> Generate Monthly Report
                        </button>
                        <button className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-sm font-medium text-slate-700 flex items-center gap-3 transition-colors">
                           <Server size={16} className="text-indigo-600"/> Clear System Cache
                        </button>
                     </div>
                     
                     <div className="mt-6 pt-6 border-t border-slate-100">
                        <p className="text-xs text-slate-400 text-center">Last backup: 2 hours ago</p>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Users View */}
          {activeView === 'users' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <p className="text-slate-500 text-sm">Showing {filteredUsers.length} registered users</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50">Filter: All</button>
                  <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50">Sort: Newest</button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                  <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center text-slate-400">
                                <Users size={48} className="mb-2 opacity-20" />
                                <p>No users found matching "{searchQuery}"</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${u.isSuspended ? 'bg-red-50/30' : ''}`}>
                              <td className="px-6 py-4 flex items-center gap-3">
                                  <div className="relative">
                                    <img src={u.avatar} alt="" className={`w-10 h-10 rounded-full bg-slate-200 ${u.isSuspended ? 'grayscale' : ''}`} />
                                    {u.isSuspended && <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 border border-white"><Ban size={10} className="text-white"/></div>}
                                  </div>
                                  <div>
                                    <p className={`font-medium ${u.isSuspended ? 'text-red-800' : 'text-slate-900'}`}>{u.name}</p>
                                    <p className="text-xs text-slate-500">{u.email}</p>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}`}>
                                    {u.role}
                                  </span>
                              </td>
                              <td className="px-6 py-4">
                                  {u.isSuspended ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      Suspended
                                    </span>
                                  ) : (
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${u.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${u.isVerified ? 'bg-green-600' : 'bg-yellow-600'}`}></span> 
                                      {u.isVerified ? 'Active' : 'Pending'}
                                    </span>
                                  )}
                              </td>
                              <td className="px-6 py-4">
                                  {new Date(u.joinedAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right relative">
                                  <button 
                                    onClick={() => setOpenActionMenu(openActionMenu === u.id ? null : u.id)}
                                    className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                                  >
                                    <MoreVertical size={16} />
                                  </button>
                                  
                                  {/* Dropdown Menu */}
                                  {openActionMenu === u.id && (
                                    <div className="absolute right-8 top-8 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 py-1 text-left animate-fade-in origin-top-right">
                                      <button 
                                        onClick={() => onImpersonate(u)}
                                        className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                      >
                                        <Eye size={14} className="text-indigo-500"/> View As User
                                      </button>
                                      <button 
                                        onClick={() => handleRoleChange(u.id, u.role)}
                                        className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                      >
                                        <ShieldCheck size={14} className="text-purple-500"/> 
                                        {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                      </button>
                                      <button 
                                        onClick={() => handleSuspend(u.id, u.isSuspended)}
                                        className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                      >
                                        {u.isSuspended ? <CheckCircle size={14} className="text-green-500"/> : <Ban size={14} className="text-orange-500"/>}
                                        {u.isSuspended ? 'Re-activate Account' : 'Suspend Account'}
                                      </button>
                                      <div className="h-px bg-slate-100 my-1"></div>
                                      <button 
                                        onClick={() => handleDelete(u.id)}
                                        className="w-full px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                      >
                                        <Trash2 size={14} /> Delete Permanently
                                      </button>
                                    </div>
                                  )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Logs View */}
          {activeView === 'logs' && (
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                   <h3 className="font-bold text-slate-800">System Audit Logs</h3>
                   <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Download CSV</button>
                </div>
                <div className="divide-y divide-slate-100">
                   {auditLogs.map((log) => (
                     <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className={`p-2 rounded-full ${log.status === 'success' ? 'bg-green-100 text-green-600' : log.status === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                              {log.status === 'success' ? <CheckCircle size={16} /> : log.status === 'warning' ? <AlertTriangle size={16} /> : <Ban size={16} />}
                           </div>
                           <div>
                              <p className="text-sm font-medium text-slate-900">{log.action}</p>
                              <p className="text-xs text-slate-500">Triggered by: <span className="font-mono">{log.user}</span></p>
                           </div>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">{log.time}</span>
                     </div>
                   ))}
                </div>
             </div>
          )}
          
          {/* Settings View */}
          {activeView === 'settings' && (
             <div className="max-w-2xl mx-auto animate-fade-in">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                   <div className="p-6 border-b border-slate-100">
                      <h3 className="font-bold text-slate-800">General Configuration</h3>
                      <p className="text-sm text-slate-500">Control global application behavior</p>
                   </div>
                   <div className="p-6 space-y-6">
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="font-medium text-slate-900">Maintenance Mode</p>
                            <p className="text-xs text-slate-500">Disable access for non-admin users</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" className="sr-only peer" />
                           <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                         </label>
                      </div>
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="font-medium text-slate-900">Allow New Registrations</p>
                            <p className="text-xs text-slate-500">If disabled, only admins can add users</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" className="sr-only peer" defaultChecked />
                           <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                         </label>
                      </div>
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="font-medium text-slate-900">Strict Email Verification</p>
                            <p className="text-xs text-slate-500">Require email code before login</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" className="sr-only peer" defaultChecked />
                           <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                         </label>
                      </div>
                   </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                   <div className="p-6 border-b border-slate-100">
                      <h3 className="font-bold text-slate-800 text-red-600 flex items-center gap-2"><AlertTriangle size={18}/> Danger Zone</h3>
                   </div>
                   <div className="p-6 bg-red-50/50">
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="font-medium text-slate-900">Reset System Database</p>
                            <p className="text-xs text-slate-500">Delete all users and posts (Admin preserved)</p>
                         </div>
                         <button className="px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50">Reset Data</button>
                      </div>
                   </div>
                </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
