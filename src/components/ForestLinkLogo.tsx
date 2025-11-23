interface ForestLinkLogoProps {
  className?: string;
}

export const ForestLinkLogo = ({ className = "h-8 w-8" }: ForestLinkLogoProps) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Tree/Forest icon */}
      <path 
        d="M50 10 L35 35 L40 35 L30 55 L37 55 L25 75 L50 75 L50 90 M50 10 L65 35 L60 35 L70 55 L63 55 L75 75 L50 75" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      {/* Connection lines representing "Link" */}
      <circle cx="20" cy="50" r="4" fill="currentColor" />
      <circle cx="80" cy="50" r="4" fill="currentColor" />
      <path 
        d="M24 50 L35 50 M65 50 L76 50" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
    </svg>
  );
};
