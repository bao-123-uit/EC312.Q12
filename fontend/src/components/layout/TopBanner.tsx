// File: fontend/src/components/layout/TopBanner.tsx

export default function TopBanner() {
  return (
    <div className="bg-black text-white py-2 px-4 text-center text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
        <span>Miễn phí vận chuyển cho đơn hàng trên 100K</span>
        <span className="hidden md:inline">|</span>
        <span className="hidden md:inline text-pink-400 font-medium">
          Ưu đãi GoatTech: Mua 4 ốp - Trả tiền 2 ốp
        </span>
      </div>
    </div>
  );
}