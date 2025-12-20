'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Pencil, Trash2, Save, X, Upload, 
  Smartphone, Check, AlertCircle, Image as ImageIcon
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PhoneTemplate {
  template_id: number;
  phone_model: string;
  brand: string;
  template_image_url: string | null;
  print_width_mm: number;
  print_height_mm: number;
  canvas_width: number;
  canvas_height: number;
  is_active: boolean;
  created_at?: string;
}

const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Realme', 'OnePlus', 'Google', 'Huawei', 'Other'];

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<PhoneTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PhoneTemplate | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    phone_model: '',
    brand: 'Apple',
    template_image_url: '',
    print_width_mm: 70,
    print_height_mm: 150,
    canvas_width: 700,
    canvas_height: 1500,
    is_active: true,
  });

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/designs/templates`);
      const result = await response.json();
      
      let data = result;
      if (result?.data) {
        data = result.data;
      }
      
      if (Array.isArray(data)) {
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      showMessage('error', 'Không thể tải danh sách templates');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const openAddModal = () => {
    setEditingTemplate(null);
    setFormData({
      phone_model: '',
      brand: 'Apple',
      template_image_url: '',
      print_width_mm: 70,
      print_height_mm: 150,
      canvas_width: 700,
      canvas_height: 1500,
      is_active: true,
    });
    setPreviewImage(null);
    setShowModal(true);
  };

  const openEditModal = (template: PhoneTemplate) => {
    setEditingTemplate(template);
    setFormData({
      phone_model: template.phone_model,
      brand: template.brand,
      template_image_url: template.template_image_url || '',
      print_width_mm: template.print_width_mm,
      print_height_mm: template.print_height_mm,
      canvas_width: template.canvas_width,
      canvas_height: template.canvas_height,
      is_active: template.is_active,
    });
    setPreviewImage(template.template_image_url);
    setShowModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreviewImage(base64);
      setFormData(prev => ({ ...prev, template_image_url: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.phone_model.trim()) {
      showMessage('error', 'Vui lòng nhập tên model điện thoại');
      return;
    }

    setSaving(true);
    try {
      const url = editingTemplate 
        ? `${API_URL}/designs/templates/${editingTemplate.template_id}`
        : `${API_URL}/designs/templates`;
      
      const method = editingTemplate ? 'PUT' : 'POST';
      
      // Chuẩn bị data để gửi
      const dataToSend = {
        ...formData,
        // Nếu template_image_url là URL cũ (không phải base64 mới), giữ nguyên
        template_image_url: formData.template_image_url || (editingTemplate?.template_image_url || ''),
      };
      
      console.log('Sending data:', dataToSend);
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save template');
      }

      showMessage('success', editingTemplate ? 'Đã cập nhật template!' : 'Đã thêm template mới!');
      setShowModal(false);
      loadTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      showMessage('error', error.message || 'Không thể lưu template. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (templateId: number) => {
    if (!confirm('Bạn có chắc muốn xóa template này?')) return;

    try {
      const response = await fetch(`${API_URL}/designs/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      showMessage('success', 'Đã xóa template!');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      showMessage('error', 'Không thể xóa template');
    }
  };

  const toggleActive = async (template: PhoneTemplate) => {
    try {
      const response = await fetch(`${API_URL}/designs/templates/${template.template_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...template, is_active: !template.is_active }),
      });

      if (!response.ok) {
        throw new Error('Failed to update template');
      }

      loadTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      showMessage('error', 'Không thể cập nhật trạng thái');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-pink-600 transition">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Quản Lý Phone Templates</h1>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            <Plus className="w-5 h-5" />
            Thêm Template
          </button>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có template nào</h3>
            <p className="text-gray-500 mb-6">Bắt đầu bằng cách thêm template đầu tiên</p>
            <button
              onClick={openAddModal}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
            >
              Thêm Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map(template => (
              <div 
                key={template.template_id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 transition ${
                  template.is_active ? 'border-transparent' : 'border-red-200 opacity-60'
                }`}
              >
                {/* Image */}
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {template.template_image_url ? (
                    <img 
                      src={template.template_image_url}
                      alt={template.phone_model}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Smartphone className="w-20 h-20 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Status badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                    template.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {template.is_active ? 'Đang hiển thị' : 'Đã ẩn'}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-pink-100 text-pink-600 rounded-full font-medium">
                      {template.brand}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900">{template.phone_model}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {template.print_width_mm} × {template.print_height_mm} mm
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Canvas: {template.canvas_width} × {template.canvas_height} px
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => toggleActive(template)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                        template.is_active 
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {template.is_active ? 'Ẩn' : 'Hiện'}
                    </button>
                    <button
                      onClick={() => openEditModal(template)}
                      className="flex-1 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200 transition"
                    >
                      <Pencil className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.template_id)}
                      className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTemplate ? 'Sửa Template' : 'Thêm Template Mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh Template</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition"
                >
                  {previewImage ? (
                    <div className="relative">
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                      <p className="text-sm text-gray-500 mt-2">Click để thay đổi ảnh</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click để upload ảnh</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG tối đa 5MB</p>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Hoặc nhập URL ảnh:
                </p>
                <input
                  type="text"
                  value={formData.template_image_url?.startsWith('data:') ? '' : formData.template_image_url}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, template_image_url: e.target.value }));
                    if (e.target.value && !e.target.value.startsWith('data:')) {
                      setPreviewImage(e.target.value);
                    }
                  }}
                  placeholder="/templates/iphone15.jpg hoặc https://..."
                  className="mt-2 w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              {/* Phone Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone_model}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_model: e.target.value }))}
                  placeholder="VD: iPhone 15 Pro Max"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hãng</label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {BRANDS.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chiều rộng in (mm)</label>
                  <input
                    type="number"
                    value={formData.print_width_mm}
                    onChange={(e) => setFormData(prev => ({ ...prev, print_width_mm: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chiều cao in (mm)</label>
                  <input
                    type="number"
                    value={formData.print_height_mm}
                    onChange={(e) => setFormData(prev => ({ ...prev, print_height_mm: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Canvas Width (px)</label>
                  <input
                    type="number"
                    value={formData.canvas_width}
                    onChange={(e) => setFormData(prev => ({ ...prev, canvas_width: parseInt(e.target.value) || 700 }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Canvas Height (px)</label>
                  <input
                    type="number"
                    value={formData.canvas_height}
                    onChange={(e) => setFormData(prev => ({ ...prev, canvas_height: parseInt(e.target.value) || 1500 }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-5 h-5 text-pink-600 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Hiển thị trên trang thiết kế
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
