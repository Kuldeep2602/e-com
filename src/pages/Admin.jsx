import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// All MUI imports removed for Tailwind migration
import { useAuth } from '../context/AuthContext.js';

// Mock data for demonstration - Updated with INR pricing
const mockSalesData = [
  {
    id: 'rzp_001',
    productId: 1,
    productName: 'Premium Headphones',
    customerEmail: 'john.doe@gmail.com',
    amount: 16599,
    date: '2025-01-15T10:30:00Z',
    status: 'completed',
    paymentId: 'pay_Nf5t2YZNqKQ7HA'
  },
  {
    id: 'rzp_002',
    productId: 2,
    productName: 'Smart Watch',
    customerEmail: 'sarah.smith@gmail.com',
    amount: 20749,
    date: '2025-01-14T15:45:00Z',
    status: 'completed',
    paymentId: 'pay_Nf5t2YZNqKQ7HB'
  },
  {
    id: 'rzp_003',
    productId: 3,
    productName: 'Wireless Earbuds',
    customerEmail: 'mike.wilson@gmail.com',
    amount: 10799,
    date: '2025-01-13T09:15:00Z',
    status: 'completed',
    paymentId: 'pay_Nf5t2YZNqKQ7HC'
  },
  {
    id: 'rzp_004',
    productId: 1,
    productName: 'Premium Headphones',
    customerEmail: 'priya.patel@gmail.com',
    amount: 16599,
    date: '2025-01-12T14:20:00Z',
    status: 'completed',
    paymentId: 'pay_Nf5t2YZNqKQ7HD'
  },
  {
    id: 'rzp_005',
    productId: 3,
    productName: 'Wireless Earbuds',
    customerEmail: 'alex.brown@gmail.com',
    amount: 10799,
    date: '2025-01-11T11:30:00Z',
    status: 'completed',
    paymentId: 'pay_Nf5t2YZNqKQ7HE'
  }
];

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Check if user is admin
    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }

    // In a real app, fetch sales data from your API
    const fetchSalesData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get real purchases from localStorage
        const realPurchases = JSON.parse(localStorage.getItem('purchases') || '[]');
        
        // Get admin notifications
        const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        setNotifications(adminNotifications);
        
        // Combine mock data with real purchases
        const allSales = [...mockSalesData, ...realPurchases];
        
        // Sort by date (newest first)
        allSales.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setSales(allSales);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load sales data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [user, navigate]);

  const handleSendEmail = () => {
    // In a real app, you would send this email through your backend
    console.log('Sending email with content:', emailContent);
    
    // Simulate API call
    setTimeout(() => {
      setEmailDialogOpen(false);
      setEmailContent('');
      setSnackbar({
        open: true,
        message: 'Email sent successfully!',
        severity: 'success'
      });
    }, 1000);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const calculateTotalSales = () => {
    return sales.reduce((total, sale) => total + sale.amount, 0).toLocaleString('en-IN');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const markNotificationAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
  };

  const unreadNotifications = notifications.filter(notif => !notif.read).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-3 items-center">
          <button className="relative px-4 py-2 border border-blue-500 text-blue-700 rounded hover:bg-blue-50 transition">
            Notifications
            {unreadNotifications > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {unreadNotifications}
              </span>
            )}
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={() => setEmailDialogOpen(true)}
          >
            Send Notification
          </button>
        </div>
      </div>

      {/* Real-time Notifications */}
      {notifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Recent Notifications <span className="text-xs text-gray-500">({unreadNotifications} unread)</span></h2>
          <div className="max-h-52 overflow-y-auto space-y-2">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`rounded p-3 flex justify-between items-center cursor-pointer border ${notification.read ? 'bg-gray-100' : 'bg-blue-50 border-blue-200'}`}
                onClick={() => markNotificationAsRead(notification.id)}
              >
                <span className="text-sm">{notification.message}</span>
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <span className="bg-blue-500 text-white text-xs rounded px-2 py-0.5">New</span>
                  )}
                  <span className="text-xs text-gray-500">{formatDate(notification.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded shadow p-6 text-center">
          <div className="text-gray-500 mb-1">Total Sales</div>
          <div className="text-2xl font-bold text-blue-600">[20b9]{calculateTotalSales()}</div>
        </div>
        <div className="bg-white rounded shadow p-6 text-center">
          <div className="text-gray-500 mb-1">Total Orders</div>
          <div className="text-2xl font-bold text-blue-600">{sales.length}</div>
        </div>
        <div className="bg-white rounded shadow p-6 text-center">
          <div className="text-gray-500 mb-1">Average Order Value</div>
          <div className="text-2xl font-bold text-blue-600">[20b9]{sales.length > 0 ? Math.round(sales.reduce((total, sale) => total + sale.amount, 0) / sales.length).toLocaleString('en-IN') : '0'}</div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Recent Orders</h2>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 text-left font-semibold">Order ID</th>
              <th className="py-2 px-3 text-left font-semibold">Product</th>
              <th className="py-2 px-3 text-left font-semibold">Customer Email</th>
              <th className="py-2 px-3 text-left font-semibold">Amount</th>
              <th className="py-2 px-3 text-left font-semibold">Payment ID</th>
              <th className="py-2 px-3 text-left font-semibold">Date</th>
              <th className="py-2 px-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-blue-50">
                <td className="py-2 px-3 font-mono">{sale.id}</td>
                <td className="py-2 px-3">{sale.productName}</td>
                <td className="py-2 px-3">{sale.customerEmail}</td>
                <td className="py-2 px-3">[20b9]{sale.amount.toLocaleString('en-IN')}</td>
                <td className="py-2 px-3 font-mono text-xs">{sale.paymentId}</td>
                <td className="py-2 px-3">{formatDate(sale.date)}</td>
                <td className="py-2 px-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize ${sale.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{sale.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Email Dialog */}
      {emailDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Send Notification Email</h3>
            <textarea
              className="w-full border rounded p-2 mb-4 min-h-[120px]"
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Enter your notification message here..."
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                onClick={() => setEmailDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                onClick={handleSendEmail}
                disabled={!emailContent.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar for notifications */}
      {snackbar.open && (
        <div className="fixed top-6 right-6 z-50">
          <div className={`rounded px-4 py-3 shadow-lg text-white ${snackbar.severity === 'success' ? 'bg-green-600' : 'bg-red-600'}`}> 
            <span>{snackbar.message}</span>
            <button className="ml-4 text-white/80 hover:text-white" onClick={handleCloseSnackbar}>&times;</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
