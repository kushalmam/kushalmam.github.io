import { useEffect, useState } from "react";
import { Star, GitFork, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Repo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  fork: boolean;
};

const langColor: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  "C++": "#f34b7d",
  Java: "#b07219",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Go: "#00ADD8",
  Rust: "#dea584",
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
};

const GitHubRepos = () => {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("https://api.github.com/users/Techdude01/repos?sort=updated&per_page=20")
      .then((r) => {
        if (!r.ok) throw new Error(`GitHub: ${r.status}`);
        return r.json();
      })
      .then((data: Repo[]) => {
        if (!active) return;
        const filtered = data.filter((r) => !r.fork).slice(0, 4);
        setRepos(filtered);
      })
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="github" className="relative py-28 md:py-36 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/90 mb-3">From GitHub</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Recent repositories</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Live from{" "}
            <a
              href="https://github.com/Techdude01"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline-offset-4 hover:underline"
            >
              @Techdude01
            </a>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!repos && !error &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="surface-card p-6">
                <Skeleton className="h-5 w-1/2 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-6" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}

          {error && (
            <div className="surface-card p-6 md:col-span-2 text-sm text-muted-foreground">
              Couldn't load live repos right now. Visit{" "}
              <a
                href="https://github.com/Techdude01"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline-offset-4 hover:underline"
              >
                github.com/Techdude01
              </a>
              .
            </div>
          )}

          {repos?.map((r) => (
            <a
              key={r.id}
              href={r.html_url}
              target="_blank"
              rel="noreferrer"
              className="surface-card surface-card-hover p-6 group block"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {r.name}
                </h3>
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.5rem]">
                {r.description || "No description provided."}
              </p>
              <div className="mt-5 flex items-center gap-5 text-xs text-muted-foreground">
                {r.language && (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: langColor[r.language] || "#888" }}
                    />
                    {r.language}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5" /> {r.stargazers_count}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <GitFork className="h-3.5 w-3.5" /> {r.forks_count}
                </span>
                <span className="ml-auto">Updated {formatDate(r.pushed_at)}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GitHubRepos;
