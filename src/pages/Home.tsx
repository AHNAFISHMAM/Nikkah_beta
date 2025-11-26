import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SEO, jsonLdSchemas } from '../components/SEO'
import { PAGE_SEO } from '../lib/seo'
import { Button } from '../components/ui/button'
import { CheckSquare, DollarSign, BookOpen, MessageSquare, Library, LayoutDashboard, Heart, Sparkles } from 'lucide-react'

/**
 * Animation variants for scroll-triggered animations
 */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
}

const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
}

/**
 * Public Landing Page
 * Only shown to unauthenticated users (wrapped in PublicRoute)
 */
export default function Home() {
  const { scrollYProgress } = useScroll()
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95])
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
      <motion.header 
        className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-inset-top"
        style={{ opacity: headerOpacity }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div 
          className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 gap-2"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
              <motion.div
                variants={slideInLeft}
              >
                <Link to="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity touch-target-sm">
                  <motion.img
                    src="/logo.png"
                    alt="NikahPrep Logo - Crescent Moon and Heart"
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0"
                    width={40}
                    height={40}
                    loading="eager"
                    decoding="async"
                    style={{ imageRendering: 'high-quality' }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  <span className="text-lg sm:text-xl font-bold">NikahPrep</span>
                </Link>
              </motion.div>
              <motion.div 
                className="flex gap-1.5 sm:gap-2"
                variants={slideInRight}
              >
                <Button variant="ghost" asChild className="min-h-[40px] sm:min-h-[44px] px-2 sm:px-4 text-sm">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="warm" asChild className="min-h-[40px] sm:min-h-[44px] px-3 sm:px-4 text-sm">
                  <Link to="/signup">Get Started</Link>
                </Button>
              </motion.div>
        </motion.div>
      </motion.header>

      {/* Hero Section */}
      <section className="container py-10 sm:py-16 md:py-24 px-4 sm:px-6">
        <motion.div 
          className="mx-auto max-w-4xl text-center space-y-4 sm:space-y-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1,
              },
            },
          }}
        >
          {/* Badge with pulse animation */}
          <motion.div
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-badge-gradient text-xs sm:text-sm font-medium mb-2 sm:mb-4 animate-badge-pulse"
            variants={{
              hidden: { opacity: 0, y: -20, scale: 0.9 },
              visible: { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                },
              },
            }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            >
              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </motion.div>
            Islamic Marriage Preparation
          </motion.div>

          {/* Animated Gradient Headline */}
          <motion.h1 
            className="text-[clamp(1.75rem,1rem+4vw,3.75rem)] font-bold tracking-tight leading-[1.15]"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            <motion.span
              className="bg-gradient-to-r from-islamic-green via-islamic-gold to-islamic-purple bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift inline-block"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 12,
                  },
                },
              }}
            >
              Prepare for Your
            </motion.span>
            <br />
            <motion.span
              className="text-foreground inline-block"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 12,
                    delay: 0.1,
                  },
                },
              }}
            >
              Blessed Marriage
            </motion.span>
          </motion.h1>

          {/* Description with fade-in */}
          <motion.p
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: {
                  delay: 0.3,
                  duration: 0.5,
                },
              },
            }}
          >
            A comprehensive Islamic marriage preparation platform for engaged couples.
          </motion.p>

          {/* CTA Buttons with stagger */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-6"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.4,
                },
              },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10, scale: 0.95 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  },
                },
              }}
            >
              <Button size="xl" variant="warm" className="shadow-lg min-h-[48px] w-full sm:w-auto" asChild>
                <Link to="/signup">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start Your Journey
                </Link>
              </Button>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10, scale: 0.95 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  },
                },
              }}
            >
              <Button size="xl" variant="outline" className="min-h-[48px] w-full sm:w-auto" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container pb-12 sm:pb-20 px-4 sm:px-6">
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">What You'll Get</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Everything you need for a blessed Islamic marriage
          </p>
        </motion.div>
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-5xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.12, // 120ms - more noticeable stagger for feature cards
                delayChildren: 0.15, // 150ms initial delay
              },
            },
          }}
        >
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
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container pb-12 sm:pb-20 px-4 sm:px-6">
        <motion.div
          className="relative overflow-hidden rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center border border-primary/10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-islamic-gold/5 to-islamic-purple/10"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200% 200%",
              backgroundImage: "linear-gradient(90deg, rgba(0, 255, 135, 0.1), rgba(251, 208, 124, 0.05), rgba(184, 50, 128, 0.1))",
            }}
          />
          
          {/* Additional animated overlay for depth */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, rgba(0, 255, 135, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, rgba(184, 50, 128, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, rgba(0, 255, 135, 0.1) 0%, transparent 50%)",
              ],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.h2
              className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Begin Your Marriage Preparation
            </motion.h2>
            <motion.p
              className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Join couples preparing for their blessed union
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.4, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                variant="secondary" 
                className="bg-white text-primary hover:bg-white/90 min-h-[48px] w-full sm:w-auto relative overflow-hidden group"
                asChild
              >
                <Link to="/signup">
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 via-islamic-gold/10 to-islamic-purple/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut",
                    }}
                  />
                  <span className="relative z-10">Create Free Account</span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating Sparkles icon */}
          <motion.div
            className="absolute right-4 sm:right-8 top-4 sm:top-8 z-0"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 0.3, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              <Sparkles className="h-10 w-10 sm:h-16 sm:w-16 text-brand" />
            </motion.div>
          </motion.div>

          {/* Floating Heart icon */}
          <motion.div
            className="absolute left-4 sm:left-8 bottom-4 sm:bottom-8 z-0"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 0.3, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <motion.div
              animate={{
                y: [0, 10, 0],
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                y: {
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                },
                rotate: {
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              <Heart className="h-8 w-8 sm:h-12 sm:w-12 text-brand" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="border-t bg-card/30 safe-area-inset-bottom"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <div className="container py-6 sm:py-8 px-4 sm:px-6">
          <div className="flex flex-col items-center gap-3 sm:gap-4 text-center">
            {/* Logo and Brand */}
            <motion.div variants={fadeInUp}>
              <Link 
                to="/" 
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                aria-label="Go to home page"
              >
                <motion.img
                  src="/logo.png"
                  alt="NikahPrep Logo"
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain flex-shrink-0"
                  width={28}
                  height={28}
                  loading="lazy"
                  decoding="async"
                  style={{ imageRendering: 'high-quality' }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                <span className="text-base sm:text-lg font-semibold text-foreground">NikahPrep</span>
              </Link>
            </motion.div>
            
            {/* Tagline */}
            <motion.p 
              className="text-xs sm:text-sm text-muted-foreground"
              variants={fadeIn}
            >
              Preparing Hearts for Marriage
            </motion.p>
            
            {/* Divider */}
            <motion.div 
              className="w-12 h-px bg-border mx-auto"
              variants={fadeIn}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
            
            {/* Blessing and Copyright */}
            <motion.div 
              className="space-y-1.5"
              variants={fadeInUp}
            >
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
            </motion.div>
          </div>
        </div>
      </motion.footer>
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
    <motion.div
      className="group p-4 sm:p-6 rounded-xl border border-border/60 bg-card relative overflow-hidden"
      variants={{
        hidden: { 
          opacity: 0, 
          y: 30,
          scale: 0.9,
        },
        visible: { 
          opacity: 1, 
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
          },
        },
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 17,
        },
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Border glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl border-2 border-transparent pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{
          opacity: 1,
          borderColor: "rgba(0, 255, 135, 0.3)",
          boxShadow: "0 0 20px rgba(0, 255, 135, 0.2)",
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Icon container with 3D tilt effect */}
      <motion.div
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 relative z-10"
        style={{ background: 'linear-gradient(90deg, #FBD07C, #F7F779)' }}
        whileHover={{
          scale: 1.15,
          rotate: [0, -5, 5, 0],
          transition: {
            rotate: {
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
            },
          },
        }}
      >
        <motion.div
          whileHover={{
            scale: 1.1,
            rotate: 5,
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#8B5A2B]" />
        </motion.div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        <motion.h3
          className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2 leading-tight"
          whileHover={{ x: 2 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {title}
        </motion.h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">{description}</p>
      </div>

      {/* Shadow enhancement on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{
          opacity: 1,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}
