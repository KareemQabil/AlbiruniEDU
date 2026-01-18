import Link from 'next/link';
import { ArrowLeft, Sparkles, Brain, Globe, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.1),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-heading font-bold">البيروني</h1>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/signup"
                className="btn-primary text-sm"
              >
                ابدأ مجاناً
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm">
              <Zap className="w-4 h-4 text-primary" />
              <span>18 وكيل ذكاء اصطناعي متخصص</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-5xl md:text-7xl font-heading font-bold leading-tight">
              تعلم مع أذكى
              <br />
              <span className="gradient-primary bg-clip-text text-transparent">
                منصة تعليمية عربية
              </span>
            </h2>

            {/* Description */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              منصة تعليمية مدعومة بالذكاء الاصطناعي مع 18 وكيلاً متخصصاً،
              تصورات تفاعلية، واكتشاف تلقائي للهجة العربية
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                href="/workspace/dashboard"
                className="btn-primary text-lg flex items-center gap-2 group"
              >
                <span>ابدأ التعلم</span>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="btn-glass text-lg"
              >
                اكتشف المزيد
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="glass-hover-card space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold">
                18 وكيل ذكاء اصطناعي
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                من المُصَوِّر إلى السُّقْراطي، كل وكيل متخصص في مجال تعليمي محدد
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-hover-card space-y-4">
              <div className="w-12 h-12 rounded-lg bg-secondary/20 border border-secondary/50 flex items-center justify-center">
                <Globe className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-heading font-bold">
                دعم اللهجات العربية
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                اكتشاف تلقائي للهجة المصرية والخليجية والشامية مع تكيف المحتوى
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-hover-card space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold">
                تصورات تفاعلية
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                رسوم بيانية رياضية، محاكاة فيزيائية ثلاثية الأبعاد، وتنفيذ أكواد مباشر
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="glass-panel max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-heading font-bold text-primary">
                  18
                </div>
                <div className="text-muted-foreground mt-2">وكيل ذكي</div>
              </div>
              <div>
                <div className="text-4xl font-heading font-bold text-secondary">
                  5+
                </div>
                <div className="text-muted-foreground mt-2">لهجات عربية</div>
              </div>
              <div>
                <div className="text-4xl font-heading font-bold text-primary">
                  400M+
                </div>
                <div className="text-muted-foreground mt-2">متحدث عربي</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2026 البيروني - Al-Biruni EDU. جميع الحقوق محفوظة.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                سياسة الخصوصية
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                الشروط والأحكام
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
