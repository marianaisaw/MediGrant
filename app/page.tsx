'use client';

import { useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { Power3 } from 'gsap';
import Navbar from '@/components/Navbar';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function MediGrantPage() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    // GSAP ScrollTrigger for cards
    cardsRef.current.forEach((card) => {
      if (card) {
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 30 },
          {
            duration: 0.2,
            autoAlpha: 1,
            y: 0,
            ease: Power3.easeInOut,
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              end: 'bottom 60%',
              scrub: false,
            },
          }
        );
      }
    });

    return () => {
      // Clean up ScrollTrigger instances when component unmounts
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <>
      <Head>
        <title>MediGrant - AI-Powered Healthcare Research Funding</title>
        <link
          href="https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <motion.div
        className="min-h-screen text-white font-sf-pro relative overflow-hidden"
      >
        {/* Procedural noise overlay for depth */}
        <div className="pointer-events-none fixed inset-0 mix-blend-overlay opacity-30 animate-noise" />

        {/* Navbar Component */}
        <Navbar currentPage="home" />

        {/* Animated nebula background blobs */}
        <div className="fixed inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#3ABEFF]/ blur-[6em]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 15, repeat: Infinity, ease: [0.445, 0.05, 0.55, 0.95] }}
          />
          <motion.div
            className="absolute bottom-2/3 right-2/12 w-96 h-96 rounded-full bg-[#2F47C3] blur-[7em]"
            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 20, repeat: Infinity, ease: [0.445, 0.05, 0.55, 0.95] }}
          />
        </div>

        {/* Hero Section */}
        <section className="pt-32 pb-20 relative overflow-hidden">
          <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              className="lg:w-1/2 space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <h1 className="text-5xl font-bold leading-tight">
                Unlock Healthcare Research Funding with{' '}
                <span className="bg-gradient-to-r from-[#3ABEFF] to-[#6FDBFF] bg-clip-text text-transparent">
                  AI
                </span>
              </h1>
              <p className="text-[#B0C7D1] text-lg">
                80% of NIH funding goes to 20% of institutions. MediGrant helps
                small-to-midsize healthcare clinics access $84B+ in grants
                effortlessly.
              </p>
              <ul className="space-y-3">
                {[
                  'AI-powered grant writing & application support',
                  'Personalized funding matches',
                  'Expert compliance tracking and reminders',
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start"
                    whileHover={{ x: 10 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <div className="mt-1 mr-3 w-5 h-5 rounded-full bg-[#2FF7C3]/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#2FF7C3] animate-pulse" />
                    </div>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
              <motion.a
                href="/dashboard"
                className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-[#3ABEFF] to-[#6FDBFF] text-[#0A0F1C] font-bold overflow-hidden relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <span className="relative z-10">Get Started</span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#6FDBFF] to-[#3ABEFF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.a>
            </motion.div>

            <motion.div
              className="lg:w-1/2 flex justify-center perspective-1000"
              initial={{ rotateY: 145, opacity: 0 }}
              whileInView={{ rotateY: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0, 0, 0.58, 1] }}
            >
              <div
                className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden transform-style-preserve-3d hover:rotate-y-5 transition-transform duration-500"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Image
                  src="/hello.jpeg"
                  alt="MediGrant AI Interface"
                  fill
                  className="object-cover rounded-xl"
                />
                {/* Floating halo gradient */}
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle at center, rgba(58,190,255,0.1), transparent 70%)',
                  }}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why MediGrant Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16">
              Why{' '}
              <span className="bg-gradient-to-r from-[#3ABEFF] to-[#6FDBFF] bg-clip-text text-transparent">
                MediGrant?
              </span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Discover Grant Opportunities',
                  description:
                    'Instantly match your ideas with multiple funding opportunities tailored to your profile, experience, and research project. NIH, NSF, ARPA-H, AHRQ, Grants.gov, SAM.gov, PCORI, and more.',
                  color: 'from-[#3ABEFF] to-[#6FDBFF]',
                },
                {
                  title: 'Enhance Your Proposals',
                  description:
                    'Automatically improve clarity, structure, and impact with AI-powered writing assistance and expert recommendations.',
                  color: 'from-[#2FF7C3] to-[#3ABEFF]',
                },
                {
                  title: 'Simplify Your Documents',
                  description:
                    'Create essential documents, such as biographical sketches, tailored to each application, and ensure compliance with deadlines and guidelines.',
                  color: 'from-[#B0C7D1] to-[#3ABEFF]',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    if (el) cardsRef.current[index] = el;
                  }}
                  className="bg-[#0A0F1C]/60 backdrop-blur-md border border-[#3ABEFF]/20 rounded-2xl p-8 transition-all duration-500 hover:border-[#6FDBFF]/40 hover:shadow-[0_0_30px_rgba(58,190,255,0.2)] hover:-translate-y-2 opacity-0 translate-y-10"
                >
                  <div
                    className={`w-12 h-12 rounded-xl mb-6 bg-gradient-to-r ${feature.color} flex items-center justify-center text-[#0A0F1C] font-bold`}
                  >
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-[#B0C7D1]">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Co-pilot Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16">
              Meet Your{' '}
              <span className="bg-gradient-to-r from-[#3ABEFF] to-[#6FDBFF] bg-clip-text text-transparent">
                AI Co-pilot
              </span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: 'AI',
                  title: 'Personal Healthcare Consultant',
                  items: [
                    'Save time with instant, expert guidance',
                    'Faster, less confusing process',
                    'Strengthen your application with tailored recommendations',
                  ],
                  color: 'bg-[#3ABEFF]/10',
                },
                {
                  icon: '💡',
                  title: 'Tailored Opportunities',
                  items: [
                    'Get matched to grants based on your research and experience',
                    'Annual subscription + small commission on success',
                  ],
                  color: 'bg-[#2FF7C3]/10',
                },
                {
                  icon: '⚡',
                  title: 'Seamless Collaboration',
                  items: [
                    'Real-time proposal edits, reviews, and feedback',
                    'No more version confusion',
                  ],
                  color: 'bg-[#B0C7D1]/10',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    if (el) cardsRef.current[index + 3] = el;
                  }}
                  className={`${feature.color} backdrop-blur-md border border-[#3ABEFF]/20 rounded-2xl p-8 transition-all duration-500 hover:border-[#6FDBFF]/40 hover:shadow-[0_0_30px_rgba(58,190,255,0.2)] hover:-translate-y-2 opacity-0 translate-y-10`}
                >
                  <div className="w-12 h-12 rounded-xl mb-6 bg-[#0A0F1C] border border-[#3ABEFF]/30 flex items-center justify-center text-2xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <ul className="space-y-3">
                    {feature.items.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <div className="mt-1 mr-3 flex-shrink-0 w-2 h-2 rounded-full bg-[#3ABEFF]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Research AI Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0 lg:pr-12">
              <h2 className="text-3xl font-bold mb-8">
                Deep Research{' '}
                <span className="bg-gradient-to-r from-[#3ABEFF] to-[#6FDBFF] bg-clip-text text-transparent">
                  AI Multi-Agent Engine
                </span>{' '}
                for Scientific Accuracy
              </h2>
              <p className="text-[#B0C7D1] mb-6">
                MediGrant also features a multi-agent AI system that enhances
                proposal quality by automating literature search, analysis,
                summarization, and citation. Each agent focuses on a specialized
                task, ensuring accurate, relevant, and up-to-date research
                support throughout your draft.
              </p>
              <p className="text-[#B0C7D1]">
                With real-time PubMed integration and context-aware filtering,
                MediGrant surfaces high-impact, methodologically sound studies
                aligned with your objectives. Key insights are inserted directly
                into your proposal with inline citations, reducing hallucinations
                and strengthening scientific rigor.
              </p>
            </div>
            <div className="lg:w-1/2">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-[#3ABEFF]/30 hover:border-[#6FDBFF]/50 transition-all duration-500 group">
                <div className="absolute inset-0 bg-[#3ABEFF]/10 backdrop-blur-sm group-hover:backdrop-blur-md transition-all duration-500" />
                <div className="absolute inset-0.5 rounded-xl border border-[#3ABEFF]/20 group-hover:border-[#6FDBFF]/30 transition-all duration-500" />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="relative w-full h-full">
                    <Image
                      src="/researcher2.jpeg"
                      alt="Research AI Interface"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-6 text-center">
            <div
              ref={(el) => {
                if (el) cardsRef.current[6] = el;
              }}
              className="max-w-3xl mx-auto bg-[#0A0F1C]/60 backdrop-blur-md border border-[#3ABEFF]/20 rounded-2xl p-12 transition-all duration-500 hover:border-[#6FDBFF]/40 hover:shadow-[0_0_40px_rgba(58,190,255,0.3)] opacity-0 translate-y-10"
            >
              <h2 className="text-3xl font-bold mb-6">
                Ready to Secure Your{' '}
                <span className="bg-gradient-to-r from-[#3ABEFF] to-[#6FDBFF] bg-clip-text text-transparent">
                  Next Grant?
                </span>
              </h2>
              <p className="text-[#B0C7D1] mb-8 max-w-2xl mx-auto">
                Join the future of healthcare research funding with AI-powered
                tools designed to maximize your success rate.
              </p>
              <a
                href="#"
                className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-[#3ABEFF] to-[#6FDBFF] text-[#0A0F1C] font-bold hover:shadow-[0_0_40px_rgba(58,190,255,0.6)] transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">Request Early Access</span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#6FDBFF] to-[#3ABEFF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-[#3ABEFF]/10">
          <div className="container mx-auto px-6 text-center">
            <p className="text-[#B0C7D1]">
              &copy; {new Date().getFullYear()} MediGrant. All rights reserved.
            </p>
          </div>
        </footer>

        {/* Global Styles & Container Queries */}
        <style jsx global>{`
          @layer base {
            .perspective-1000 {
              perspective: 1000px;
            }
            .transform-style-preserve-3d {
              transform-style: preserve-3d;
            }
            .hover\\:rotate-y-5:hover {
              transform: rotateY(5deg);
            }
            .animate-noise {
              animation: noise 0.2s steps(10) infinite;
            }
          }

          @keyframes noise {
            0% {
              transform: translate(0, 0);
            }
            10% {
              transform: translate(-5%, -5%);
            }
            20% {
              transform: translate(5%, -5%);
            }
            30% {
              transform: translate(-5%, 5%);
            }
            40% {
              transform: translate(5%, 5%);
            }
            50% {
              transform: translate(-5%, -5%);
            }
            60% {
              transform: translate(5%, -5%);
            }
            70% {
              transform: translate(-5%, 5%);
            }
            80% {
              transform: translate(5%, 5%);
            }
            90% {
              transform: translate(-5%, -5%);
            }
            100% {
              transform: translate(0, 0);
            }
          }

          /* Container Query Example: adjust card padding on wide containers */
          @container (min-width: 400px) {
            .cap-card {
              padding: 3rem;
            }
          }
        `}</style>
      </motion.div>
    </>
  );
}
