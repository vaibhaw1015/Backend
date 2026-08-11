import {
  ArrowRight,
  Users,
  Package,
  FileText,
  BarChart3,
  Shield,
  Zap,
  Lock,
  Globe,
  ChevronRight,
  ClipboardList,
  Warehouse,
  UserCheck,
  Calculator,
  Layers,
  Database,
  Server,
  CheckCircle2,
} from 'lucide-react';

interface LandingProps {
  onGoToLogin: () => void;
}

export default function Landing({ onGoToLogin }: LandingProps) {
  const features = [
    {
      icon: <Users size={28} />,
      title: 'Customer CRM',
      desc: 'Track leads, manage contacts, add follow-up notes, and convert prospects into active wholesale accounts.',
      color: '#3b82f6',
      bg: '#eff6ff',
    },
    {
      icon: <Package size={28} />,
      title: 'Inventory Management',
      desc: 'Real-time stock tracking with SKU management, low-stock alerts, warehouse locations, and audited adjustments.',
      color: '#8b5cf6',
      bg: '#f5f3ff',
    },
    {
      icon: <FileText size={28} />,
      title: 'Challan & Dispatch',
      desc: 'Create, confirm, and cancel delivery challans with automatic stock deduction and snapshot pricing.',
      color: '#06b6d4',
      bg: '#ecfeff',
    },
    {
      icon: <BarChart3 size={28} />,
      title: 'Dashboard Analytics',
      desc: 'At-a-glance business overview with key metrics, recent activity, and operational status indicators.',
      color: '#f59e0b',
      bg: '#fffbeb',
    },
    {
      icon: <Shield size={28} />,
      title: 'Role-Based Access',
      desc: 'Four distinct roles — Admin, Sales, Warehouse, Accounts — each with granular permission controls.',
      color: '#10b981',
      bg: '#ecfdf5',
    },
    {
      icon: <Zap size={28} />,
      title: 'Atomic Transactions',
      desc: 'Stock operations use database transactions. If anything fails, the entire operation rolls back cleanly.',
      color: '#ef4444',
      bg: '#fef2f2',
    },
  ];

  const roles = [
    {
      icon: <UserCheck size={22} />,
      title: 'Admin',
      desc: 'Full system access — manage users, customers, products, and challans.',
      color: '#3b82f6',
      bg: '#dbeafe',
    },
    {
      icon: <Users size={22} />,
      title: 'Sales',
      desc: 'Customer CRM, lead management, create & confirm challans.',
      color: '#8b5cf6',
      bg: '#ede9fe',
    },
    {
      icon: <Warehouse size={22} />,
      title: 'Warehouse',
      desc: 'Product catalog, stock intake, manual adjustments & location tracking.',
      color: '#f59e0b',
      bg: '#fef3c7',
    },
    {
      icon: <Calculator size={22} />,
      title: 'Accounts',
      desc: 'View ledger, cancel challans, restore stock, and financial oversight.',
      color: '#10b981',
      bg: '#d1fae5',
    },
  ];

  const techStack = [
    { icon: <Server size={20} />, name: 'Node.js + Express', desc: 'Backend API' },
    { icon: <Layers size={20} />, name: 'React + TypeScript', desc: 'Frontend SPA' },
    { icon: <Database size={20} />, name: 'PostgreSQL + Prisma', desc: 'Database ORM' },
    { icon: <Lock size={20} />, name: 'JWT Authentication', desc: 'Secure Auth' },
    { icon: <Globe size={20} />, name: 'Neon Serverless DB', desc: 'Cloud Hosted' },
    { icon: <Shield size={20} />, name: 'Zod Validation', desc: 'Data Integrity' },
  ];

  const steps = [
    { num: '01', title: 'Sign In', desc: 'Log in with your assigned role credentials to access your personalized dashboard.' },
    { num: '02', title: 'Manage Data', desc: 'Add customers, products, and create delivery challans from an intuitive interface.' },
    { num: '03', title: 'Track & Dispatch', desc: 'Confirm challans to auto-deduct stock, track movements, and manage deliveries.' },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>

      {/* ===== NAVBAR ===== */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ClipboardList size={20} color="#fff" strokeWidth={2} />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Fundsroom
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onGoToLogin}
              style={{
                padding: '8px 20px',
                background: 'transparent',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.color = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#475569';
              }}
            >
              Sign In
            </button>
            <button
              onClick={onGoToLogin}
              style={{
                padding: '8px 20px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(59,130,246,0.3)';
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #e8f4fd 0%, #dbeafe 30%, #eff6ff 50%, #dbeafe 70%, #e0f0fe 100%)',
        padding: '140px 24px 100px',
        textAlign: 'center',
      }}>
        {/* Decorative elements */}
        <svg style={{ position: 'absolute', top: '40px', right: '60px', opacity: 0.25 }} width="80" height="80" viewBox="0 0 80 80">
          {Array.from({ length: 5 }).map((_, r) =>
            Array.from({ length: 5 }).map((_, c) => (
              <circle key={`h-${r}-${c}`} cx={8 + c * 16} cy={8 + r * 16} r="2.5" fill="#93c5fd" />
            ))
          )}
        </svg>
        <svg style={{ position: 'absolute', bottom: '60px', left: '80px', opacity: 0.2 }} width="64" height="64" viewBox="0 0 64 64">
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 4 }).map((_, c) => (
              <circle key={`h2-${r}-${c}`} cx={8 + c * 16} cy={8 + r * 16} r="2" fill="#93c5fd" />
            ))
          )}
        </svg>
        <svg style={{ position: 'absolute', top: '-60px', left: '-60px', opacity: 0.12, width: '350px', height: '350px' }} viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="180" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="140" fill="none" stroke="#60a5fa" strokeWidth="1" />
        </svg>

        {/* Bottom wave */}
        <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: '120px' }} viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,80 C360,120 720,40 1080,80 C1260,100 1380,60 1440,70 L1440,120 L0,120 Z" fill="#ffffff" />
        </svg>

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            borderRadius: '50px',
            padding: '6px 16px 6px 8px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#3b82f6',
            marginBottom: '24px',
            boxShadow: '0 2px 12px rgba(59,130,246,0.1)',
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: '#fff',
              borderRadius: '50px',
              padding: '2px 10px',
              fontSize: '0.7rem',
              fontWeight: 700,
            }}>NEW</span>
            Production-Ready Wholesale ERP System
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#0f172a',
            margin: '0 0 18px 0',
            letterSpacing: '-0.03em',
          }}>
            Manage Your Wholesale
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Operations Effortlessly
            </span>
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: '#64748b',
            lineHeight: 1.7,
            margin: '0 auto 32px',
            maxWidth: '600px',
          }}>
            A full-stack ERP & CRM platform for wholesale distributors. Track customers,
            manage inventory, generate challans, and control access — all in one place.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={onGoToLogin}
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                border: 'none',
                borderRadius: '14px',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 28px rgba(59,130,246,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 36px rgba(59,130,246,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(59,130,246,0.3)';
              }}
            >
              Open Dashboard <ArrowRight size={18} />
            </button>
            <a
              href="#features"
              style={{
                padding: '14px 32px',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.color = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#475569';
              }}
            >
              Explore Features <ChevronRight size={18} />
            </a>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            marginTop: '48px',
            flexWrap: 'wrap',
          }}>
            {[
              { val: '4', label: 'User Roles' },
              { val: '7', label: 'Data Models' },
              { val: '15+', label: 'API Endpoints' },
              { val: '100%', label: 'TypeScript' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6' }}>{stat.val}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" style={{
        padding: '80px 24px',
        background: '#ffffff',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <p style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#3b82f6',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: '0 0 8px',
            }}>Core Modules</p>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
            }}>Everything You Need to Run Your Business</h2>
            <p style={{
              fontSize: '1rem',
              color: '#64748b',
              maxWidth: '580px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}>
              Built with wholesale distributors in mind — from CRM to inventory to dispatch, every module is designed for real operations.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}>
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  background: '#ffffff',
                  border: '1px solid #f1f5f9',
                  borderRadius: '20px',
                  padding: '28px',
                  transition: 'all 0.3s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.06)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#f1f5f9';
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: f.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: f.color,
                  marginBottom: '16px',
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <p style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#3b82f6',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: '0 0 8px',
            }}>How It Works</p>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
            }}>Get Started in 3 Simple Steps</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px',
          }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '32px 28px',
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                border: '1px solid #f1f5f9',
                position: 'relative',
              }}>
                <div style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '14px',
                }}>{s.num}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ROLE-BASED ACCESS ===== */}
      <section style={{ padding: '80px 24px', background: '#ffffff' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#3b82f6',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: '0 0 8px',
            }}>Access Control</p>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
            }}>Four Roles, Granular Permissions</h2>
            <p style={{
              fontSize: '1rem',
              color: '#64748b',
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}>
              Each team member sees only what they need — secure, focused, and efficient.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}>
            {roles.map((r, i) => (
              <div key={i} style={{
                background: '#ffffff',
                borderRadius: '18px',
                padding: '24px',
                border: '1px solid #f1f5f9',
                transition: 'all 0.3s',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.06)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: r.bg,
                  color: r.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}>
                  {r.icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                  {r.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                  {r.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TECH STACK ===== */}
      <section style={{
        padding: '72px 24px',
        background: 'linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#3b82f6',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: '0 0 8px',
            }}>Built With</p>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 800,
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.02em',
            }}>Modern & Reliable Tech Stack</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
          }}>
            {techStack.map((t, i) => (
              <div key={i} style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '20px 16px',
                textAlign: 'center',
                border: '1px solid #f1f5f9',
                transition: 'all 0.2s',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.05)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  color: '#3b82f6',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                }}>
                  {t.icon}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                  {t.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                  {t.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BUSINESS LOGIC HIGHLIGHTS ===== */}
      <section style={{ padding: '72px 24px', background: '#ffffff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#3b82f6',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: '0 0 8px',
            }}>Business Logic</p>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 800,
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.02em',
            }}>Enterprise-Grade Constraints Built In</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              'Atomic stock deduction on challan confirmation — rolls back on insufficient stock',
              'Snapshot pricing captures product name, SKU, and price at time of challan creation',
              'Stock restoration when a confirmed challan is cancelled',
              'Negative stock guard prevents inventory from going below zero',
              'Sequential auto-generated challan numbers (CH-2026-00001)',
              'Audited stock movement trail for every inventory change (IN/OUT)',
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 18px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
              }}>
                <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FOOTER ===== */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(59,130,246,0.08)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-80px',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'rgba(99,102,241,0.06)',
        }} />

        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 800,
            color: '#ffffff',
            margin: '0 0 14px',
            letterSpacing: '-0.02em',
          }}>Ready to Streamline Your Operations?</h2>
          <p style={{
            fontSize: '1rem',
            color: '#94a3b8',
            lineHeight: 1.6,
            margin: '0 0 32px',
          }}>
            Sign in now and start managing your wholesale business with a modern, intuitive platform.
          </p>
          <button
            onClick={onGoToLogin}
            style={{
              padding: '14px 40px',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              border: 'none',
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 28px rgba(59,130,246,0.35)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 36px rgba(59,130,246,0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(59,130,246,0.35)';
            }}
          >
            Go to Login <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        background: '#0f172a',
        padding: '24px',
        textAlign: 'center',
        borderTop: '1px solid #1e293b',
      }}>
        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
          © {new Date().getFullYear()} Fundsroom Wholesale ERP. Built with Node.js, React, PostgreSQL & Prisma.
        </p>
      </footer>
    </div>
  );
}
