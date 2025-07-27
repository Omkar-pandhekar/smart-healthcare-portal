import Header from "@/components/layouts/header";
// import Landing from "./(nondashboard)/landing/page";
import Footer from "@/components/layouts/footer";
import LandingPage from "@/components/Home/Home";

export default function Home() {
  return (
    <div className="h-full w-full">
      <Header />
      <main className={`h-full flex w-full flex-col`}>
        <LandingPage />
      </main>
      <Footer />
    </div>
  );
}
