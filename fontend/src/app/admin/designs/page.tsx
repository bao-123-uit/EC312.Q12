'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Design {
  design_id: string;
  phone_model: string;
  status: string;
  preview_image_url: string | null;
  high_res_image_url: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  admin_notes: string | null;
  created_at: string;
  submitted_at: string | null;
  design_data: any;
  users?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Bản nháp', color: 'bg-gray-100 text-gray-800' },
  submitted: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800' },
  printed: { label: 'Đã in', color: 'bg-purple-100 text-purple-800' },
};

export default function AdminDesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Load designs
  const loadDesigns = async () => {
    try {
      const url = filterStatus 
        ? `http://localhost:3001/designs/admin/all?status=${filterStatus}`
        : 'http://localhost:3001/designs/admin/all';
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDesigns(data.data || []);
      }
    } catch (error) {
      console.error('Load designs error:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDesigns();
  }, [filterStatus]);

  // Duyệt thiết kế
  const approveDesign = async (designId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/designs/admin/${designId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes }),
      });

      if (res.ok) {
        alert('✅ Đã duyệt thiết kế thành công!');
        setSelectedDesign(null);
        setAdminNotes('');
        loadDesigns();
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert('Có lỗi xảy ra!');
    }
    setActionLoading(false);
  };

  // Từ chối thiết kế
  const rejectDesign = async (designId: string) => {
    if (!adminNotes.trim()) {
      alert('Vui lòng nhập lý do từ chối!');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/designs/admin/${designId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes }),
      });

      if (res.ok) {
        alert('❌ Đã từ chối thiết kế!');
        setSelectedDesign(null);
        setAdminNotes('');
        loadDesigns();
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Reject error:', error);
      alert('Có lỗi xảy ra!');
    }
    setActionLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-pink-500">
              ← Quay lại
            </Link>
            <h1 className="text-xl font-bold text-gray-800">🎨 Quản Lý Thiết Kế Ốp Lưng</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Tổng: {designs.length} thiết kế
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                !filterStatus ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            {Object.entries(statusLabels).map(([status, { label }]) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === status ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Designs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl">⏳</div>
            <p className="text-gray-500 mt-2">Đang tải...</p>
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500">Chưa có thiết kế nào</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <div
                key={design.design_id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                {/* Preview Image */}
                <div className="aspect-[3/4] bg-gray-100 relative">
                  {design.preview_image_url ? (
                    <img
                      src={`http://localhost:3001${design.preview_image_url}`}
                      alt="Design preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.error('Image load error:', design.preview_image_url);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-6xl">📱</span>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusLabels[design.status]?.color}`}>
                      {statusLabels[design.status]?.label}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                     {design.phone_model}
                  </h3>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      👤 {design.guest_name || design.users?.full_name || 'Ẩn danh'}
                    </p>
                    <p>
                      📞 {design.guest_phone || design.users?.phone || 'N/A'}
                    </p>
                    <p>
                      📧 {design.guest_email || design.users?.email || 'N/A'}
                    </p>
                    <p className="text-gray-400">
                      🕐 {design.submitted_at ? formatDate(design.submitted_at) : formatDate(design.created_at)}
                    </p>
                  </div>

                  {design.admin_notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                      <span className="font-medium">Ghi chú:</span> {design.admin_notes}
                    </div>
                  )}

                  {/* Actions */}
                  {design.status === 'submitted' && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedDesign(design);
                          setAdminNotes('');
                        }}
                        className="flex-1 bg-pink-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-pink-600"
                      >
                        Xem & Duyệt
                      </button>
                    </div>
                  )}

                  {design.status !== 'submitted' && (
                    <button
                      onClick={() => setSelectedDesign(design)}
                      className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
                    >
                      Xem chi tiết
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal xem chi tiết & duyệt */}
      {selectedDesign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Chi tiết thiết kế</h2>
              <button
                onClick={() => setSelectedDesign(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">
              {/* Preview */}
              <div>
                <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden relative">
                  {selectedDesign.preview_image_url ? (
                    <img
                      src={`http://localhost:3001${selectedDesign.preview_image_url}`}
                      alt="Design preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-6xl">📱</span>
                    </div>
                  )}
                </div>

                {selectedDesign.high_res_image_url && (
                  <a
                    href={`http://localhost:3001${selectedDesign.high_res_image_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block text-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                  >
                     Tải ảnh HD 
                  </a>
                )}
              </div>

              {/* Info & Actions */}
              <div>
                <div className="space-y-4">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusLabels[selectedDesign.status]?.color}`}>
                      {statusLabels[selectedDesign.status]?.label}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold">📱 Thông tin</h3>
                    <p><span className="text-gray-500">Model:</span> {selectedDesign.phone_model}</p>
                    <p><span className="text-gray-500">Ngày gửi:</span> {selectedDesign.submitted_at ? formatDate(selectedDesign.submitted_at) : 'Chưa gửi'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold">👤 Khách hàng</h3>
                    <p><span className="text-gray-500">Tên:</span> {selectedDesign.guest_name || selectedDesign.users?.full_name || 'N/A'}</p>
                    <p><span className="text-gray-500">SĐT:</span> {selectedDesign.guest_phone || selectedDesign.users?.phone || 'N/A'}</p>
                    <p><span className="text-gray-500">Email:</span> {selectedDesign.guest_email || selectedDesign.users?.email || 'N/A'}</p>
                  </div>

                  {selectedDesign.status === 'submitted' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ghi chú của Admin
                        </label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          rows={3}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="Nhập ghi chú (bắt buộc khi từ chối)..."
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => approveDesign(selectedDesign.design_id)}
                          disabled={actionLoading}
                          className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
                        >
                          ✅ Duyệt
                        </button>
                        <button
                          onClick={() => rejectDesign(selectedDesign.design_id)}
                          disabled={actionLoading}
                          className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50"
                        >
                          ❌ Từ chối
                        </button>
                      </div>
                    </>
                  )}

                  {selectedDesign.admin_notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-800">📝 Ghi chú Admin</h3>
                      <p className="text-yellow-700 mt-1">{selectedDesign.admin_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
