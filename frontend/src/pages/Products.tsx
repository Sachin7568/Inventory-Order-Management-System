import { useEffect, useState } from 'react';
import { ProductService, type Product } from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku: '', price: 0, quantity: 0 });

  const loadProducts = async () => {
    try {
      const res = await ProductService.getAll();
      setProducts(res.data);
    } catch (error) {
      console.error("Error loading products", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ProductService.create(formData);
      setShowForm(false);
      setFormData({ name: '', sku: '', price: 0, quantity: 0 });
      loadProducts();
    } catch (error) {
      console.error("Error creating product", error);
      alert("Failed to create product. SKU might be duplicate.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await ProductService.delete(id);
        loadProducts();
      } catch (error) {
        console.error("Error deleting product", error);
      }
    }
  };

  return (
    <div>
      <div className="flex-between mb-6">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="card mb-8">
          <h2>Add New Product</h2>
          <form onSubmit={handleSubmit}>
            <div className="dashboard-grid">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">SKU</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={formData.sku} 
                  onChange={e => setFormData({...formData, sku: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="form-input" 
                  required 
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required 
                  value={formData.quantity} 
                  onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} 
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Save Product</button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>₹{product.price.toFixed(2)}</td>
                <td>{product.quantity}</td>
                <td>
                  {product.quantity > 10 ? (
                    <span className="badge badge-success">In Stock</span>
                  ) : product.quantity > 0 ? (
                    <span className="badge badge-warning">Low Stock</span>
                  ) : (
                    <span className="badge badge-danger">Out of Stock</span>
                  )}
                </td>
                <td>
                  <button className="btn" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(product.id)}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
