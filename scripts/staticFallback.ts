import { experiences, projects } from "../src/content";

const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );

/** Build-time HTML keeps project evidence and navigation available without JS. */
export function staticFallback(base: string) {
  return `<main class="static-fallback">
    <p>Kushal Mamillapalli · Data Engineer at Spotify</p>
    <h1>Behind the <em>interface.</em></h1>
    <p>I’m Kushal. I build data pipelines and recommendation systems.</p>
    <section><h2>About</h2><p>A 2026 Computer Science graduate from NYU Tandon, working on personalization data pipelines at Spotify. My work spans university data pipelines, computer vision for competition robots, and applied ML.</p><p>Outside of work, I enjoy building Gunpla, playing basketball, and watching murder mysteries.</p></section>
    <section><h2>Experience</h2>${experiences.map((entry) => `<article><h3>${escape(entry.name)}</h3><p>${escape(entry.period)}</p><p>${escape(entry.role)}</p><p>${escape(entry.detail)}</p>${entry.previous ? `<p>${escape(entry.previous)}</p>` : ""}</article>`).join("")}</section>
    <section><h2>Selected work</h2>${projects.map((project) => `<article><h3>${escape(project.name)}</h3><p>${escape(project.detail)}</p><p>${escape(project.contribution)}</p><p>${escape(project.stack)}</p><p><strong>${escape(project.evidenceValue + " " + project.evidenceUnit.trim())}</strong> · ${escape(project.context)}</p>${project.caseStudy.map((part) => `<p><strong>${escape(part.title)}.</strong> ${escape(part.text)}</p>`).join("")}${project.sources.map((source) => `<p><a href="${escape(source.href)}">${escape(source.label)} ↗</a></p>`).join("")}</article>`).join("")}</section>
    <section><h2>Let’s build something useful.</h2><p><a href="mailto:kushalmam06@gmail.com">kushalmam06@gmail.com</a></p><p><a href="${base}documents/kushal-mamillapalli-resume.pdf">Résumé (PDF)</a> · <a href="https://github.com/Techdude01">GitHub</a> · <a href="https://linkedin.com/in/kushal-mamillapalli">LinkedIn</a></p></section>
  </main>`;
}
