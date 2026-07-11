import LandingPage from "@/components/LandingPage";
import App from "@/components/App";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <LandingPage />
      <App />
    </main>
  );
}