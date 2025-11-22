import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Clock, Package, Truck, Home, XCircle, ArrowLeft } from 'lucide-react';
import { ordersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const navigate = useNavigate();

  const statusIcons = {
    pending: Clock,
    confirmed: CheckCircle,
    preparing: Package,
    ready: CheckCircle,
    'out-for-delivery': Truck,
    delivered: Home,
    cancelled: XCircle
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    preparing: 'bg-orange-100 text-orange-800 border-orange-200',
    ready: 'bg-green-100 text-green-800 border-green-200',
    'out-for-delivery': 'bg-purple-100 text-purple-800 border-purple-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  // Show message function
  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };
  // fetchOrders function:
  const fetchOrders = async () => {
  try {
    console.log('🔄 Fetching orders from API...');
    const response = await ordersAPI.getAll();
    console.log('✅ Orders loaded:', response.data);
    setOrders(response.data);
    showMessage('Orders loaded successfully');
  } catch (err) {
    console.error('❌ Error fetching orders:', err);
    console.error('Error details:', err.response?.data);
    showMessage('Failed to load orders', 'error');
  } finally {
    setLoading(false);
  }
};


  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const response = await ordersAPI.updateStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order._id === orderId ? response.data : order
      ));
      showMessage(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating order:', err);
      showMessage('Failed to update order status', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusOptions = (currentStatus) => {
    const statusFlow = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['out-for-delivery', 'cancelled'],
      'out-for-delivery': ['delivered'],
      delivered: [],
      cancelled: []
    };
    return statusFlow[currentStatus] || [];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
          <span className="ml-4 text-gray-600">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Message Alert */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium min-w-64 max-w-md ${
          messageType === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-primary-600 hover:text-primary-700 mr-4"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600">Manage and update order statuses</p>
          </div>
        </div>
        <button
          onClick={fetchOrders}
          className="btn-secondary flex items-center"
          disabled={loading}
        >
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {orders.filter(o => ['preparing', 'ready', 'out-for-delivery'].includes(o.status)).length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === 'delivered').length}
          </div>
          <div className="text-sm text-gray-600">Delivered</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items & Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => {
                const StatusIcon = statusIcons[order.status] || Clock;
                const statusOptions = getStatusOptions(order.status);
                
                return (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(order.createdAt)}
                      </div>
                      {order.estimatedDelivery && (
                        <div className="text-xs text-gray-400">
                          Est: {formatDate(order.estimatedDelivery)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer.phone}
                      </div>
                      <div className="text-xs text-gray-400">
                        {order.customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.items?.length || 0} items
                      </div>
                      <div className="text-sm font-semibold text-primary-600">
                        ${order.totalAmount?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.items?.length || 0} items
                      </div>
                      <div className="text-xs text-gray-500 max-w-xs truncate">
                        {order.items?.map(item => item.name || 'Unnamed Item').join(', ')}
                      </div>
                      <div className="text-sm font-semibold text-primary-600">
                       ${order.totalAmount?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                        <StatusIcon size={12} className="mr-1" />
                        {order.status.replace(/-/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {statusOptions.length > 0 ? (
                          <select
                            value=""
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            disabled={updating === order._id}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                          >
                            <option value="">Update Status</option>
                            {statusOptions.map(status => (
                              <option key={status} value={status}>
                                Mark as {status.replace(/-/g, ' ')}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-400 text-sm">Completed</span>
                        )}
                        {updating === order._id && (
                          <LoadingSpinner size="small" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No orders found</p>
            <p className="text-gray-400 text-sm mt-2">Orders will appear here once customers place them</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => navigate('/menu')}
          className="btn-primary text-sm"
        >
          View Menu
        </button>
        <button
          onClick={() => navigate('/track-order')}
          className="btn-secondary text-sm"
        >
          Track Orders
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;