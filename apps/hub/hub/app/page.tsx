'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Code, 
  Image, 
  Map, 
  Zap, 
  Shield, 
  Globe,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Brain,
  Rocket,
  Share2
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const features = [
    {
      icon: MessageSquare,
      title: 'ChatBoss AI Assistant',
      description: 'Complete AI coding assistant with semantic code understanding, multi-file operations, intelligent refactoring, error diagnosis, and 40+ language support. All capabilities of advanced AI assistants integrated.',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Code,
      title: 'Code Analysis & Debugging',
      description: 'Advanced static analysis, security scanning, and intelligent debugging. Find bugs, optimize performance, and improve code quality.',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: Image,
      title: 'Media Generation Studio',
      description: 'Create stunning images and videos with AI. Generate marketing materials, product visuals, and creative content in seconds.',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: Brain,
      title: 'AI Memory System',
      description: 'Persistent AI memory that remembers important information across sessions. Build a knowledge base that grows with you.',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
           {
             icon: Map,
             title: 'Streets Platform',
             description: 'Crowdsourced street mapping with verification and rewards. Contribute to building the world\'s most comprehensive street database.',
             color: 'text-teal-600 dark:text-teal-400',
             bgColor: 'bg-teal-50 dark:bg-teal-900/20',
           },
           {
             icon: Share2,
             title: 'Social Media Management',
             description: 'Complete social media management platform. Schedule posts, track analytics, manage multiple accounts, monitor mentions, analyze competitors, and more - all through ChatBoss AI or dedicated dashboard.',
             color: 'text-pink-600 dark:text-pink-400',
             bgColor: 'bg-pink-50 dark:pink-900/20',
           },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Multi-level admin system, role-based access control, and comprehensive audit logging. Built for enterprise scale.',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      icon: Sparkles,
      title: 'Self-Improving Architecture',
      description: 'AI system that intelligently evaluates and upgrades its own codebase. Continuous learning and optimization with Super Admin oversight.',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      icon: Zap,
      title: 'Central Motherboard System',
      description: 'Core control system connecting all modules. Monitors performance, manages updates, and ensures mission alignment across the platform.',
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    },
    {
      icon: Rocket,
      title: 'Developer Console',
      description: 'Complete integrated console with terminal, real-time logs, code editor, module management, and AI performance controls.',
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    },
  ];

  const benefits = [
    'Accelerate development with AI-powered code assistance',
    'Reduce bugs and security vulnerabilities automatically',
    'Generate professional media content in minutes',
    'Build persistent AI knowledge bases',
    'Self-improving architecture that evolves with your needs',
    'Central motherboard system for complete platform control',
    'Super Admin oversight with approval workflow',
    'Complete developer console integrated into platform',
    'Auto-monitoring and self-diagnosis capabilities',
    'Training mode for custom AI capabilities',
    'Scale from individual developers to enterprise teams',
    'Multi-provider AI support (Anthropic, OpenAI)',
    'Comprehensive analytics and cost tracking',
    'Secure, enterprise-grade infrastructure',
  ];

  const stats = [
    { value: '40+', label: 'Programming Languages' },
    { value: '2+', label: 'AI Providers' },
    { value: '100+', label: 'AI Features' },
    { value: 'Self-Improving', label: 'Architecture' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 dark:from-purple-600/20 dark:via-blue-600/20 dark:to-purple-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-12 w-12 text-purple-600 dark:text-purple-400 mr-3" />
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white">
                HenryMo AI
              </h1>
            </div>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The Complete Enterprise AI Development Platform
            </p>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Build faster, code smarter, and create better with AI-powered tools designed for developers and businesses.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/api">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-purple-500 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20">
                  View API
                  <Code className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Powerful Features for Modern Development
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
              Everything you need to build, deploy, and scale with AI
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Why Choose HenryMo AI?
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
              Built for developers, designed for scale
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Rocket className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Development Workflow?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of developers building the future with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
                Sign In to Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-purple-400 mr-2" />
              <span className="text-xl font-bold text-white">HenryMo AI</span>
            </div>
            <p className="mb-4">
              Enterprise AI Development Platform
            </p>
            <p className="text-sm">
              Created by Henry Maobughichi Ugochukwu
            </p>
            <p className="text-sm mt-2">
              © {new Date().getFullYear()} HenryMo AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
