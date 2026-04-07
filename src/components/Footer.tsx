"use client";

import { useState } from "react";
import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const footerRef = useScrollReveal<HTMLElement>("up");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
		<footer
			ref={footerRef}
			className='relative px-6 md:px-12 lg:px-20 pt-16 pb-8'
		>
			<Separator className='mb-16' />

			<div className='gap-12 lg:gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12'>
				{/* Brand Column */}
				<div className='lg:col-span-4'>
					<Image
						src='/LLLARIK Logo-08.png'
						alt='LLLARIK.id'
						width={240}
						height={240}
						className='w-60 h-auto'
					/>
					<p className='max-w-xs text-muted-foreground text-xs leading-relaxed'>
						Design-driven furniture for those who believe a room should feel
						like an extension of self.
					</p>
					<p className='mt-6 text-[9px] text-muted-foreground/40 uppercase tracking-[0.2em]'>
						Jakarta, Indonesia
					</p>
				</div>

				{/* Navigation */}
				<div className='lg:col-span-2 lg:col-start-6'>
					<p className='mb-4 text-[10px] text-muted-foreground/50 uppercase tracking-[0.4em]'>
						Navigate
					</p>
					<nav className='flex flex-col gap-3'>
						{['Collection', 'Philosophy', 'Lookbook', 'Spaces', 'Contact'].map(
							(link) => (
								<a
									key={link}
									href={`#${link.toLowerCase()}`}
									className='w-fit text-muted-foreground hover:text-foreground text-xs transition-colors duration-300'
								>
									{link}
								</a>
							),
						)}
					</nav>
				</div>

				{/* Social */}
				<div className='lg:col-span-2'>
					<p className='mb-4 text-[10px] text-muted-foreground/50 uppercase tracking-[0.4em]'>
						Connect
					</p>
					<nav className='flex flex-col gap-3'>
						{[
							{ name: 'Instagram', href: '#' },
							{ name: 'Pinterest', href: '#' },
							{ name: 'LinkedIn', href: '#' },
						].map((social) => (
							<a
								key={social.name}
								href={social.href}
								className='w-fit text-muted-foreground hover:text-foreground text-xs transition-colors duration-300'
							>
								{social.name}
							</a>
						))}
					</nav>
				</div>

				{/* Newsletter */}
				<div className='lg:col-span-4'>
					<p className='mb-4 text-[10px] text-muted-foreground/50 uppercase tracking-[0.4em]'>
						Newsletter
					</p>
					<p className='mb-4 text-muted-foreground text-xs leading-relaxed'>
						Get curated drops, not spam.
					</p>
					{!subscribed ? (
						<form onSubmit={handleSubscribe} className='flex gap-0'>
							<Input
								type='email'
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder='your@email.com'
								className='flex-1 bg-transparent px-4 py-3 border border-border focus-visible:border-foreground border-r-0 rounded-none focus-visible:ring-0 h-auto text-foreground placeholder:text-muted-foreground/30 text-xs transition-colors duration-300'
							/>
							<Button
								type='submit'
								className='bg-primary hover:bg-foreground/80 px-6 py-3 h-auto text-[10px] text-primary-foreground uppercase tracking-[0.2em] transition-colors duration-500 cursor-pointer shrink-0'
							>
								Join
							</Button>
						</form>
					) : (
						<p className='text-foreground text-xs tracking-wider'>
							✓ Welcome to the inner circle.
						</p>
					)}
				</div>
			</div>

			{/* Bottom Bar */}
			<div className='flex md:flex-row flex-col justify-between items-center gap-4 mt-16 pt-8 border-border border-t'>
				<p className='text-[9px] text-muted-foreground/30 uppercase tracking-[0.2em]'>
					© 2026 LLLARIK.id — All rights reserved
				</p>
				<div className='flex items-center gap-6'>
					<a
						href='#'
						className='text-[9px] text-muted-foreground/30 hover:text-muted-foreground uppercase tracking-[0.2em] transition-colors'
					>
						Privacy
					</a>
					<a
						href='#'
						className='text-[9px] text-muted-foreground/30 hover:text-muted-foreground uppercase tracking-[0.2em] transition-colors'
					>
						Terms
					</a>
				</div>
			</div>
		</footer>
	);
}
