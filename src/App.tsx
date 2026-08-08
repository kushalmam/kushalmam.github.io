import { ThemeProvider } from "next-themes";
import { HashRouter, Route, Routes } from "react-router-dom";
import {
  AboutPage,
  ContactPage,
  PortfolioLayout,
  ProjectsPage,
  ResumePage,
} from "./pages/PortfolioPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <HashRouter>
      <Routes>
        <Route element={<PortfolioLayout />}>
          <Route index element={<AboutPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="resume" element={<ResumePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  </ThemeProvider>
);

export default App;
