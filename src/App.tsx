import { ThemeProvider } from "next-themes";
import { HashRouter, Route, Routes } from "react-router-dom";
import {
  AboutPage,
  EducationPage,
  ExperiencePage,
  PortfolioLayout,
  ResumePage,
  TechPage,
  WorkPage,
} from "./pages/PortfolioPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <HashRouter>
      <Routes>
        <Route element={<PortfolioLayout />}>
          <Route index element={<AboutPage />} />
          <Route path="work" element={<WorkPage />} />
          <Route path="experience" element={<ExperiencePage />} />
          <Route path="education" element={<EducationPage />} />
          <Route path="tech" element={<TechPage />} />
          <Route path="resume" element={<ResumePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  </ThemeProvider>
);

export default App;
