// client/src/pages/AdminFeeNotifications.jsx
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import { TrashIcon } from "@heroicons/react/24/outline";

const AdminFeeNotifications = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { authFetch } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    title: "",
    baseAmount: "",
    dueDate: "",
    lateFeePerWeek: "",
    targetYear: "All",
    targetSemester: "All"
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await authFetch("https://uems-rz8o.onrender.com/api/admin/fees");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [authFetch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });
    try {
      const payload = {
        ...formData,
        baseAmount: Number(formData.baseAmount),
        lateFeePerWeek: Number(formData.lateFeePerWeek)
      };

      const res = await authFetch("https://uems-rz8o.onrender.com/api/admin/fees/notify", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to create notification");

      setMessage({ type: "success", text: "Fee notification broadcasted successfully!" });
      setFormData({ title: "", baseAmount: "", dueDate: "", lateFeePerWeek: "", targetYear: "All", targetSemester: "All" });
      fetchNotifications();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete/cancel the notification: "${title}"?`)) {
      return;
    }

    try {
      const res = await authFetch(`https://uems-rz8o.onrender.com/api/admin/fees/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete notification");
      setMessage({ type: "success", text: "Notification deleted successfully!" });
      fetchNotifications();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isOpen} role="admin" />
      <div className="flex-1 flex flex-col">
        <Header title="Fee Notifications" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />

        <main className="p-6 flex-1 overflow-y-auto">
          {message.text && (
            <div className={`p-4 mb-6 rounded border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
              {message.text}
            </div>
          )}

          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Create New Fee Alert</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Title / Description</label>
                <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. B.Tech I Year II sem Regular /Supplementary Examination fees" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Year</label>
                  <select name="targetYear" value={formData.targetYear} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="All">All Years</option>
                    <option value="1">I Year (1)</option>
                    <option value="2">II Year (2)</option>
                    <option value="3">III Year (3)</option>
                    <option value="4">IV Year (4)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Semester</label>
                  <select name="targetSemester" value={formData.targetSemester} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="All">All Semesters</option>
                    <option value="1">I Sem (1)</option>
                    <option value="2">II Sem (2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Amount (₹)</label>
                  <input required type="number" name="baseAmount" value={formData.baseAmount} onChange={handleChange} placeholder="765" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" min="0" step="0.01" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Late Fee Per Week (₹)</label>
                  <input required type="number" name="lateFeePerWeek" value={formData.lateFeePerWeek} onChange={handleChange} placeholder="100" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" min="0" step="0.01" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (End Date before Late Fee)</label>
                  <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <button type="submit" disabled={submitting} className={`mt-4 px-6 py-2 rounded text-white font-medium shadow-sm transition ${submitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {submitting ? 'Broadcasting...' : 'Broadcast Notification'}
              </button>
            </form>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-b border-gray-300">
              <h2 className="text-lg font-bold text-gray-800">Active Notifications</h2>
            </div>
            {loading ? (
              <div className="p-6 text-gray-500 text-center">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-gray-500 text-center">No fee notifications created yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50 text-sm text-gray-600 uppercase">
                    <tr>
                      <th className="px-6 py-3 border-b">Title</th>
                      <th className="px-6 py-3 border-b">Target</th>
                      <th className="px-6 py-3 border-b">Base Fee</th>
                      <th className="px-6 py-3 border-b">Late/Wk</th>
                      <th className="px-6 py-3 border-b">Due Date</th>
                      <th className="px-6 py-3 border-b text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {notifications.map(n => (
                      <tr key={n.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-medium">{n.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {n.targetYear === 'All' && n.targetSemester === 'All' ? 'Global' : `${n.targetYear} - ${n.targetSemester}`}
                        </td>
                        <td className="px-6 py-4">₹{n.baseAmount}</td>
                        <td className="px-6 py-4">₹{n.lateFeePerWeek}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-700">{n.dueDate}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(n.id, n.title)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition"
                            title="Delete Notification"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminFeeNotifications;
