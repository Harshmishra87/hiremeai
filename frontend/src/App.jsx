import Home from "./pages/Home.jsx";
import { ResumeProvider } from "./context/ResumeContext.jsx";

export default function App() {
  return (
    <ResumeProvider>
      <Home />
    </ResumeProvider>
  );
}
