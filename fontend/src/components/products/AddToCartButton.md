// 'use client';

// import React, { useState } from 'react';
// import { CustomerOnly } from '@/components/guards';
// import { useAuth } from '@/contexts/AuthContext';

// interface AddToCartButtonProps {
//   productId: number;
//   productName: string;
// }

// export function AddToCartButton({ productId, productName }: AddToCartButtonProps) {
//   const { session } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   const handleAddToCart = async () => {
//     setLoading(true);
//     setMessage('');
    
//     try {
//       const response = await fetch('http://localhost:3001/cart', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${session?.access_token}`,
//         },
//         body: JSON.stringify({
//           productId,
//           quantity: 1,
//         }),
//       });

//       const data = await response.json();
      
//       if (response.ok) {
//         setMessage(`✅ Đã thêm "${productName}" vào giỏ hàng!`);
//       } else {
//         setMessage(`❌ Lỗi: ${data.message}`);
//       }
//     } catch (error) {
//       setMessage('❌ Có lỗi xảy ra');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <CustomerOnly
//         fallback={
//           <button
//             disabled
//             className="w-full bg-gray-300 text-gray-500 py-2 rounded cursor-not-allowed"
//           >
//             Đăng nhập để mua hàng
//           </button>
//         }
//       >
//         <button
//           onClick={handleAddToCart}
//           disabled={loading}
//           className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded transition disabled:opacity-50"
//         >
//           {loading ? 'Đang thêm...' : '🛒 Thêm vào giỏ hàng'}
//         </button>
//       </CustomerOnly>
      
//       {message && (
//         <p className="mt-2 text-sm text-center">{message}</p>
//       )}
//     </div>
//   );
// }

// import { useAuth } from '@/contexts/AuthContext';
// import { addToShoppingCart } from '@/lib/api-client';
// import { useRouter } from 'next/navigation';
// import { useState } from 'react';

// // Trong component:
// const { user, isAuthenticated } = useAuth();
// const router = useRouter();
// const [addingToCart, setAddingToCart] = useState(false);

// const handleAddToCart = async (productId: number) => {
//   // 1️⃣ Kiểm tra đăng nhập
//   if (!isAuthenticated || !user) {
//     alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
//     router.push('/login');
//     return;
//   }

//   setAddingToCart(true);

//   try {
//     // 2️⃣ Gọi API thêm vào giỏ
//     const result = await addToShoppingCart({
//       productId: productId,
//       quantity: 1,
//     });

//     if (result.success) {
//       alert('✅ Đã thêm vào giỏ hàng!');
//       // Optional: Update cart count in header
//       window.dispatchEvent(new Event('cartUpdated'));
//     } else {
//       alert(`❌ ${result.message}`);
//     }
//   } catch (error) {
//     console.error('Add to cart error:', error);
//     alert('Có lỗi xảy ra, vui lòng thử lại');
//   } finally {
//     setAddingToCart(false);
//   }
// };

// 'use client';

// import { useAuth } from '@/contexts/AuthContext';
// import { addToShoppingCart } from '@/lib/api-client';
// import { useRouter } from 'next/navigation';
// import { useState } from 'react';

// export function AddToCartButton({ productId }: { productId: number }) {
//   const { user, isAuthenticated } = useAuth();
//   const router = useRouter();
//   const [addingToCart, setAddingToCart] = useState(false);

//   const handleAddToCart = async (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!isAuthenticated || !user) {
//       alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
//       router.push('/login');
//       return;
//     }

//     setAddingToCart(true);
//     try {
//       await addToShoppingCart({
//         // customer_id: user.id,
//         // customer_id: '10',
//         product_id: productId,
//         quantity: 1,
//       });
//     } finally {
//       setAddingToCart(false);
//     }
//   };

//   return (
//     <button
//       onClick={handleAddToCart}
//       disabled={addingToCart}
//       className="bg-pink-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
//     >
//       {addingToCart ? 'Đang thêm...' : 'Thêm Vào Giỏ Hàng'}
//     </button>
//   );
// }
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { addToShoppingCart } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AddToCartButtonProps {
  productId: number;
}

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // 🚫 Chặn Link bọc ngoài
    e.preventDefault();
    e.stopPropagation();

    // 1️⃣ Chưa đăng nhập → login
    if (!isAuthenticated || !user) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
      router.push('/login');
      return;
    }

    // 2️⃣ Không có user.id → lỗi logic
    if (!user.id) {
      alert('Không tìm thấy thông tin người dùng');
      return;
    }

    setLoading(true);
    try {
      // 3️⃣ Gọi backend
      await addToShoppingCart({
        // customer_id: user.id,
        productId,
        quantity: 1,
      });

      // 4️⃣ Đồng bộ giỏ hàng (header, cart badge…)
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Không thể thêm vào giỏ hàng, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
    >
      {loading ? 'Đang thêm...' : 'Thêm Vào Giỏ Hàng'}
    </button>
  );
}

