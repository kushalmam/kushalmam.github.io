import EditorialPortfolio from "./components/EditorialPortfolio";
import { ReactLenis } from "lenis/react";

const App = () => <ReactLenis root options={{ lerp: .12, stopInertiaOnNavigate: true }}>
  <EditorialPortfolio />
</ReactLenis>;

export default App;
