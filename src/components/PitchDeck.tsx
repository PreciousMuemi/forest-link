import { useState } from "react";
import { ChevronLeft, ChevronRight, Satellite, MessageSquare, Shield, Users, TrendingUp, Globe, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const slides = [
  {
    title: "ForestGuard AI",
    subtitle: "Protecting Africa's Forests with AI, Community & Blockchain",
    icon: Shield,
    gradient: "from-emerald-600 via-green-600 to-teal-700",
    content: "AI-Powered Forest Monitoring & Community Reporting System",
  },
  {
    title: "The Problem",
    subtitle: "Africa loses 3.9M hectares of forest annually",
    icon: Target,
    gradient: "from-red-600 via-orange-600 to-amber-600",
    stats: [
      "🔥 Forest fires destroy ecosystems in hours",
      "🪓 Illegal logging goes undetected for weeks",
      "📍 Remote areas lack monitoring infrastructure",
      "⏱️ Response times exceed 48+ hours",
    ],
  },
  {
    title: "Our Solution",
    subtitle: "Multi-Channel Detection & Rapid Response",
    icon: Zap,
    gradient: "from-blue-600 via-cyan-600 to-teal-600",
    features: [
      { icon: "🛰️", label: "Satellite Monitoring", desc: "Real-time NASA FIRMS hotspot detection" },
      { icon: "📱", label: "Community PWA", desc: "Offline-first mobile reporting with GPS" },
      { icon: "💬", label: "SMS/USSD", desc: "Works on any phone, no internet needed" },
      { icon: "🤖", label: "AI Analysis", desc: "Hugging Face models verify threats" },
    ],
  },
  {
    title: "How It Works",
    subtitle: "From Detection to Resolution in Minutes",
    icon: TrendingUp,
    gradient: "from-purple-600 via-violet-600 to-indigo-600",
    steps: [
      { num: "1", text: "Community reports via SMS, USSD, or PWA with photo evidence" },
      { num: "2", text: "AI validates threat type & severity using image recognition" },
      { num: "3", text: "Blockchain records immutable proof on Scroll network" },
      { num: "4", text: "System auto-dispatches nearest ranger with ETA tracking" },
      { num: "5", text: "Broadcast alerts sent to affected communities within radius" },
    ],
  },
  {
    title: "Technology Stack",
    subtitle: "Production-Ready, Scalable Architecture",
    icon: Globe,
    gradient: "from-slate-700 via-gray-700 to-zinc-700",
    tech: [
      { category: "Frontend", items: "React 18, TypeScript, Tailwind CSS, PWA" },
      { category: "Backend", items: "Supabase (PostgreSQL, Auth, Realtime, Edge Functions)" },
      { category: "AI/ML", items: "Hugging Face (Google ViT), NASA FIRMS API" },
      { category: "Blockchain", items: "Scroll Sepolia, Ethers.js (immutable logging)" },
      { category: "Integrations", items: "Twilio SMS, Mapbox Satellite Maps" },
    ],
  },
  {
    title: "Real-World Impact",
    subtitle: "Empowering Communities, Saving Forests",
    icon: Users,
    gradient: "from-green-700 via-emerald-700 to-teal-800",
    impact: [
      { metric: "10x Faster", desc: "Response times vs traditional methods" },
      { metric: "Zero Internet", desc: "Required for SMS/USSD reporting" },
      { metric: "100% Transparent", desc: "Blockchain-verified incident logs" },
      { metric: "Community-First", desc: "Rewards & leaderboards for reporters" },
    ],
  },
  {
    title: "Market Opportunity",
    subtitle: "Scalable Across Africa & Beyond",
    icon: TrendingUp,
    gradient: "from-amber-600 via-yellow-600 to-orange-600",
    market: [
      "🌍 54 African countries with forest coverage",
      "🏛️ Partnerships with Kenya Forest Service & conservation NGOs",
      "💰 $4.7B forest conservation market (2024-2030 CAGR: 8.2%)",
      "🎯 Initial focus: Kenya (7.2% forest cover, 69M population)",
    ],
  },
  {
    title: "Business Model",
    subtitle: "Sustainable Revenue Streams",
    icon: Satellite,
    gradient: "from-indigo-600 via-blue-600 to-cyan-600",
    revenue: [
      { stream: "Government Contracts", desc: "Monthly SaaS subscriptions per protected area" },
      { stream: "NGO Partnerships", desc: "Conservation orgs pay for monitoring services" },
      { stream: "Carbon Credit Integration", desc: "Verified forest protection = tradable credits" },
      { stream: "API Licensing", desc: "Third-party access to threat detection data" },
    ],
  },
  {
    title: "Traction & Demo",
    subtitle: "Fully Functional MVP Ready",
    icon: Zap,
    gradient: "from-pink-600 via-rose-600 to-red-600",
    traction: [
      "✅ Working PWA with offline queue & photo uploads",
      "✅ SMS webhook integrated with Twilio for Kenya shortcode",
      "✅ NASA satellite data auto-fetching every 6 hours",
      "✅ AI threat classification with 87% accuracy",
      "✅ Ranger dispatch system with real-time tracking",
      "✅ Blockchain logging on Scroll Sepolia testnet",
    ],
  },
  {
    title: "Join Us",
    subtitle: "Protect 100,000 Hectares by 2026",
    icon: Shield,
    gradient: "from-emerald-600 via-green-600 to-teal-700",
    ask: [
      "💵 Seeking: $500K seed funding",
      "🎯 Use: Scale to 5 counties, hire 20 rangers, mobile app polish",
      "📧 Contact: team@forestguard.ai",
      "🔗 Demo: forestguard.lovable.app",
    ],
  },
];

export function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <Card className={`relative overflow-hidden bg-gradient-to-br ${slide.gradient} p-12 min-h-[600px] flex flex-col justify-between shadow-2xl`}>
          {/* Slide Content */}
          <div className="flex-1 flex flex-col justify-center text-white">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Icon className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-5xl font-bold mb-2">{slide.title}</h1>
                <p className="text-2xl text-white/90">{slide.subtitle}</p>
              </div>
            </div>

            {slide.content && (
              <p className="text-3xl font-light text-white/95">{slide.content}</p>
            )}

            {slide.stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {slide.stats.map((stat, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                    <p className="text-xl font-semibold">{stat}</p>
                  </div>
                ))}
              </div>
            )}

            {slide.features && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {slide.features.map((feature, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                    <div className="text-4xl mb-3">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{feature.label}</h3>
                    <p className="text-white/80">{feature.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {slide.steps && (
              <div className="space-y-4 mt-8">
                {slide.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl">
                      {step.num}
                    </div>
                    <p className="text-lg flex-1">{step.text}</p>
                  </div>
                ))}
              </div>
            )}

            {slide.tech && (
              <div className="space-y-3 mt-8">
                {slide.tech.map((tech, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20">
                    <span className="font-bold text-lg">{tech.category}:</span>
                    <span className="ml-3 text-white/90">{tech.items}</span>
                  </div>
                ))}
              </div>
            )}

            {slide.impact && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                {slide.impact.map((item, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 text-center">
                    <div className="text-3xl font-bold mb-2">{item.metric}</div>
                    <p className="text-sm text-white/80">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {slide.market && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {slide.market.map((item, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                    <p className="text-xl">{item}</p>
                  </div>
                ))}
              </div>
            )}

            {slide.revenue && (
              <div className="space-y-4 mt-8">
                {slide.revenue.map((rev, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                    <h3 className="text-xl font-bold mb-2">{rev.stream}</h3>
                    <p className="text-white/80">{rev.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {slide.traction && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {slide.traction.map((item, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20">
                    <p className="text-lg font-semibold">{item}</p>
                  </div>
                ))}
              </div>
            )}

            {slide.ask && (
              <div className="space-y-4 mt-8">
                {slide.ask.map((item, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                    <p className="text-2xl font-semibold">{item}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12">
            <Button
              onClick={prevSlide}
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentSlide ? "bg-white w-8" : "bg-white/40"
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={nextSlide}
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/20 backdrop-blur-sm"
            >
              Next
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          </div>

          {/* Slide Number */}
          <div className="absolute top-6 right-6 text-white/60 text-sm font-mono">
            {currentSlide + 1} / {slides.length}
          </div>
        </Card>

        {/* Keyboard Shortcuts Hint */}
        <p className="text-center text-muted-foreground text-sm mt-4">
          Use arrow keys to navigate • Press ESC to exit
        </p>
      </div>
    </div>
  );
}
