import { portfolioProjects } from "../src/portfolioProjects";
import { PORTRAIT_SIZES, PROJECT_SIZES, variantSrcSet } from "../src/imageVariants";

const escape = (text: string) => text.replace(/[&<>"']/g, character =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);

/** Keep the same four projects and contact links available before React loads. */
export function staticFallback(base: string) {
  const srcSet = (relativePath: string, width: number, format: "avif" | "webp") =>
    variantSrcSet(relativePath, width, format, path => `${base}${path}`);

  return `<main class="static-fallback">
    <h1>Kushal Mamillapalli</h1><p>Data Engineer</p>
    <section><picture><source type="image/avif" srcset="${srcSet("images/portrait.jpg", 720, "avif")}" sizes="${PORTRAIT_SIZES}" /><source type="image/webp" srcset="${srcSet("images/portrait.jpg", 720, "webp")}" sizes="${PORTRAIT_SIZES}" /><img src="${base}images/portrait.jpg" alt="Kushal overlooking the New York skyline" width="280" height="276" /></picture><h2>Data pipelines. Real impact.</h2><p>Data Engineer at Spotify. NYU Tandon ’26.</p><p>I build data pipelines and recommendation systems that turn messy inputs into reliable products.</p></section>
    <section><h2>Selected work</h2><div class="project-grid">${portfolioProjects.map(project => `<article><a href="${escape(project.href)}"><picture><source type="image/avif" srcset="${srcSet(`images/projects/${project.image}`, project.width, "avif")}" sizes="${PROJECT_SIZES}" /><source type="image/webp" srcset="${srcSet(`images/projects/${project.image}`, project.width, "webp")}" sizes="${PROJECT_SIZES}" /><img src="${base}images/projects/${escape(project.image)}" alt="${escape(project.alt)}" width="${project.width}" height="${project.height}" /></picture><h3>${escape(project.name)}</h3><p>${escape(project.description)}</p></a></article>`).join("")}</div></section>
    <section><h2>Let’s talk.</h2><p><a href="mailto:kushalmam06@gmail.com">kushalmam06@gmail.com</a></p><p><a href="${base}documents/kushal-mamillapalli-resume.pdf">Résumé (PDF)</a> · <a href="https://github.com/Techdude01">GitHub</a> · <a href="https://linkedin.com/in/kushal-mamillapalli">LinkedIn</a></p><p><a href="${base}privacy/">Privacy</a></p></section>
  </main>`;
}
