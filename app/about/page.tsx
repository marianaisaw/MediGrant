'use client';

import React, { useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { Power3 } from 'gsap';
import Navbar from '@/components/Navbar';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const founders = [
  {
    name: 'Mariana Gonzalez',
    role: 'CEO',
    image: '/mariana.jpeg',
    desc: `Mariana, co-founder and CEO of MediGrant, is a Biomedical Computation student at Stanford University passionate about health equity in Latin America. After building OSLER AI for chronic disease detection at just 15, she launched MediGrant to help underserved researchers access $84B+ in healthcare funding through AI-powered grant support.`,
    link: 'https://www.linkedin.com/in/mariana-isabel-ferrer-8a4ba4207/',
  },
  {
    name: 'Luis Oyson',
    role: 'COO',
    image: '/luis.jpeg',
    desc: `Luis, co-founder and COO of MediGrant, is a Stanford undergrad studying Computer Science and Economics. With a passion for applied AI and global access to innovation, he helped launch MediGrant to streamline healthcare grant access for under-resourced researchers using AI-driven tools.`,
    link: 'https://www.linkedin.com/in/luis-miguel-antiporda-oyson-5663a0345/',
  },
  {
    name: 'Joseph Karam',
    role: 'CTO',
    image: '/joseph.jpeg',
    desc: `Joseph, co-founder and CTO of MediGrant, brings deep expertise in enterprise software and scalable systems. With a background in team building and engineering high-impact solutions, he leads MediGrant’s tech strategy to deliver efficient, AI-powered tools that simplify healthcare grant access.`,
    link: 'https://www.linkedin.com/in/josephkaram7/',
  },
];

export default function AboutPage() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    cardsRef.current.forEach((card) => {
      if (card) {
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 30 },
          {
            duration: 0.4,
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

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <>
      <Head>
        <title>About – MediGrant</title>
        <link
          href="https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <motion.div className="min-h-screen text-white font-sf-pro relative overflow-hidden">
        {/* Navbar Component */}
        <Navbar currentPage="about" />

        {/* About Section */}
        <section className="pt-32 pb-20 bg-[#0A0F1C]/60 backdrop-blur-md relative">
          <div className="container mx-auto px-6 space-y-16">
            {/* OUR STORY */}
            <div>
              <div className="text-sm uppercase text-white font-semibold mb-3">Our Story</div>
              <h2 className="text-3xl font-bold mb-8">
                Why{' '}
                <span className="bg-gradient-to-r from-[#3ABEFF] to-[#6FDBFF] bg-clip-text text-transparent">
                  MediGrant
                </span>
              </h2>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="prose prose-invert max-w-3xl space-y-4 text-[#B0C7D1]"
              >
                <p>
                  We started MediGrant after taking a Medical Device Innovation class
                  at Stanford and realizing how broken the research grant process is,
                  especially for small clinics and independent researchers. It&apos;s time‐
                  consuming, full of unclear requirements, and often requires hiring
                  expensive consultants just to stand a chance.
                </p>
                <p>
                  We&apos;ve experienced this firsthand, doing research at Stanford, and
                  kept hearing the same frustration from others: researchers wasting
                  months just to figure out how to write the proper proposal. So we
                  started asking questions—scientists, small clinic staff, VCs—and
                  everyone told us the same thing: the system is too hard to navigate,
                  and it&apos;s keeping a lot of good science from getting funded.
                </p>
                <p>
                  That&apos;s when we realized the core problem: there&apos;s over $84B in grant
                  funding in healthcare in the U.S., but 77% of small-to-midsize
                  healthcare orgs don&apos;t even apply because they don&apos;t know how or
                  can&apos;t afford help. If you&apos;re not already in the system, you&apos;re locked
                  out. That&apos;s what we&apos;re fixing.
                </p>
              </motion.div>
            </div>

            {/* LEADERSHIP */}
            <div>
              <div className="text-sm uppercase text-white font-semibold mb-3">Leadership</div>
              <h2 className="text-3xl font-bold mb-8">
                Our{' '}
                <span className="bg-gradient-to-r from-[#3ABEFF] to-[#6FDBFF] bg-clip-text text-transparent">
                  Founders
                </span>
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {founders.map((f, i) => (
                  <div
                    key={i}
                    ref={(el) => {
                      if (el) cardsRef.current[i] = el;
                    }}
                    className="bg-[#0A0F1C]/60 backdrop-blur-md border border-[#3ABEFF]/20 rounded-2xl p-8 opacity-0 translate-y-10"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.2 }}
                      className="space-y-4"
                    >
                      <div className="relative w-full aspect-square h-64 rounded-2xl overflow-hidden">
                        <Image src={f.image} alt={f.name} fill className="object-cover" />
                      </div>
                      <div className="text-xl font-bold">{f.name}</div>
                      <div className="text-white uppercase font-medium">{f.role}</div>
                      <p className="text-[#B0C7D1] text-sm">{f.desc}</p>
                      <a
                        href={f.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 font-medium hover:text-[#3ABEFF]"
                      >
                        <img
                          src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg"
                          alt="LinkedIn"
                          className="w-5 h-5"
                        />
                        <span>LinkedIn</span>
                      </a>
                    </motion.div>
                  </div>
                ))}
              </div>
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
      </motion.div>
    </>
  );
}
