"use client";

import { useState } from 'react';
import Image from "next/image";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useMagneticButton } from "@/hooks/useMagneticButton";
import { Button } from "@/components/ui/button";
import { defaultLandingContent, type HeroContent } from "@/lib/landingContent";

type HeroProps = {
	content?: HeroContent;
};

export default function Hero({ content = defaultLandingContent.hero }: HeroProps) {
  const mouse = useMousePosition();
  const [menuOpen, setMenuOpen] = useState(false);
  const primaryBtn = useMagneticButton<HTMLAnchorElement>(0.25);
  const secondaryBtn = useMagneticButton<HTMLAnchorElement>(0.2);

  return (
		<section className='relative px-6 md:px-12 lg:px-20 pt-8 min-h-screen overflow-hidden'>
			{/* Navigation */}
			<nav className='z-20 relative flex justify-between items-center animate-reveal-fade delay-0'>
				<Image
					src='/LLLARIK Logo-08.png'
					alt='LLLARIK.id'
					width={300}
					height={300}
					priority
					className='w-60 h-auto'
				/>
				<div className='hidden md:flex items-center gap-8 text-[10px] text-muted-foreground uppercase tracking-[0.25em]'>
					<a
						href='#collection'
						className='hover:text-foreground transition-colors duration-300'
					>
						{content.navCollection}
					</a>
					<a
						href='#philosophy'
						className='hover:text-foreground transition-colors duration-300'
					>
						{content.navPhilosophy}
					</a>
					<a
						href='#lookbook'
						className='hover:text-foreground transition-colors duration-300'
					>
						{content.navSpaces}
					</a>
					<a
						href='#contact'
						className='hover:text-foreground transition-colors duration-300'
					>
						{content.navContact}
					</a>
				</div>
				<div className='md:hidden'>
					<button
						type='button'
						aria-expanded={menuOpen}
						aria-controls='mobile-nav'
						onClick={() => setMenuOpen((prev) => !prev)}
						className='text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-[0.25em] transition-colors duration-300 cursor-pointer'
					>
						{menuOpen ? 'Close' : 'Menu'}
					</button>
				</div>
			</nav>
			{menuOpen && (
				<div
					id='mobile-nav'
					className='md:hidden z-30 relative bg-background/95 backdrop-blur-sm mt-6 border border-border'
				>
					<div className='flex flex-col p-4'>
						{[
							{ label: content.navCollection, href: '#collection' },
							{ label: content.navPhilosophy, href: '#philosophy' },
							{ label: content.navSpaces, href: '#lookbook' },
							{ label: content.navContact, href: '#contact' },
						].map((item) => (
							<a
								key={item.href}
								href={item.href}
								onClick={() => setMenuOpen(false)}
								className='py-3 border-border border-b last:border-b-0 text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-[0.25em] transition-colors duration-300'
							>
								{item.label}
							</a>
						))}
					</div>
				</div>
			)}

			{/* Hero Content — Asymmetric Brutalist Grid */}
			<div className='z-10 relative items-end gap-6 grid grid-cols-1 lg:grid-cols-12 mt-16 md:mt-24 lg:mt-32 min-h-[70vh]'>
				{/* Left — Typography Block */}
				<div className='flex flex-col justify-end lg:col-span-7 pb-8 lg:pb-16'>
					<div className='animate-reveal-up delay-200'>
						<p className='mb-6 text-[10px] text-muted-foreground uppercase tracking-[0.4em]'>
							{content.estLine}
						</p>
					</div>

					<h1 className='font-bold text-[clamp(2rem,6vw,5rem)] uppercase leading-[0.95] tracking-tight animate-reveal-up delay-300'>
						{content.headlineLine1}
						<br />
						{content.headlineLine2}
						<br />
						<span className='font-normal text-muted-foreground italic normal-case'>
							{content.headlineAccent}
						</span>
					</h1>

					<div className='mt-8 md:mt-12 max-w-lg animate-reveal-up delay-500'>
						<p className='text-muted-foreground text-sm md:text-base leading-relaxed'>
							{content.bodyPrimary}
						</p>
						<p className='mt-3 text-muted-foreground/60 text-xs leading-relaxed'>
							{content.bodySecondary}
						</p>
					</div>

					{/* CTAs */}
					<div className='flex flex-wrap items-center gap-6 mt-10 animate-reveal-up delay-700'>
						<a
							onMouseMove={primaryBtn.handleMouseMove}
							onMouseLeave={primaryBtn.handleMouseLeave}
							href='#collection'
							className='magnetic-btn'
						>
							<Button className='bg-primary hover:bg-foreground/80 px-8 py-4 h-auto text-[10px] text-primary-foreground uppercase tracking-[0.25em] transition-colors duration-500 cursor-pointer'>
								{content.primaryCta}
								<svg
									width='14'
									height='14'
									viewBox='0 0 14 14'
									fill='none'
									className='ml-2'
								>
									<path
										d='M1 7h12M8 2l5 5-5 5'
										stroke='currentColor'
										strokeWidth='1.5'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								</svg>
							</Button>
						</a>
						<a
							onMouseMove={secondaryBtn.handleMouseMove}
							onMouseLeave={secondaryBtn.handleMouseLeave}
							href='#lookbook'
							className='inline-flex items-center gap-2 pb-1 border-foreground hover:border-muted-foreground border-b text-[10px] hover:text-muted-foreground uppercase tracking-[0.25em] transition-colors duration-500 magnetic-btn'
						>
							{content.secondaryCta}
						</a>
					</div>
				</div>

				{/* Right — Image Block with Parallax */}
				<div className='relative lg:col-span-5 lg:-mt-20'>
					<div
						className='relative w-full aspect-3/4 lg:aspect-4/5 overflow-hidden animate-reveal-right delay-400'
						style={{
							transform: `translate(${mouse.normalizedX * -8}px, ${mouse.normalizedY * -8}px)`,
							transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
						}}
					>
						<Image
							src={content.heroImage}
							alt={content.heroImageAlt}
							fill
							priority
							sizes='(max-width: 640px) 92vw, (max-width: 1024px) 86vw, 40vw'
							className='object-cover'
							style={{
								transform: `scale(1.05) translate(${mouse.normalizedX * 4}px, ${mouse.normalizedY * 4}px)`,
								transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
							}}
						/>
						<div className='right-4 bottom-4 absolute text-[9px] text-foreground/40 uppercase tracking-[0.2em] mix-blend-difference'>
							{content.heroBadge}
						</div>
					</div>

					<div className='-bottom-6 -left-6 absolute border border-foreground/15 w-32 h-32 animate-reveal-fade delay-800' />
				</div>
			</div>

			{/* Trust Signals */}
			<div className='z-10 relative flex flex-wrap gap-x-12 gap-y-3 mt-16 md:mt-20 pb-12 animate-reveal-up delay-1000'>
				{content.trustSignals.map((signal, i) => (
					<span
						key={signal}
						className='text-[10px] text-muted-foreground/50 uppercase tracking-[0.3em]'
						style={{ animationDelay: `${1000 + i * 150}ms` }}
					>
						◆ {signal}
					</span>
				))}
			</div>

			<div className='right-6 md:right-12 lg:right-20 bottom-0 left-6 md:left-12 lg:left-20 absolute bg-border h-px animate-line-grow delay-1200' />
		</section>
	);
}
