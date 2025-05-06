import AnimatedBackground from '@/components/AnimatedBackground';
import Hero from '@/components/Hero';
import Logo from '@/components/Logo';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <Logo />
      <Hero />
    </main>
  );
}
