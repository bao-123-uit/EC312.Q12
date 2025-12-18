'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, Eye, Clock, ArrowLeft, Share2, Heart, Facebook, Twitter, Copy, Check, ChevronRight, Tag } from 'lucide-react';

interface BlogPost {
  post_id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  author_id: number;
  category: string;
  tags: string;
  view_count: number;
  is_published: boolean;
  published_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/blog-posts/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else {
        setPost(getSamplePost());
      }
    } catch (error) {
      setPost(getSamplePost());
    } finally {
      setLoading(false);
    }
  };

  const getSamplePost = (): BlogPost => ({
    post_id: 1,
    title: 'Top 10 ốp lưng iPhone 15 Pro Max đẹp nhất 2024',
    slug: slug,
    content: `
      <h2>Giới thiệu</h2>
      <p>iPhone 15 Pro Max là smartphone cao cấp nhất hiện nay. Trong bài viết này, chúng tôi giới thiệu top 10 ốp lưng đẹp nhất.</p>
      
      <h2>1. Ốp lưng MagSafe trong suốt</h2>
      <p>Đây là lựa chọn hoàn hảo cho những ai muốn khoe vẻ đẹp của iPhone 15 Pro Max.</p>
      <ul>
        <li>Chất liệu: Polycarbonate + TPU</li>
        <li>Trọng lượng: 30g</li>
        <li>Độ dày: 1.2mm</li>
      </ul>
      
      <h2>2. Ốp lưng da cao cấp</h2>
      <p>Với chất liệu da thật, chiếc ốp này mang đến vẻ sang trọng và đẳng cấp.</p>
      
      <h2>Kết luận</h2>
      <p>Việc chọn ốp lưng phù hợp phụ thuộc vào nhu cầu cá nhân. GoatTech cung cấp đầy đủ các loại ốp lưng với giá cạnh tranh.</p>
    `,
    excerpt: 'Khám phá những mẫu ốp lưng iPhone 15 Pro Max được yêu thích nhất.',
    featured_image: '/noel.jpg',
    author_id: 1,
    category: 'review',
    tags: 'iPhone,ốp lưng,phụ kiện,review',
    view_count: 1523,
    is_published: true,
    published_at: '2024-12-15T10:00:00Z',
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy bài viết</h2>
          <Link href="/blog" className="text-pink-600 hover:underline">
            ← Quay lại Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-[50vh] min-h-[400px]">
        <img
          src={post.featured_image || '/noel.jpg'}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        
        <Link
          href="/blog"
          className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full font-medium hover:bg-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>

        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-sm font-medium px-4 py-1 rounded-full capitalize">
              {post.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(post.published_at)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.view_count} lượt xem
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <p className="text-xl text-gray-600 leading-relaxed mb-8 pb-8 border-b">
            {post.excerpt}
          </p>

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && (
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-5 h-5 text-gray-400" />
                {post.tags.split(',').map((tag, index) => (
                  <Link
                    key={index}
                    href={`/blog?tag=${tag.trim()}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm transition"
                  >
                    #{tag.trim()}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="mt-8 pt-8 border-t flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium">Chia sẻ:</span>
              <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="bg-sky-500 text-white p-2 rounded-full hover:bg-sky-600 transition">
                <Twitter className="w-5 h-5" />
              </button>
              <button
                onClick={handleCopyLink}
                className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 transition"
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-2 px-6 py-2 rounded-full transition ${
                liked
                  ? 'bg-pink-100 text-pink-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-pink-600' : ''}`} />
              {liked ? 'Đã thích' : 'Thích bài viết'}
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Khám phá sản phẩm của GoatTech</h3>
          <p className="text-white/90 mb-6">
            Hàng ngàn mẫu ốp lưng chất lượng cao đang chờ bạn
          </p>
          <Link
            href="/shop"
            className="inline-block bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
          >
            Mua sắm ngay
          </Link>
        </div>
      </article>
    </div>
  );
}