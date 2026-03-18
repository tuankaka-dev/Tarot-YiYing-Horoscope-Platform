'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BookOpen, Shield, Zap } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

const trigrams = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];

export default function LandingPage() {
  const { user } = useAuthStore();

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
              <span className="text-foreground">.Online</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Khám phá trí tuệ cổ xưa của Kinh Dịch. Tung đồng xu,
              đặt câu hỏi và nhận lời giải đáp sâu sắc từ trí tuệ
              ngàn năm kết hợp công nghệ AI hiện đại.
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
                title: 'Giải Quẻ Bằng AI',
                description:
                  'Nhận lời giải quẻ sâu sắc kết hợp trí tuệ Kinh Dịch ngàn năm với sự hiểu biết của trí tuệ nhân tạo hiện đại.',
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

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <motion.div
          className="max-w-3xl mx-auto text-center p-12 rounded-2xl border border-mystic-gold/20 bg-card/80 backdrop-blur mystic-glow-strong shadow-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Zap className="w-10 h-10 text-mystic-gold mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4 text-mystic-gold text-gold-glow">
            Sẵn Sàng Hỏi Quẻ?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Hãy tĩnh tâm, tập trung vào câu hỏi của bạn, và để trí tuệ cổ xưa
            của Kinh Dịch soi sáng con đường phía trước.
          </p>
          <Link href="/divine">
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-mystic-gold to-amber-600 hover:from-mystic-gold/90 hover:to-amber-600/90 text-white font-semibold h-14 px-10 text-lg gold-glow"
            >
              Gieo Quẻ Ngay
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">☯</span>
            <span className="text-sm text-muted-foreground">GieoQuẻ.Online</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Kinh Dịch là kim chỉ nam, không phải lời tiên tri. Hãy dùng trí tuệ của nó để suy ngẫm về con đường của bạn.
          </p>
        </div>
      </footer>
    </div>
  );
}
