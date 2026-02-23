"use client";

import { CUSTOMERS } from "../data/superpowers";

export const CustomerLogosSection = () => (
  <div className="relative z-10 mt-24 w-full">
    <p className="font-landing text-center text-sm font-medium tracking-wide text-neutral-500 uppercase">
      Used by humans at
    </p>
    <div className="relative mt-2 mb-8 h-[80px] w-full overflow-hidden logo-marquee-fade">
      <div className="logo-marquee-track">
        {/* First copy */}
        {CUSTOMERS.map((company) => (
          <a
            key={`a-${company.slug}`}
            href={`${company.url}?utm_source=reanimate.sh&utm_medium=website&utm_campaign=customer_logos`}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={company.name}
            className="logoloop-item flex shrink-0 items-center opacity-70 hover:opacity-100 transition-opacity"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/logos/customers/${company.slug}.${company.ext}`}
              alt={company.name}
              loading="lazy"
              decoding="async"
              draggable={false}
              style={{
                height: `${company.height}px`,
                width: "auto",
                display: "block",
                objectFit: "contain",
                filter: company.filter,
              }}
            />
          </a>
        ))}
        {/* Second copy for seamless loop */}
        {CUSTOMERS.map((company) => (
          <a
            key={`b-${company.slug}`}
            href={`${company.url}?utm_source=reanimate.sh&utm_medium=website&utm_campaign=customer_logos`}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={company.name}
            aria-hidden="true"
            className="logoloop-item flex shrink-0 items-center opacity-70 hover:opacity-100 transition-opacity"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/logos/customers/${company.slug}.${company.ext}`}
              alt={company.name}
              loading="lazy"
              decoding="async"
              draggable={false}
              style={{
                height: `${company.height}px`,
                width: "auto",
                display: "block",
                objectFit: "contain",
                filter: company.filter,
              }}
            />
          </a>
        ))}
      </div>
    </div>
  </div>
);
