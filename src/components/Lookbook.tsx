"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Separator } from "@/components/ui/separator";
import {
  defaultLandingContent,
  type LookbookContent,
  type LookbookSpread as LookbookSpreadItem,
} from "@/lib/landingContent";

function LookbookSpread({
  spread,
  index,
}: {
  spread: LookbookSpreadItem;
  index: number;
}) {
  const imageRef = useScrollReveal<HTMLDivElement>(
    spread.position === "left" ? "left" : "right"
  );
  const textRef = useScrollReveal<HTMLDivElement>("up");

  const isLeft = spread.position === "left";

  return (
		<div
			className={`grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-0 items-center ${
				index > 0 ? 'mt-24 md:mt-32' : ''
			}`}
		>
			{/* Image */}
			<div
				ref={imageRef}
				className={`relative overflow-hidden ${
					isLeft
						? 'lg:col-span-7 lg:col-start-1'
						: 'lg:col-span-7 lg:col-start-6 lg:row-start-1'
				}`}
			>
				<div className='relative w-full aspect-3/4'>
					<Image
						src={spread.image}
						alt={`${spread.title} — LLLARIK.id Lookbook`}
						fill
						loading='lazy'
						sizes='(max-width: 1024px) 100vw, 58vw'
						className='object-cover'
					/>
				</div>
			</div>

			{/* Text */}
			<div
				ref={textRef}
				className={`flex flex-col justify-center ${
					isLeft
						? 'lg:col-span-4 lg:col-start-9 lg:pl-8'
						: 'lg:col-span-4 lg:col-start-1 lg:pr-8 lg:row-start-1'
				}`}
			>
				<p className='mb-3 text-[10px] text-muted-foreground uppercase tracking-[0.4em]'>
					{String(index + 1).padStart(2, '0')} — {spread.subtitle}
				</p>
				<h3 className='font-bold text-3xl md:text-4xl uppercase tracking-tight'>
					{spread.title}
				</h3>
				<p className='mt-4 max-w-sm text-muted-foreground text-sm leading-relaxed'>
					{spread.caption}
				</p>
				<div className='bg-foreground mt-6 w-12 h-px' />
			</div>
		</div>
	);
}

type LookbookProps = {
  spreads?: LookbookSpreadItem[];
  content?: LookbookContent;
};

export default function Lookbook({
  spreads = defaultLandingContent.lookbookSpreads,
  content = defaultLandingContent.lookbook,
}: LookbookProps) {
  const titleRef = useScrollReveal<HTMLDivElement>("up");

  return (
		<section
			id='lookbook'
			className='relative px-6 md:px-12 lg:px-20 py-32 md:py-48'
		>
			<div ref={titleRef} className='mb-20 md:mb-28'>
				<div className='flex items-center gap-6 mb-6'>
					<p className='text-[10px] text-muted-foreground uppercase tracking-[0.4em] shrink-0'>
						{content.label}
					</p>
					<Separator className='flex-1' />
				</div>
				<h2 className='max-w-3xl font-bold text-3xl md:text-4xl lg:text-5xl uppercase leading-[1.05] tracking-tight'>
					{content.headingLine1}
					<br />
					<span className='font-normal italic normal-case'>
						{content.headingAccent}
					</span>
				</h2>
				<p className='mt-6 max-w-md text-muted-foreground text-xs leading-relaxed'>
					{content.intro}
				</p>
			</div>

			{/* Editorial Spreads */}
			{spreads.map((spread, i) => (
				<LookbookSpread key={spread.title} spread={spread} index={i} />
			))}

			{/* Closing editorial line */}
			<div className='flex items-center gap-6 mt-24 md:mt-32'>
				<Separator className='flex-1' />
				<p className='text-[10px] text-muted-foreground/50 uppercase tracking-[0.3em] shrink-0'>
					{content.closingLine}
				</p>
				<Separator className='flex-1' />
			</div>
		</section>
	);
}
