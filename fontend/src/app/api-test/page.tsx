'use client';

import { useEffect, useState } from 'react';
import {
  fetchUsers,
  fetchProducts,
  fetchOrders,
  fetchCategories,
} from '@/lib/api-client';

export default function ApiTest() {
  const [customers, setCustomers] = useState<any>(null);
  const [products, setProducts] = useState<any>(null);
  const [orders, setOrders] = useState<any>(null);
  const [categories, setCategories] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gọi API');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts(5);
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gọi API');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrders(10);
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gọi API');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gọi API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test API Backend</h1>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Lỗi:</strong> {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            Đang tải...
          </div>
        )}

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleFetchUsers}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            Lấy Khách Hàng
          </button>
          <button
            onClick={handleFetchProducts}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            Lấy Sản Phẩm
          </button>
          <button
            onClick={handleFetchOrders}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            Lấy Đơn Hàng
          </button>
          <button
            onClick={handleFetchCategories}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            Lấy Danh Mục
          </button>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {customers && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Khách Hàng</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(customers, null, 2)}
              </pre>
            </div>
          )}

          {products && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Sản Phẩm</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(products, null, 2)}
              </pre>
            </div>
          )}

          {orders && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Đơn Hàng</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(orders, null, 2)}
              </pre>
            </div>
          )}

          {categories && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Danh Mục</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(categories, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
