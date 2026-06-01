import { useEffect, useState } from 'react';
import { OrderService, ProductService, CustomerService, type Order, type Product, type Customer } from '../services/api';
import { Plus } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState<{product_id: number, quantity: number, name: string, price: number}[]>([]);

  const loadData = async () => {
    try {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        OrderService.getAll(),
        ProductService.getAll(),
        CustomerService.getAll()
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error("Error loading data", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) return;
    
    const product = products.find(p => p.id === parseInt(selectedProduct));
    if (!product) return;

    if (quantity > product.quantity) {
      alert(`Only ${product.quantity} items left in stock for ${product.name}`);
      return;
    }

    setOrderItems([...orderItems, {
      product_id: product.id,
      quantity,
      name: product.name,
      price: product.price
    }]);
    
    setSelectedProduct('');
    setQuantity(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }
    if (orderItems.length === 0) {
      alert("Please add at least one item to the order");
      return;
    }

    try {
      const orderData = {
        customer_id: parseInt(selectedCustomer),
        items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      };
      
      await OrderService.create(orderData);
      setShowForm(false);
      setOrderItems([]);
      setSelectedCustomer('');
      loadData();
    } catch (error: any) {
      console.error("Error creating order", error);
      alert(error.response?.data?.detail || "Failed to create order");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to cancel/delete this order?")) {
      try {
        await OrderService.delete(id);
        loadData();
      } catch (error) {
        console.error("Error deleting order", error);
      }
    }
  };

  return (
    <div>
      <div className="flex-between mb-6">
        <h1>Orders</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} /> Create Order
        </button>
      </div>

      {showForm && (
        <div className="card mb-8">
          <h2>Create New Order</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-6">
              <label className="form-label">Customer</label>
              <select 
                className="form-input" 
                value={selectedCustomer} 
                onChange={e => setSelectedCustomer(e.target.value)}
                required
              >
                <option value="">Select a customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div className="card mb-6" style={{ background: '#F9FAFB' }}>
              <h3 className="mb-4">Add Items</h3>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group mb-0" style={{ flex: '1 1 250px' }}>
                  <label className="form-label">Product</label>
                  <select 
                    className="form-input" 
                    value={selectedProduct} 
                    onChange={e => setSelectedProduct(e.target.value)}
                  >
                    <option value="">Select a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ₹{p.price} (Stock: {p.quantity})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group mb-0" style={{ flex: '0 1 150px' }}>
                  <label className="form-label">Quantity</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1"
                    value={quantity} 
                    onChange={e => setQuantity(parseInt(e.target.value))} 
                  />
                </div>
                <button type="button" className="btn btn-secondary mb-0" onClick={handleAddItem} style={{ height: 'fit-content', background: 'var(--secondary)', color: 'white' }}>
                  Add Item
                </button>
              </div>

              {orderItems.length > 0 && (
                <div className="mt-4">
                  <table className="mb-0" style={{ background: 'white' }}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.name}</td>
                          <td>₹{item.price.toFixed(2)}</td>
                          <td>{item.quantity}</td>
                          <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                          <td>
                            <button type="button" className="btn" style={{ color: 'var(--danger)', padding: '0.25rem' }} onClick={() => setOrderItems(orderItems.filter((_, i) => i !== idx))}>
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <button type="submit" className="btn btn-primary w-full" disabled={orderItems.length === 0}>
              Submit Order
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customer.full_name}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
                <td><strong style={{ color: 'var(--primary)' }}>₹{order.total_amount.toFixed(2)}</strong></td>
                <td>
                  <button className="btn" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(order.id)}>
                    Cancel Order
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
