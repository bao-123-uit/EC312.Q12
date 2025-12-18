'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchShoppingCart,
  createOrder,
  clearShoppingCart,
} from '@/lib/api-client';
import {
  ArrowLeft,
  CreditCard,
  Truck,
  MapPin,
  Phone,
  User,
  FileText,
  ShoppingBag,
  Shield,
  AlertCircle,
  Check,
} from 'lucide-react';

interface CartItem {
  cart_id: number;
  product_id: number;
  variant_id?: number;
  quantity: number;
  product_name: string;
  price: number;
  original_price?: number;
  image_url?: string;
}

interface ShippingAddress {
  fullname: string;
  phone: string;
  addressline1: string;
  ward: string;
  district: string;
  city: string;
}

export default function CheckoutPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // States
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingFee, setShippingFee] = useState(30000);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Shipping address form
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullname: '',
    phone: '',
    addressline1: '',
    ward: '',
    district: '',
    city: '',
  });

  // Load cart data
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/login?redirect=checkout');
      return;
    }

    const loadCart = async () => {
      setLoading(true);
      try {
        const res = await fetchShoppingCart();

        if (!res.success || !res.data || res.data.length === 0) {
          alert('Giỏ hàng trống!');
          router.push('/shopping-cart');
          return;
        }

        setCartItems(res.data);
        // Calculate subtotal
        const total = res.data.reduce((sum: number, item: CartItem) => {
          return sum + item.price * item.quantity;
        }, 0);

        setSubtotal(total);

        // Free shipping for orders >= 500k
        setShippingFee(total >= 500000 ? 0 : 30000);

        // Pre-fill user info
        if (user) {
          setShippingAddress((prev) => ({
            ...prev,
            fullname: user.fullname || user.firstname || '',
            phone: user.phone || '',
          }));
        }
      } catch (error) {
        console.error('Load cart error:', error);
        alert('Lỗi khi tải giỏ hàng');
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [authLoading, isAuthenticated, router, user]);

  // Handle input changes
  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form - CẢI THIỆN
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!shippingAddress.fullname.trim()) {
      errors.fullname = 'Vui lòng nhập họ tên';
      isValid = false;
    }

    if (!shippingAddress.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
      isValid = false;
    } else if (!/^[0-9]{10,11}$/.test(shippingAddress.phone.trim())) {
      errors.phone = 'Số điện thoại không hợp lệ (10-11 chữ số)';
      isValid = false;
    }

    if (!shippingAddress.addressline1.trim()) {
      errors.addressline1 = 'Vui lòng nhập địa chỉ chi tiết';
      isValid = false;
    }

    if (!shippingAddress.district.trim()) {
      errors.district = 'Vui lòng nhập quận/huyện';
      isValid = false;
    }

    if (!shippingAddress.city.trim()) {
      errors.city = 'Vui lòng nhập tỉnh/thành phố';
      isValid = false;
    }

    setValidationErrors(errors);

    if (!isValid) {
      // Scroll to first error
      const firstErrorField = document.querySelector('[data-error]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return isValid;
  };

  // Submit order - CHÍNH
  const handleCheckout = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const orderData = {
        // ✅ items - ĐÚNG KEY BACKEND
        items: cartItems.map(item => ({
          product_id: item.product_id,//
          variant_id: item.variant_id,//
          product_name: item.product_name || item.products?.product_name || `Product #${item.product_id}`,
          quantity: item.quantity,//
          unit_price: item.price || item.products?.sale_price || item.products?.price || 0,
          discount_amount: 0,//
        })),

        // ✅ shipping_address - ĐÚNG STRUCT
        shipping_address: {
          full_name: shippingAddress.fullname,//
          phone: shippingAddress.phone,//
          address_line1: shippingAddress.addressline1,//
          ward: shippingAddress.ward ||  undefined,///
          district: shippingAddress.district,//
          city: shippingAddress.city,//
        },

        // ✅ order financials (FULL TABLE)
        subtotal:subtotal,
        // discount_amount: discount,
        // shipping_fee: shippingFee,
        // tax_amount: 0,
        total_amount: subtotal - discount + shippingFee,

        // ✅ meta
        payment_method: paymentMethod,
        coupon_code: couponCode ||  undefined,
        customer_note: customerNote ||  undefined,
      };

      const result = await createOrder(orderData);

      if (!result.success) throw new Error(result.message);

      const orderNumber = result.data.order_number;
      const totalAmount = result.data.total_amount;

      await clearShoppingCart();

      router.push(`/order/${orderNumber}?total=${totalAmount}`);
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };


  // Calculate total
  const totalAmount = subtotal - discount + shippingFee;

  // Format price
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN');
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/shopping-cart"
            className="flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại giỏ hàng
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-pink-600" />
                </div>
                <h2 className="text-xl font-semibold">Địa chỉ giao hàng</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Fullname */}
                <div data-error={validationErrors.fullname ? 'true' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    value={shippingAddress.fullname}
                    onChange={handleAddressChange}
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                      validationErrors.fullname
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="Nguyễn Văn A"
                  />
                  {validationErrors.fullname && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.fullname}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div data-error={validationErrors.phone ? 'true' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleAddressChange}
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                      validationErrors.phone
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="0901234567"
                  />
                  {validationErrors.phone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.phone}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div
                  className="md:col-span-2"
                  data-error={validationErrors.addressline1 ? 'true' : ''}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ chi tiết
                  </label>
                  <input
                    type="text"
                    name="addressline1"
                    value={shippingAddress.addressline1}
                    onChange={handleAddressChange}
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                      validationErrors.addressline1
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="Số nhà, tên đường..."
                  />
                  {validationErrors.addressline1 && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.addressline1}
                    </p>
                  )}
                </div>

                {/* Ward */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phường/Xã (tùy chọn)
                  </label>
                  <input
                    type="text"
                    name="ward"
                    value={shippingAddress.ward}
                    onChange={handleAddressChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Phường 1"
                  />
                </div>

                {/* District */}
                <div data-error={validationErrors.district ? 'true' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quận/Huyện
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={shippingAddress.district}
                    onChange={handleAddressChange}
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                      validationErrors.district
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="Quận 1"
                  />
                  {validationErrors.district && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.district}
                    </p>
                  )}
                </div>

                {/* City */}
                <div data-error={validationErrors.city ? 'true' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                      validationErrors.city
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="TP. Hồ Chí Minh"
                  />
                  {validationErrors.city && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.city}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold">Phương thức thanh toán</h2>
              </div>

              <div className="space-y-3">
                {/* COD */}
                <label className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition hover:bg-gray-50"
                  style={{
                    borderColor: paymentMethod === 'cod' ? '#ec4899' : '#d1d5db',
                    backgroundColor: paymentMethod === 'cod' ? '#fce7f3' : 'white',
                  }}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-pink-600"
                  />
                  <Truck className="w-6 h-6 text-gray-600" />
                  <div>
                    <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-sm text-gray-500">
                      Thanh toán bằng tiền mặt khi nhận hàng
                    </p>
                  </div>
                </label>

                {/* MoMo */}
                <label className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition hover:bg-gray-50"
                  style={{
                    borderColor: paymentMethod === 'momo' ? '#ec4899' : '#d1d5db',
                    backgroundColor: paymentMethod === 'momo' ? '#fce7f3' : 'white',
                  }}>
                  <input
                    type="radio"
                    name="payment"
                    value="momo"
                    checked={paymentMethod === 'momo'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-pink-600"
                  />
                  <div className="w-6 h-6 bg-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                    M
                  </div>
                  <div>
                    <p className="font-medium">Ví MoMo</p>
                    <p className="text-sm text-gray-500">
                      Thanh toán qua ví điện tử MoMo
                    </p>
                  </div>
                </label>

                {/* Bank Transfer */}
                <label className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition hover:bg-gray-50"
                  style={{
                    borderColor: paymentMethod === 'bank' ? '#ec4899' : '#d1d5db',
                    backgroundColor: paymentMethod === 'bank' ? '#fce7f3' : 'white',
                  }}>
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-pink-600"
                  />
                  <CreditCard className="w-6 h-6 text-gray-600" />
                  <div>
                    <p className="font-medium">Chuyển khoản ngân hàng</p>
                    <p className="text-sm text-gray-500">
                      Chuyển khoản qua tài khoản ngân hàng
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Customer Note */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <h2 className="text-xl font-semibold">Ghi chú đơn hàng</h2>
              </div>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Ghi chú thêm về đơn hàng tùy chọn..."
              ></textarea>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-6">Đơn hàng của bạn</h2>

              {/* Cart Items */}
              <div className="space-y-4 max-h-64 overflow-y-auto mb-6 pb-4 border-b">
                {cartItems.map((item) => (
                  <div key={item.cartid} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.imageurl || '/placeholder.png'}
                        alt={item.productname}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">
                        {item.productname}
                      </p>
                      <p className="text-gray-500 text-sm">
                        x{item.quantity}
                      </p>
                      <p className="font-semibold text-pink-600 whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subtotal)}₫</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(discount)}₫</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span>
                    {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee) + '₫'}
                  </span>
                </div>

                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-pink-600">{formatPrice(totalAmount)}₫</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleCheckout}
                disabled={submitting || cartItems.length === 0}
                className="w-full mt-6 bg-gradient-to-r from-pink-600 to-pink-500 text-white py-3 rounded-xl font-bold hover:from-pink-700 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Xác nhận đơn hàng
                  </>
                )}
              </button>

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-sm">
                <Shield className="w-4 h-4" />
                <span>Thanh toán an toàn</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
