import { useEffect, useState } from 'react';
import { ProductService, CustomerService, OrderService } from '../services/api';
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    lowStock: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, customers, orders] = await Promise.all([
          ProductService.getAll(),
          CustomerService.getAll(),
          OrderService.getAll()
        ]);
        
        const lowStockProducts = products.data.filter(p => p.quantity < 10).length;

        setStats({
          totalProducts: products.data.length,
          totalCustomers: customers.data.length,
          totalOrders: orders.data.length,
          lowStock: lowStockProducts
        });
      } catch (error) {
        console.error("Error fetching stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="card stat-card">
          <div className="flex-between">
            <span className="stat-title">Total Products</span>
            <Package size={24} color="var(--primary)" />
          </div>
          <span className="stat-value">{stats.totalProducts}</span>
        </div>
        
        <div className="card stat-card">
          <div className="flex-between">
            <span className="stat-title">Total Customers</span>
            <Users size={24} color="var(--secondary)" />
          </div>
          <span className="stat-value">{stats.totalCustomers}</span>
        </div>
        
        <div className="card stat-card">
          <div className="flex-between">
            <span className="stat-title">Total Orders</span>
            <ShoppingCart size={24} color="#3B82F6" />
          </div>
          <span className="stat-value">{stats.totalOrders}</span>
        </div>
        
        <div className="card stat-card">
          <div className="flex-between">
            <span className="stat-title">Low Stock Alerts</span>
            <AlertTriangle size={24} color="var(--danger)" />
          </div>
          <span className="stat-value" style={{ color: stats.lowStock > 0 ? 'var(--danger)' : 'inherit' }}>
            {stats.lowStock}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
