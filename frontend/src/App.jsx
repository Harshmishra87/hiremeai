import Home from "./pages/Home.jsx";
import { ResumeProvider } from "./context/ResumeContext.jsx";
import CustomCursor from "./components/CustomCursor.jsx";

export default function App() {
  return (
    <ResumeProvider>
      <CustomCursor />
      <Home />
    </ResumeProvider>
  );
}
