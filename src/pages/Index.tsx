import { useEffect } from "react";
import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import GitHubRepos from "@/components/sections/GitHubRepos";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import GrainFilter from "@/components/sections/GrainFilter";
import SiteBackground from "@/components/sections/SiteBackground";

const Index = () => {
  useEffect(() => {
    document.title = "Kushal Mamillapalli — Software Engineer";
    const desc =
      "Portfolio of Kushal Mamillapalli — NYU CS. I like building low-latency systems, data pipelines, and useful tools.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    const setOg = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", prop);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setOg("og:title", "Kushal Mamillapalli — Software Engineer");
    setOg("og:description", desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.origin + "/");
  }, []);

  return (
    <div className="relative min-h-screen text-foreground">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <GrainFilter />
      <SiteBackground />
      <Nav />
      <main id="main-content" className="relative z-0" tabIndex={-1}>
        <Hero />
        <div className="middle-page-surface">
          <Projects />
          <GitHubRepos />
          <About />
        </div>
        <Contact />
      </main>
    </div>
  );
};

export default Index;
