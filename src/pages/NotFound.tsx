import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="not-found-page">
      <section className="not-found-card" aria-labelledby="not-found-heading">
        <p className="eyebrow">404</p>
        <h1 id="not-found-heading">That page is not here.</h1>
        <p>
          The path <span>{location.pathname}</span> does not resolve to a portfolio
          section.
        </p>
        <Link to="/" className="text-link">
          Return home
        </Link>
      </section>
    </main>
  );
};

export default NotFound;
