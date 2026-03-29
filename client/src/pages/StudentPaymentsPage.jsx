import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";

const StudentPaymentsPage = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  
  const [activeFees, setActiveFees] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      setError("");
      const [actRes, histRes] = await Promise.all([
        authFetch("http://localhost:8081/api/payments/active"),
        authFetch("http://localhost:8081/api/payments/history")
      ]);
      
      if (!actRes.ok || !histRes.ok) throw new Error("Failed to fetch payment data");
      
      const actData = await actRes.json();
      const histData = await histRes.json();
      setActiveFees(actData);
      setHistory(histData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, [authFetch]);

  const handlePay = (feeId) => {
    // Navigating to an unhandled route to trigger the 404 screen, 
    // simulating a payment gateway that we haven't built yet!
    navigate(`/payment-gateway/${feeId}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isOpen} role="student" />
      <div className="flex-1 flex flex-col">
        <Header title="Exam Fees & Payments" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
        
        <main className="p-6 flex-1 overflow-y-auto">
          {error && <div className="p-4 mb-6 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>}

          {/* ACTIVE DUE FEES */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Pending Dues</h2>
            {loading ? (
              <p className="text-gray-500">Loading active fees...</p>
            ) : activeFees.length === 0 ? (
              <div className="bg-white p-6 rounded-lg border border-green-200 shadow-sm text-center">
                <span className="text-4xl">🎉</span>
                <p className="mt-4 text-green-700 font-medium">You have no active fee notifications or pending dues!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {activeFees.map(fee => (
                  <div key={fee.id} className="bg-white p-6 rounded-lg shadow-sm border border-red-200 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{fee.title}</h3>
                      <div className="flex justify-between items-center text-sm mb-1 mt-4 border-b border-gray-100 pb-2">
                        <span className="text-gray-600">Base Amount:</span>
                        <span className="font-medium text-gray-800">₹{fee.baseAmount}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mb-1 border-b border-gray-100 pb-2">
                        <span className="text-gray-600">Expected Due Date:</span>
                        <span className={`font-medium ${fee.currentLateFee > 0 ? 'text-red-500 line-through' : 'text-gray-800'}`}>
                          {fee.dueDate || "Continuous"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-red-600 mb-1 border-b border-red-100 pb-2 bg-red-50 px-2 -mx-2">
                        <span>Late Fee Penalty Applied:</span>
                        <span className="font-bold">+ ₹{fee.currentLateFee}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-gray-50 -mx-6 -mb-6 p-4 rounded-b-lg border-t border-gray-200">
                      <div className="mb-4 sm:mb-0 text-center sm:text-left">
                        <span className="block text-xs uppercase text-gray-500 font-semibold tracking-wider">Total Due</span>
                        <span className="text-2xl font-black text-gray-900">₹{fee.totalAmountDue}</span>
                      </div>
                      <button 
                        onClick={() => handlePay(fee.id)}
                        disabled={payingId === fee.id}
                        className={`px-8 py-3 rounded text-white font-bold shadow-sm transition ${payingId === fee.id ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        {payingId === fee.id ? 'Processing...' : 'Pay Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* PAYMENT HISTORY */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Payment History Ledger</h2>
            {loading ? (
              <p className="text-gray-500">Loading ledger...</p>
            ) : history.length === 0 ? (
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center text-gray-500">
                You have not made any payments yet.
              </div>
            ) : (
              <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Transaction ID</th>
                        <th className="px-6 py-4">Fee Item</th>
                        <th className="px-6 py-4">Date Paid</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {history.map(record => {
                        const date = new Date(record.paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                        const time = new Date(record.paidAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                        return (
                          <tr key={record.id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4 font-mono text-sm text-blue-600">{record.transactionId}</td>
                            <td className="px-6 py-4 text-gray-800 font-medium">{record.feeNotification?.title || 'Unknown Fee'}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{date} <span className="text-xs text-gray-400 block">{time}</span></td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                                {record.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-gray-900">₹{record.amountPaid}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

        </main>
        <Footer />
      </div>
    </div>
  );
};

export default StudentPaymentsPage;
