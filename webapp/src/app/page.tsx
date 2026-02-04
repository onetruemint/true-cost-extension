import {
  Nav,
  Hero,
  Stats,
  Features,
  HowItWorks,
  Calculator,
  Testimonials,
  CTA,
  Footer,
} from "@/components";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Calculator />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
