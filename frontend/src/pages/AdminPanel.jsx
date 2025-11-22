// TEMPORARY SIMPLE VERSION - src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';

const AdminPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('🔄 Fetching orders...');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      console.log('API URL:', API_BASE_URL);
      
      const response = await ordersAPI.getAll();
      console.log('✅ Orders response:', response.data);
      setOrders(response.data);
    } catch (err) {
      console.error('❌ Error:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading admin panel...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel - Simple Test</h1>
      <p>Total Orders: {orders.length}</p>
      {orders.map(order => (
        <div key={order._id} className="border p-4 mb-2">
          <p><strong>Order #:</strong> {order.orderNumber}</p>
          <p><strong>Customer:</strong> {order.customer?.name}</p>
          <p><strong>Status:</strong> {order.status}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;