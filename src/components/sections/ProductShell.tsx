import {
  Activity,
  BriefcaseBusiness,
  Cpu,
  Github,
  GraduationCap,
  Home,
  Linkedin,
  Mail,
  Sparkles,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import GrainFilter from "@/components/sections/GrainFilter";
import SmokeBackground from "@/components/legacy/SmokeBackground";
import ThemeSlider from "@/components/sections/ThemeSlider";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Overview", number: "01", Icon: Home },
  { to: "/interests", label: "Interests", number: "02", Icon: Sparkles },
  { to: "/projects", label: "Projects", number: "03", Icon: Cpu },
  { to: "/experience", label: "Experience", number: "04", Icon: BriefcaseBusiness },
  { to: "/education", label: "Education", number: "05", Icon: GraduationCap },
  { to: "/contact", label: "Contact", number: "06", Icon: Mail },
];

const socialLinks = [
  {
    href: "mailto:km6238@nyu.edu",
    label: "Email",
    Icon: Mail,
  },
  {
    href: "https://github.com/Techdude01",
    label: "GitHub",
    Icon: Github,
  },
  {
    href: "https://linkedin.com/in/kushal-mamillapalli",
    label: "LinkedIn",
    Icon: Linkedin,
  },
];

const ProductShell = () => {
  return (
    <div className="product-shell min-h-screen text-foreground">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <GrainFilter />
      <SmokeBackground />

      <aside className="product-sidebar" aria-label="Primary navigation">
        <Link to="/" className="sidebar-logo" aria-label="Kushal Mamillapalli overview">
          <span aria-hidden="true">K</span>
        </Link>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, number }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn("sidebar-link", isActive && "sidebar-link-active")
              }
            >
              <span className="sidebar-link-number">{number}</span>
              <span className="sidebar-link-label">{label}</span>
              <span className="sidebar-link-dot" aria-hidden="true" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-theme">
            <ThemeSlider />
          </div>

          <div className="sidebar-socials">
            {socialLinks.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="sidebar-social-link"
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>
      </aside>

      <header className="mobile-topbar">
        <Link to="/" className="mobile-logo" aria-label="Kushal Mamillapalli overview">
          K
        </Link>
        <div className="mobile-status">
          <Activity className="h-3.5 w-3.5" aria-hidden="true" />
          Open for systems roles
        </div>
      </header>

      <nav className="mobile-dock" aria-label="Mobile navigation">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            aria-label={label}
            className={({ isActive }) =>
              cn("mobile-dock-link", isActive && "mobile-dock-link-active")
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <main id="main-content" className="product-stage" tabIndex={-1}>
        <section className="product-viewport">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default ProductShell;
