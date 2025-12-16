// File: fontend/src/components/home/CategoryGrid.tsx

'use client';

import Link from 'next/link';
import { Category } from '@/types';

interface CategoryGridProps {
  categories: Category[];
  title?: string;
}

const GRADIENT_COLORS = [
  'from-pink-500 to-rose-500',
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-indigo-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-red-500 to-pink-500',
  'from-violet-500 to-purple-500',
];

export default function CategoryGrid({
  categories,
  title = 'Các sản phẩm chính',
}: CategoryGridProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {categories.map((category, index) => (
          <Link
            key={category.name}
            href={`/shop?category=${encodeURIComponent(category.name)}`}
            className="group cursor-pointer"
          >
            <div
              className={`bg-gradient-to-br ${GRADIENT_COLORS[index % GRADIENT_COLORS.length]} p-4 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 text-center text-white h-36 flex flex-col items-center justify-center`}
            >
              <span className="text-3xl mb-2">{category.icon}</span>
              <h3 className="font-semibold text-xs mb-1 line-clamp-2 leading-tight px-1">
                {category.name}
              </h3>
              <p className="text-xs opacity-80">{category.count} SP</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}