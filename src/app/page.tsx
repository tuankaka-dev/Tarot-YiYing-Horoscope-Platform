'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BookOpen, Shield, Zap, Crown, Loader2, CreditCard, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';

const trigrams = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];

export default function LandingPage() {
  const { user } = useAuthStore();
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);

  const handleUpgrade = async (tier: 'premium_weekly' | 'pro_monthly' = 'premium_weekly') => {
    if (!user) {
      window.location.href = '/register';
      return;
    }
    setUpgradingTier(tier);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Lỗi khi tạo giao dịch PayOS. Hãy kiểm tra lại API Key trong .env');
      }
    } catch {
      toast.error('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setUpgradingTier(null);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Floating trigrams background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {trigrams.map((trigram, i) => (
          <motion.div
            key={i}
            className="absolute text-mystic-gold/10 text-6xl select-none"
            style={{
              left: `${10 + (i * 12) % 80}%`,
              top: `${15 + (i * 17) % 70}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 10, -10, 0],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.7,
              ease: 'easeInOut',
            }}
          >
            {trigram}
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        <div className="bg-hero-gradient absolute inset-0" />
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          {/* Yin Yang symbol */}
          <motion.div
            className="text-8xl md:text-9xl mx-auto select-none"
            initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ filter: 'drop-shadow(0 0 30px rgba(184, 134, 11, 0.2))' }}
          >
            ☯
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-mystic-gold text-gold-glow">GieoQuẻ</span>
              <span className="text-foreground">.app</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Đừng để sự mông lung cản bước quyết định của bạn! GieoQue.App số hóa Kinh Dịch
              dưới sự cố vấn từ các bậc thầy Phong thủy và Tử vi hàng đầu. Chúng tôi giúp bạn giải
              mã tín hiệu vũ trụ, biến bất định thành định hướng rõ ràng và sắc bén. Gieo quẻ mỗi
              ngày để mỗi hành động đều tự tin, được bảo chứng bởi minh triết ngàn năm
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/divine">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-mystic-gold to-amber-600 hover:from-mystic-gold/90 hover:to-amber-600/90 text-white font-semibold h-14 px-10 text-lg gold-glow"
              >
                Bắt Đầu Gieo Quẻ
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/tuvi"
                className="inline-flex items-center rounded-full border border-mystic-gold/40 bg-white/70 px-3 py-1.5 text-xs font-semibold text-mystic-gold hover:bg-mystic-gold/10 transition-colors"
              >
                Lập Lá Số Tử Vi
              </Link>
              <Link
                href="/tarot"
                className="inline-flex items-center rounded-full border border-mystic-gold/40 bg-white/70 px-3 py-1.5 text-xs font-semibold text-mystic-gold hover:bg-mystic-gold/10 transition-colors"
              >
                Trải Bài Tarot
              </Link>
            </div>

            {!user && (
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 h-14 px-10 text-lg border-mystic-gold/30 hover:bg-mystic-gold/10 text-mystic-gold"
                >
                  Tạo Tài Khoản
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>



      {/* Pricing / Premium Section */}
      <section id="pricing" className="relative py-24 px-4 bg-mystic-purple/5 border-t border-mystic-purple/10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-mystic-gold text-gold-glow">Gói Đăng Ký</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Nâng tầm trải nghiệm tâm linh của bạn với quyền lợi không giới hạn.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6 items-stretch max-w-7xl mx-auto"
          >
            {/* Free Tier Card */}
            <div className="bg-card/60 backdrop-blur border border-border/50 p-8 rounded-2xl text-center space-y-6 shadow-lg flex flex-col">
              <div className="inline-flex items-center justify-center p-3 bg-muted rounded-full mb-2">
                <Zap className="w-8 h-8 text-muted-foreground" />
              </div>

              <h3 className="text-2xl font-bold text-foreground">Gói Miễn Phí</h3>

              <div className="text-4xl font-bold text-foreground">
                0₫ <span className="text-lg font-normal text-muted-foreground mr-1">/</span> <span className="text-lg font-medium text-foreground/80">vĩnh viễn</span>
              </div>

              <ul className="text-left space-y-3 mt-6 mb-8 text-foreground/70 flex-1">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  Gieo quẻ Kinh Dịch mỗi ngày miễn phí không giới hạn 
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  Lập lá số tử vi mỗi ngày miễn phí không giới hạn 
                </li>
           <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  Trải bài tarot mỗi ngày miễn phí không giới hạn 
                </li>
                <li className="flex items-start gap-4 ml-0.5 mt-1 border-t border-border/50 pt-3">
                  
                </li>
                 <li className="flex items-center gap-2 opacity-60">
                  <X className="w-4 h-4 text-destructive shrink-0" />
                  <span className="text-sm font-bold">Không được luận giải chuyên sâu và chi tiết các vấn đề, lời khuyên  </span>
                </li>
                <li className="flex items-center gap-2 opacity-60">
                  <X className="w-4 h-4 text-destructive shrink-0" />
                  <span className="text-sm font-bold">Ưu tiên xử lý thấp hơn</span>
                </li>
              </ul>

              <Link href="/divine" className="w-full">
                <Button variant="outline" className="w-full h-14 text-lg border-border hover:bg-muted font-semibold transition-all">
                  Gieo Quẻ Ngay
                </Button>
              </Link>
            </div>

            {/* Premium Tier Card */}
            <div className="bg-card/80 backdrop-blur border border-mystic-gold/40 p-6 rounded-2xl text-center space-y-6 shadow-xl relative overflow-hidden group flex flex-col border-2">
              <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-tight z-20 shadow-sm">
                Phổ Biến
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-mystic-purple/5 via-transparent to-mystic-gold/5 opacity-30 pointer-events-none" />

              <div className="inline-flex items-center justify-center p-3 bg-mystic-gold/10 rounded-full mb-2">
                <Crown className="w-8 h-8 text-mystic-gold" />
              </div>

              <h3 className="text-xl font-bold text-foreground first-letter:uppercase">Gói Tuần</h3>

              <div className="text-3xl font-bold text-mystic-gold drop-shadow-sm">
                50.000₫ <span className="text-sm font-normal text-muted-foreground mr-1"></span> <span className="text-sm font-medium text-foreground/80 lowercase"></span>
              </div>

              <ul className="text-left space-y-2 mt-4 mb-6 text-foreground/80 flex-1 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-mystic-gold mt-0.5 shrink-0" />
                  Nhận ngay <strong className="text-mystic-gold">100 xu</strong> mỗi ngày
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-mystic-gold mt-0.5 shrink-0" />
                  Bao gồm quyền lợi cơ bản được nâng cấp thêm
                </li>
                <li className="flex items-start gap-2 font-semibold text-mystic-gold py-1 bg-mystic-gold/5 rounded-lg px-2 -mx-2">
                  <Check className="w-4 h-4 text-mystic-gold mt-0.5 shrink-0" />
                  Gieo quẻ - giải quẻ chuyên sâu, xem tử vi chi tiết, trải bài tarot chi tiết ( giới hạn lượt )
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-mystic-gold mt-0.5 shrink-0" />
                  Không quảng cáo & ưu tiên
                </li>
              </ul>

              <Button
                onClick={() => handleUpgrade('premium_weekly')}
                disabled={!!upgradingTier}
                className="w-full h-12 text-base gap-2 bg-gradient-to-r from-mystic-gold to-amber-500 hover:from-amber-400 hover:to-mystic-gold text-black font-semibold shadow-md gold-glow relative z-10"
              >
                {upgradingTier === 'premium_weekly' ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                Đăng ký
              </Button>
            </div>

            {/* PRO Tier Card */}
            <div className="bg-card/90 backdrop-blur border border-amber-500 p-6 rounded-2xl text-center space-y-6 shadow-2xl relative overflow-hidden group flex flex-col scale-105 border-2 z-10">
              <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-tight z-20 shadow-sm">
                Pro
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-orange-600/20 opacity-40 pointer-events-none animate-pulse" />

              <div className="inline-flex items-center justify-center p-3 bg-amber-500/20 rounded-full mb-2 ring-2 ring-amber-500/30">
                <Zap className="w-8 h-8 text-amber-500" />
              </div>

              <h3 className="text-2xl font-black text-foreground uppercase tracking-widest">Gói Tháng</h3>

              <div className="text-4xl font-black text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                100.000₫ <span className="text-lg font-normal text-muted-foreground mr-1"></span> <span className="text-lg font-bold text-foreground/80"></span>
              </div>

              <ul className="text-left space-y-3 mt-4 mb-6 text-foreground flex-1">
                <li className="flex items-start gap-2 font-bold text-amber-500 py-1 bg-amber-500/10 rounded-lg px-2 -mx-2">
                  <Check className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  Sử dụng tất cả dịch vụ không cần xu
                </li>
                <li className="flex items-start gap-2  text-mystic-gold font-bold">
                  <Check className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  Luận giải quẻ chuyên sâu, Xem Tử Vi, Xem Tarot hằng ngày không giới hạn lượt
                </li>

                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  Bao gồm các tính năng cơ bản được nâng cấp
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  Đặc quyền hỗ trợ VIP & Ưu tiên
                </li>
              </ul>

              <Button
                onClick={() => handleUpgrade('pro_monthly')}
                disabled={!!upgradingTier}
                className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 hover:from-amber-300 hover:via-orange-400 hover:to-amber-500 text-black font-extrabold shadow-lg gold-glow relative z-10 uppercase scale-105"
              >
                {upgradingTier === 'pro_monthly' ? <Loader2 className="w-6 h-6 animate-spin" /> : <Crown className="w-6 h-6" />}
                Đăng Ký
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
   

      {/* Knowledge Decor Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-[#f8f5ef] via-[#f3eee4] to-[#ede5d7] border-t border-mystic-gold/20">
        <div className="max-w-6xl mx-auto space-y-10">
          <motion.div
            className="text-center space-y-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-black text-[#1f1b16] tracking-tight">
              Kinh Dịch: Bản Đồ Minh Triết Nhân Sinh
            </h2>
            <p className="text-base md:text-xl text-[#3d3529] max-w-4xl mx-auto">
              Hiểu Kinh Dịch là hiểu quy luật cân bằng, biến đổi và khả năng thích nghi để ra quyết định đúng thời điểm.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-white/80 border border-[#d1b88b] p-6 shadow-sm"
            >
              <p className="text-4xl mb-3">☯</p>
              <h3 className="text-2xl font-bold text-[#1f1b16] mb-2">Âm Dương - Cội Nguồn Cân Bằng</h3>
              <p className="text-[#4b4338] leading-relaxed">
                Mọi sự vật đều vận hành bởi hai lực đối đãi và bổ sung. Nhìn rõ âm - dương giúp ta tránh cực đoan,
                chọn hành động vừa đúng người vừa đúng thời.
              </p>
              <div className="mt-4 rounded-xl bg-gradient-to-r from-[#8f2f2a] to-[#c89a3a] text-white px-4 py-2 text-sm font-medium">
                Đối kháng để phát triển, hòa hợp để bền vững.
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="rounded-3xl bg-white/80 border border-[#9bb093] p-6 shadow-sm"
            >
              <p className="text-4xl mb-3">☰</p>
              <h3 className="text-2xl font-bold text-[#1f1b16] mb-2">64 Quẻ - Bản Đồ Tình Huống</h3>
              <p className="text-[#4b4338] leading-relaxed">
                Từ 8 quái cơ bản hình thành 64 quẻ, phản ánh các trạng thái quen thuộc của đời sống: khởi đầu, bế tắc,
                chuyển giao, thuận lợi, và trưởng thành.
              </p>
              <div className="mt-4 rounded-xl bg-gradient-to-r from-[#3a6f4b] to-[#2f5f86] text-white px-4 py-2 text-sm font-medium">
                Nhận diện đúng bối cảnh trước khi quyết định.
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.16 }}
              className="rounded-3xl bg-white/80 border border-[#8ca198] p-6 shadow-sm"
            >
              <p className="text-4xl mb-3">⟲</p>
              <h3 className="text-2xl font-bold text-[#1f1b16] mb-2">Ba Nguyên Lý: Biến - Bất - Giản</h3>
              <p className="text-[#4b4338] leading-relaxed">
                Vạn vật luôn biến đổi, nhưng vẫn có quy luật bền vững; khi hiểu sâu, ta diễn giải mọi chuyện theo cách
                giản dị và sáng rõ hơn.
              </p>
              <div className="mt-4 rounded-xl bg-gradient-to-r from-[#c9a143] to-[#2f6b50] text-white px-4 py-2 text-sm font-medium">
                Sống trung chính và hợp thời để bớt sai lầm lớn.
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-mystic-gold/25 bg-white/80 p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-mystic-gold/15 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-mystic-gold" />
                </div>
                <h3 className="text-2xl font-bold text-[#1f1b16]">Tử Vi: Bản Đồ Vận Trình Cá Nhân</h3>
              </div>
              <p className="text-[#4b4338] leading-relaxed">
                Tử Vi Đẩu Số dùng giờ - ngày - tháng - năm sinh để lập 12 cung và hệ sao, từ đó đọc ra thiên hướng
                về mệnh cách, sự nghiệp, tài lộc, tình cảm và chu kỳ đại vận - tiểu vận theo từng giai đoạn đời người.
              </p>
              <div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-[#f6f1e7] px-3 py-2 text-[#3e3428]">12 cung phản ánh các mặt đời sống</div>
                <div className="rounded-xl bg-[#f6f1e7] px-3 py-2 text-[#3e3428]">Đại vận giúp định hướng 10 năm</div>
                <div className="rounded-xl bg-[#f6f1e7] px-3 py-2 text-[#3e3428]">Tiểu vận giúp quan sát từng năm</div>
                <div className="rounded-xl bg-[#f6f1e7] px-3 py-2 text-[#3e3428]">Là công cụ tự nhận thức và điều chỉnh</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="rounded-3xl border border-mystic-purple/25 bg-white/80 p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-mystic-purple/15 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-mystic-purple" />
                </div>
                <h3 className="text-2xl font-bold text-[#1f1b16]">Tarot: Gương Soi Nội Tâm Hiện Tại</h3>
              </div>
              <p className="text-[#4b4338] leading-relaxed">
                Tarot gồm 78 lá, chia thành Ẩn Chính và Ẩn Phụ, thường dùng để soi chiếu trạng thái cảm xúc, động lực,
                nỗi sợ và cơ hội trong hiện tại gần. Trải bài phù hợp giúp bạn nhìn rõ điều cần làm ngay bây giờ.
              </p>
              <div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-[#f1ecf8] px-3 py-2 text-[#3a3248]">1 lá: thông điệp trọng tâm</div>
                <div className="rounded-xl bg-[#f1ecf8] px-3 py-2 text-[#3a3248]">3 lá: quá khứ - hiện tại - xu hướng</div>
                <div className="rounded-xl bg-[#f1ecf8] px-3 py-2 text-[#3a3248]">5 lá: đọc sâu vấn đề cụ thể</div>
                <div className="rounded-xl bg-[#f1ecf8] px-3 py-2 text-[#3a3248]">Dùng để phản tư, không thay thế quyết định cá nhân</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
         {/* Features Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-mystic-gold text-gold-glow">Trí Tuệ Cổ Xưa,</span>{' '}
              Giao Diện Hiện Đại
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Trải nghiệm Kinh Dịch chưa từng có với nền tảng gieo quẻ số
              được thiết kế tinh tế và hiện đại.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Phương Pháp Tung Xu Truyền Thống',
                description:
                  'Tung 3 đồng xu 6 lần, đúng như các bậc hiền triết đã thực hành hàng nghìn năm. Xem quẻ dịch hình thành từng hào một.',
              },
              {
                icon: BookOpen,
                title: 'Luận giải chuyên sâu',
                description:
                  'Nhận lời giải quẻ sâu sắc kết hợp trí tuệ Kinh Dịch cổ xưa và được cố vấn từ các bậc thầy Phong thủy và Tử vi nổi tiếng ở Việt Nam. Đưa lời khuyên hữu ích và hệ thống gợi ý ngày giờ tốt theo từng cá nhân',
              },
              {
                icon: Shield,
                title: 'Lưu Trữ Lịch Sử',
                description:
                  'Lưu giữ riêng tư tất cả các lần gieo quẻ. Nhìn lại lời chỉ dẫn trước đó và theo dõi diễn biến theo thời gian.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="relative p-8 rounded-xl border border-mystic-gold/15 bg-card/80 backdrop-blur hover:border-mystic-gold/30 transition-all duration-300 group shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 rounded-lg bg-mystic-gold/10 flex items-center justify-center mb-4 group-hover:bg-mystic-gold/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-mystic-gold" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-mystic-gold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">☯</span>
            <span className="text-sm text-muted-foreground">GieoQuẻ.App</span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs text-muted-foreground">
              Kinh Dịch là kim chỉ nam, không phải lời tiên tri. Hãy dùng trí tuệ của nó để suy ngẫm về con đường của bạn.
            </p>
            <Link
              href="/terms-services"
              className="mt-1 inline-block text-[11px] text-mystic-gold/80 hover:text-mystic-gold transition-colors"
            >
              Terms & Services
            </Link>
          </div>
        </div>
      </footer>

   
    </div>
  );
}
