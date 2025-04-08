import Main from 'next/document';
import LandingSection from './main';
import About from './about';
import Services from './services';
import Contact from './contact';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (router.query.scrollTo) {
      const targetElement = document.getElementById(router.query.scrollTo);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [router.query.scrollTo]);
  return (
    <>
      <div className="flex flex-col justify-center items-center my-16 w-[80vw]">
        <LandingSection />
        <Services />
        <About />
        <Contact />
      </div>
    </>
  );
}
