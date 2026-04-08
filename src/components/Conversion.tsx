"use client";

import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useMagneticButton } from "@/hooks/useMagneticButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Conversion() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const titleRef = useScrollReveal<HTMLDivElement>("up");
  const formRef = useScrollReveal<HTMLDivElement>("up");
  const submitBtn = useMagneticButton<HTMLButtonElement>(0.15);
  const lookbookBtn = useMagneticButton<HTMLAnchorElement>(0.2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
		<section
			id='contact'
			className='relative px-6 md:px-12 lg:px-20 py-32 md:py-48'
		>
			<div className='gap-16 lg:gap-6 grid grid-cols-1 lg:grid-cols-12'>
				{/* Left — Headline + Context */}
				<div
					ref={titleRef}
					className='flex flex-col justify-center lg:col-span-5'
				>
					<p className='mb-6 text-[10px] text-muted-foreground uppercase tracking-[0.4em]'>
						Begin Here
					</p>
					<h2 className='font-bold lg:text-[2.75rem] text-3xl md:text-4xl uppercase leading-[1.05] tracking-tight'>
						Make Your Space
						<br />
						<span className='font-normal italic normal-case'>
							Unmistakably Yubours
						</span>
					</h2>
					<p className='mt-6 max-w-md text-muted-foreground text-sm leading-relaxed'>
						Whether you&apos;re furnishing a new home, redesigning a room, or
						seeking a single statement piece — we&apos;ll guide you through our
						curated collection.
					</p>

					<a
						onMouseMove={lookbookBtn.handleMouseMove}
						onMouseLeave={lookbookBtn.handleMouseLeave}
						href='#lookbook'
						className='inline-flex items-center gap-3 mt-8 pb-1 border-foreground/30 hover:border-foreground border-b w-fit text-[10px] hover:text-foreground uppercase tracking-[0.25em] transition-colors duration-500 magnetic-btn'
					>
						View Lookbook
						<svg width='12' height='12' viewBox='0 0 12 12' fill='none'>
							<path
								d='M1 11L11 1M11 1H4M11 1v7'
								stroke='currentColor'
								strokeWidth='1.2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</a>

					<div className='hidden lg:block relative mt-16 border border-border w-24 h-24'>
						<div className='-right-3 -bottom-3 absolute border border-foreground/15 w-24 h-24' />
					</div>
				</div>

				{/* Right — Form */}
				<div ref={formRef} className='lg:col-span-6 lg:col-start-7'>
					{!isSubmitted ? (
						<form onSubmit={handleSubmit} className='space-y-8'>
							<div>
								<label className='block mb-3 text-[10px] text-muted-foreground uppercase tracking-[0.4em]'>
									Your Name
								</label>
								<Input
									type='text'
									required
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									className='bg-transparent px-0 pb-3 border-0 border-border focus-visible:border-foreground border-b rounded-none focus-visible:ring-0 w-full h-auto text-foreground placeholder:text-muted-foreground/30 text-base transition-colors duration-300'
									placeholder='e.g., Andi Pratama'
								/>
							</div>

							<div>
								<label className='block mb-3 text-[10px] text-muted-foreground uppercase tracking-[0.4em]'>
									Email Address
								</label>
								<Input
									type='email'
									required
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									className='bg-transparent px-0 pb-3 border-0 border-border focus-visible:border-foreground border-b rounded-none focus-visible:ring-0 w-full h-auto text-foreground placeholder:text-muted-foreground/30 text-base transition-colors duration-300'
									placeholder='your@email.com'
								/>
							</div>

							<div>
								<label className='block mb-3 text-[10px] text-muted-foreground uppercase tracking-[0.4em]'>
									Project Type
								</label>
								<div className='gap-3 grid grid-cols-2'>
									{[
										'New Home',
										'Room Redesign',
										'Single Piece',
										'Commercial Space',
									].map((type) => (
										<Button
											key={type}
											type='button'
											variant='outline'
											onClick={() =>
												setFormData({ ...formData, projectType: type })
											}
											className={`h-auto py-3 px-4 text-[10px] tracking-[0.15em] uppercase justify-start transition-all duration-300 cursor-pointer ${
												formData.projectType === type
													? 'border-foreground bg-foreground/5 text-foreground'
													: 'border-border text-muted-foreground hover:border-foreground/30'
											}`}
										>
											{type}
										</Button>
									))}
								</div>
							</div>

							<button
								onMouseMove={submitBtn.handleMouseMove}
								onMouseLeave={submitBtn.handleMouseLeave}
								type='submit'
								className='bg-primary hover:bg-foreground/80 mt-4 py-5 w-full text-[10px] text-primary-foreground uppercase tracking-[0.25em] transition-colors duration-500 cursor-pointer magnetic-btn'
							>
								Start Your Space
							</button>

							<p className='text-[9px] text-muted-foreground/40 text-center uppercase tracking-wider'>
								Consultation is complimentary. No commitment required.
							</p>
						</form>
					) : (
						<div className='flex flex-col justify-center items-center py-16 text-center animate-reveal-up'>
							<div className='flex justify-center items-center mb-6 border-2 border-foreground w-16 h-16'>
								<svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
									<path
										d='M5 12l5 5L19 7'
										stroke='#0A0A0A'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								</svg>
							</div>
							<h3 className='mb-3 font-bold text-xl uppercase tracking-tight'>
								We&apos;ll Be in Touch
							</h3>
							<p className='max-w-sm text-muted-foreground text-sm'>
								Thank you, {formData.name}. Our team will reach out within 24
								hours to begin curating your space.
							</p>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
