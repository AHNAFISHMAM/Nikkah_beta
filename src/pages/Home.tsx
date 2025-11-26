import { Link } from 'react-router-dom'
import { SEO, jsonLdSchemas } from '../components/SEO'
import { PAGE_SEO } from '../lib/seo'
import { Button } from '../components/ui/button'
import { CheckSquare, DollarSign, BookOpen, MessageSquare, Library, LayoutDashboard, Heart, Sparkles } from 'lucide-react'

/**
 * Public Landing Page
 * Only shown to unauthenticated users (wrapped in PublicRoute)
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background via-60% to-islamic-purple/5">
      <SEO
        title={PAGE_SEO.home.title}
        description={PAGE_SEO.home.description}
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@graph': [jsonLdSchemas.organization, jsonLdSchemas.website],
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-inset-top">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 gap-2">
              <Link to="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity touch-target-sm">
                <img
                  src="/logo.png"
                  alt="NikahPrep Logo - Crescent Moon and Heart"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0"
                  width={40}
                  height={40}
                  loading="eager"
                  decoding="async"
                  style={{ imageRendering: 'high-quality' }}
                />
            <span className="text-lg sm:text-xl font-bold">NikahPrep</span>
          </Link>
          <div className="flex gap-1.5 sm:gap-2">
            <Button variant="ghost" asChild className="min-h-[40px] sm:min-h-[44px] px-2 sm:px-4 text-sm">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button variant="warm" asChild className="min-h-[40px] sm:min-h-[44px] px-3 sm:px-4 text-sm">
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-10 sm:py-16 md:py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center space-y-4 sm:space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-badge-gradient text-xs sm:text-sm font-medium mb-2 sm:mb-4">
            <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Islamic Marriage Preparation
          </div>
          <h1 className="text-[clamp(1.75rem,1rem+4vw,3.75rem)] font-bold tracking-tight leading-[1.15]">
            <span className="bg-gradient-to-r from-islamic-green via-islamic-gold to-islamic-purple bg-clip-text text-transparent">
              Prepare for Your
            </span>
            <br />
            <span className="text-foreground">Blessed Marriage</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A comprehensive Islamic marriage preparation platform for engaged couples.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-6">
            <Button size="xl" variant="warm" className="shadow-lg min-h-[48px] w-full sm:w-auto" asChild>
              <Link to="/signup">
                <Sparkles className="h-5 w-5 mr-2" />
                Start Your Journey
              </Link>
            </Button>
            <Button size="xl" variant="outline" className="min-h-[48px] w-full sm:w-auto" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">What You'll Get</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Everything you need for a blessed Islamic marriage
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-5xl mx-auto">
          <FeatureCard
            icon={CheckSquare}
            title="Readiness Checklist"
            description="30+ items across spiritual, financial, family categories"
            color="primary"
          />
          <FeatureCard
            icon={DollarSign}
            title="Financial Tools"
            description="Budget calculator and financial planning tools"
            color="islamic-gold"
          />
          <FeatureCard
            icon={BookOpen}
            title="Islamic Modules"
            description="5 modules on marriage, communication, and family"
            color="islamic-green"
          />
          <FeatureCard
            icon={MessageSquare}
            title="Discussion Prompts"
            description="15+ conversation starters for important topics"
            color="islamic-purple"
          />
          <FeatureCard
            icon={Library}
            title="Resources Library"
            description="Curated Islamic books and courses"
            color="islamic-gold"
          />
          <FeatureCard
            icon={LayoutDashboard}
            title="Progress Dashboard"
            description="Track your readiness and wedding countdown"
            color="islamic-green"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/10 via-islamic-gold/5 to-islamic-purple/10 p-6 sm:p-8 md:p-12 text-center border border-primary/10">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Begin Your Marriage Preparation</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              Join couples preparing for their blessed union
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 min-h-[48px] w-full sm:w-auto" asChild>
              <Link to="/signup">Create Free Account</Link>
            </Button>
          </div>
          <Sparkles className="absolute right-4 sm:right-8 top-4 sm:top-8 h-10 w-10 sm:h-16 sm:w-16 text-brand opacity-30" />
          <Heart className="absolute left-4 sm:left-8 bottom-4 sm:bottom-8 h-8 w-8 sm:h-12 sm:w-12 text-brand opacity-30" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/30 safe-area-inset-bottom">
        <div className="container py-6 sm:py-8 px-4 sm:px-6">
          <div className="flex flex-col items-center gap-3 sm:gap-4 text-center">
            {/* Logo and Brand */}
            <Link 
              to="/" 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              aria-label="Go to home page"
            >
              <img
                src="/logo.png"
                alt="NikahPrep Logo"
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain flex-shrink-0"
                width={28}
                height={28}
                loading="lazy"
                decoding="async"
                style={{ imageRendering: 'high-quality' }}
              />
              <span className="text-base sm:text-lg font-semibold text-foreground">NikahPrep</span>
            </Link>
            
            {/* Tagline */}
            <p className="text-xs sm:text-sm text-muted-foreground">
              Preparing Hearts for Marriage
            </p>
            
            {/* Divider */}
            <div className="w-12 h-px bg-border mx-auto" />
            
            {/* Blessing and Copyright */}
            <div className="space-y-1.5">
              <p 
                className="text-xs sm:text-sm font-medium italic bg-clip-text text-transparent"
                style={{ 
                  backgroundImage: 'linear-gradient(90deg, #E8C070, #E0C06A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                May Allah bless all marriages
              </p>
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} NikahPrep
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  color: 'primary' | 'islamic-gold' | 'islamic-green' | 'islamic-purple'
}

function FeatureCard({ icon: Icon, title, description, color }: FeatureCardProps) {
  return (
    <div className="group p-4 sm:p-6 rounded-xl border border-border/60 bg-card hover:shadow-lg transition-all duration-200 active:scale-[0.98]">
      <div 
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform"
        style={{ background: 'linear-gradient(90deg, #FBD07C, #F7F779)' }}
      >
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#8B5A2B]" />
      </div>
      <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2 leading-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">{description}</p>
    </div>
  )
}
