"use client";

import { motion } from "framer-motion";

// Company logos as SVG components for better quality
const companies = [
  { name: "Google", logo: GoogleLogo },
  { name: "Meta", logo: MetaLogo },
  { name: "Amazon", logo: AmazonLogo },
  { name: "Microsoft", logo: MicrosoftLogo },
  { name: "Apple", logo: AppleLogo },
  { name: "Netflix", logo: NetflixLogo },
  { name: "Stripe", logo: StripeLogo },
  { name: "Uber", logo: UberLogo },
];

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-auto fill-current">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function MetaLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-auto fill-current">
      <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.92 3.77-3.92 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
    </svg>
  );
}

function AmazonLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-auto fill-current">
      <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 0 1-10.951-.577 17.58 17.58 0 0 1-5.43-3.35c-.1-.074-.151-.15-.151-.223 0-.043.022-.089.045-.12zm6.066-7.467c0-1.093.256-2.033.744-2.82.487-.786 1.16-1.387 2.022-1.805a7.082 7.082 0 0 1 2.91-.656c.975 0 1.89.164 2.744.492.855.328 1.505.764 1.95 1.312l.087.13v-1.5h3.33v10.14c0 1.413-.249 2.552-.744 3.42-.496.865-1.207 1.507-2.13 1.923-.926.416-2.023.624-3.29.624-1.092 0-2.144-.172-3.155-.515-1.01-.344-1.85-.822-2.513-1.435a5.352 5.352 0 0 1-.204-.21l1.62-2.46c.01.012.03.034.057.068.474.548 1.086 1.01 1.832 1.387.746.376 1.523.565 2.33.565.83 0 1.473-.177 1.933-.53.46-.353.69-.94.69-1.76v-.877c-.554.596-1.2 1.037-1.936 1.323-.736.287-1.485.43-2.247.43-.996 0-1.926-.202-2.79-.606-.862-.404-1.55-.997-2.062-1.778-.512-.782-.768-1.708-.768-2.778zm3.538.144c0 .736.253 1.34.76 1.81.508.47 1.14.706 1.898.706.743 0 1.368-.237 1.873-.71.506-.475.76-1.08.76-1.816 0-.735-.253-1.34-.758-1.815-.505-.475-1.126-.712-1.865-.712-.766 0-1.4.235-1.906.704-.506.47-.76 1.073-.762 1.833z" />
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-auto fill-current">
      <path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623z" />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-auto fill-current">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function NetflixLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-auto fill-current">
      <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z" />
    </svg>
  );
}

function StripeLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-auto fill-current">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
    </svg>
  );
}

function UberLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-auto fill-current">
      <path d="M0 7.97v4.958c0 1.867 1.302 3.101 3.134 3.101 1.14 0 1.978-.396 2.545-1.053v.912h1.63V7.97H5.68v4.985c0 1.054-.726 1.752-1.724 1.752-.972 0-1.644-.698-1.644-1.752V7.97zm8.065 0v7.918h1.63v-.912c.567.657 1.405 1.053 2.545 1.053 1.832 0 3.134-1.234 3.134-3.101V7.97h-1.63v4.985c0 1.054-.672 1.752-1.644 1.752-.998 0-1.724-.698-1.724-1.752V7.97zm8.413 7.918h1.63v-3.507h1.248l1.878 3.507h1.877l-2.12-3.87c.973-.509 1.632-1.406 1.632-2.655 0-1.768-1.274-2.95-3.134-2.95h-3.011zm1.63-6.527h1.272c.998 0 1.595.517 1.595 1.342 0 .825-.597 1.342-1.595 1.342h-1.272z" />
    </svg>
  );
}

export function TrustedBy() {
  return (
    <section className="py-16 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
            Trusted by engineers at
          </p>
        </motion.div>

        {/* Marquee Container */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

          {/* Marquee */}
          <div className="flex overflow-hidden">
            <motion.div
              className="flex items-center gap-16 animate-marquee"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {/* First set */}
              {companies.map((company, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-300 shrink-0"
                >
                  <company.logo />
                  <span className="font-semibold text-lg whitespace-nowrap">
                    {company.name}
                  </span>
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {companies.map((company, index) => (
                <div
                  key={`dup-${index}`}
                  className="flex items-center gap-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-300 shrink-0"
                >
                  <company.logo />
                  <span className="font-semibold text-lg whitespace-nowrap">
                    {company.name}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
