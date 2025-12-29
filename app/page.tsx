import NavigationBar from "./components/NavigationBar";
import Header from "./components/Header";
import Logotypes from "./components/Logotypes";
import Attribution from "./components/Attribution";
import HeadingSubheading from "./components/HeadingSubheading";
import Services from "./components/Services";
import CTA from "./components/CTA";
import CaseStudies from "./components/CaseStudies";
import Process from "./components/Process";

import Testimonials from "./components/Testimonials";

import Footer from "./components/Footer";

export default async function Home() {
  return (
    <div className="relative pt-[60px] max-sm:pt-[30px]">
      <NavigationBar />
      <Header className="mt-[70px] max-sm:mt-[40px]" />
      <Logotypes className="mt-[70px] max-sm:mt-[40px]" />
      <HeadingSubheading
        className="mt-[140px] max-lg:mt-[100px] max-sm:mt-[60px]"
        heading="Features"
        subheading="Everything you need to build a transparent, community-driven product roadmap."
      />
      <Services className="mt-[80px] max-lg:mt-[60px] max-sm:mt-[40px]" />
      <CTA className="mt-[100px] max-sm:mt-[40px]" />
      <HeadingSubheading
        className="mt-[140px] max-lg:mt-[100px] max-sm:mt-[60px]"
        heading="Who uses Loom?"
        subheading="Designed for modern builders who value transparency and aesthetics."
      />
      <CaseStudies className="mt-[80px] max-lg:mt-[60px] max-sm:mt-[40px]" />
      <HeadingSubheading
        className="mt-[140px] max-lg:mt-[100px] max-sm:mt-[60px] max-md:flex-col"
        heading="How it Works"
        subheading="Turn threaded discussions into a beautiful roadmap in minutes."
        subheadingClassName="max-w-[500px]"
      />
      <Process className="mt-[80px] max-lg:mt-[60px] max-sm:mt-[40px]" />

      <HeadingSubheading
        className="mt-[100px] max-lg:mt-[80px] max-sm:mt-[60px]"
        heading="Community Love"
        subheading="Hear from makers building in public with Loom."
        subheadingClassName="max-w-[473px]"
      />
      <Testimonials className="mt-[80px] max-lg:mt-[60px] max-sm:mt-[40px]" />

      <Footer className="mt-[140px] max-lg:mt-[100px] max-sm:mt-[60px]" />
      <Attribution />
    </div>
  );
}
