"use client";

import Image from "next/image";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useMagneticButton } from "@/hooks/useMagneticButton";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const mouse = useMousePosition();
  const primaryBtn = useMagneticButton<HTMLAnchorElement>(0.25);
  const secondaryBtn = useMagneticButton<HTMLAnchorElement>(0.2);

  return (
		<section className='relative px-6 md:px-12 lg:px-20 pt-8 min-h-screen overflow-hidden'>
			{/* Navigation */}
			<nav className='z-20 relative flex justify-between items-center animate-reveal-fade delay-0'>
				<Image
					src='/LLLARIK Logo-08.png'
					alt='LLLARIK.id'
					width={180}
					height={180}
					priority
					className='w-28 md:w-36 h-auto'
				/>
				<div className='hidden md:flex items-center gap-8 text-[10px] text-muted-foreground uppercase tracking-[0.25em]'>
					<a
						href='#collection'
						className='hover:text-foreground transition-colors duration-300'
					>
						Collection
					</a>
					<a
						href='#philosophy'
						className='hover:text-foreground transition-colors duration-300'
					>
						Philosophy
					</a>
					<a
						href='#spaces'
						className='hover:text-foreground transition-colors duration-300'
					>
						Spaces
					</a>
					<a
						href='#contact'
						className='hover:text-foreground transition-colors duration-300'
					>
						Contact
					</a>
				</div>
				<div className='md:hidden text-[10px] text-muted-foreground uppercase tracking-[0.25em]'>
					Menu
				</div>
			</nav>

			{/* Hero Content — Asymmetric Brutalist Grid */}
			<div className='z-10 relative items-end gap-6 grid grid-cols-1 lg:grid-cols-12 mt-16 md:mt-24 lg:mt-32 min-h-[70vh]'>
				{/* Left — Typography Block */}
				<div className='flex flex-col justify-end lg:col-span-7 pb-8 lg:pb-16'>
					<div className='animate-reveal-up delay-200'>
						<p className='mb-6 text-[10px] text-muted-foreground uppercase tracking-[0.4em]'>
							Est. 2026 — Jakarta, Indonesia
						</p>
					</div>

					<h1 className='font-bold text-[clamp(2rem,6vw,5rem)] uppercase leading-[0.95] tracking-tight animate-reveal-up delay-300'>
						Your Space
						<br />
						Should Speak
						<br />
						<span className='font-normal text-muted-foreground italic normal-case'>
							Before You Do
						</span>
					</h1>

					<div className='mt-8 md:mt-12 max-w-lg animate-reveal-up delay-500'>
						<p className='text-muted-foreground text-sm md:text-base leading-relaxed'>
							Curated mirrors for expressive living.
						</p>
						<p className='mt-3 text-muted-foreground/60 text-xs leading-relaxed'>
							Each piece is a quiet declaration — shaped to transform rooms into
							reflections of who you are.
						</p>
					</div>

					{/* CTAs */}
					<div className='flex flex-wrap items-center gap-6 mt-10 animate-reveal-up delay-700'>
						<a
							ref={primaryBtn.ref}
							onMouseMove={primaryBtn.handleMouseMove}
							onMouseLeave={primaryBtn.handleMouseLeave}
							href='#collection'
							className='magnetic-btn'
						>
							<Button className='bg-primary hover:bg-foreground/80 px-8 py-4 h-auto text-[10px] text-primary-foreground uppercase tracking-[0.25em] transition-colors duration-500 cursor-pointer'>
								Explore the Collection
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
							ref={secondaryBtn.ref}
							onMouseMove={secondaryBtn.handleMouseMove}
							onMouseLeave={secondaryBtn.handleMouseLeave}
							href='#spaces'
							className='inline-flex items-center gap-2 pb-1 border-foreground hover:border-muted-foreground border-b text-[10px] hover:text-muted-foreground uppercase tracking-[0.25em] transition-colors duration-500 magnetic-btn'
						>
							Enter the Space
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
							src='/products/01. SOLEN.jpg.jpeg'
							alt='Solen Standing Mirror — LLLARIK.id'
							fill
							priority
							sizes='(max-width: 1024px) 100vw, 40vw'
							className='object-cover'
							style={{
								transform: `scale(1.05) translate(${mouse.normalizedX * 4}px, ${mouse.normalizedY * 4}px)`,
								transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
							}}
						/>
						<div className='right-4 bottom-4 absolute text-[9px] text-foreground/40 uppercase tracking-[0.2em] mix-blend-difference'>
							Vol. 01 — The Essential
						</div>
					</div>

					<div className='-bottom-6 -left-6 absolute border border-foreground/15 w-32 h-32 animate-reveal-fade delay-800' />
				</div>
			</div>

			{/* Trust Signals */}
			<div className='z-10 relative flex flex-wrap gap-x-12 gap-y-3 mt-16 md:mt-20 pb-12 animate-reveal-up delay-1000'>
				{['Curated Pieces', 'Limited Editions', 'Crafted with Intent'].map(
					(signal, i) => (
						<span
							key={signal}
							className='text-[10px] text-muted-foreground/50 uppercase tracking-[0.3em]'
							style={{ animationDelay: `${1000 + i * 150}ms` }}
						>
							◆ {signal}
						</span>
					),
				)}
			</div>

			<div className='right-6 md:right-12 lg:right-20 bottom-0 left-6 md:left-12 lg:left-20 absolute bg-border h-px animate-line-grow delay-1200' />
		</section>
	);
}
