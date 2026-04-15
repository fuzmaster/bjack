const baseProps = {
  viewBox: "0 0 24 24",
  fill: "currentColor",
  focusable: "false",
  "aria-hidden": "true",
};

function HeartIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 21.35c-.25 0-.5-.08-.7-.24C4.94 16.2 2 13.39 2 9.75 2 6.86 4.24 4.5 7.08 4.5c1.82 0 3.53.87 4.62 2.32A5.73 5.73 0 0 1 16.32 4.5C19.16 4.5 21.4 6.86 21.4 9.75c0 3.64-2.94 6.45-9.3 11.36-.2.16-.45.24-.7.24Z" />
    </svg>
  );
}

function DiamondIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 2.8 20.4 12 12 21.2 3.6 12 12 2.8Z" />
    </svg>
  );
}

function ClubIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 2.9a4.15 4.15 0 0 1 4.14 4.14c0 .45-.07.88-.2 1.29a4.2 4.2 0 0 1 1.06-.14 4.2 4.2 0 0 1 0 8.4h-1.3c.28.67.73 1.78 1.16 2.95H7.14c.43-1.17.88-2.28 1.16-2.95H7a4.2 4.2 0 0 1 0-8.4c.36 0 .71.05 1.04.13a4.14 4.14 0 0 1-.18-1.24A4.15 4.15 0 0 1 12 2.9Zm-1.13 16.74-.88 1.88h3.98l-.88-1.88h-2.22Z" />
    </svg>
  );
}

function SpadeIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 2.7c.17 0 .34.06.48.18 3.8 3.22 7.02 6.23 7.02 9.74 0 2.5-2.03 4.53-4.53 4.53-.85 0-1.64-.23-2.33-.63.26.76.73 1.93 1.2 3.15H10.2c.47-1.22.94-2.39 1.2-3.15-.69.4-1.48.63-2.33.63A4.53 4.53 0 0 1 4.54 12.62c0-3.5 3.22-6.52 7.02-9.74.14-.12.31-.18.48-.18Z" />
    </svg>
  );
}

const ICONS = {
  hearts: HeartIcon,
  diamonds: DiamondIcon,
  clubs: ClubIcon,
  spades: SpadeIcon,
};

export default function SuitIcon({ suit, className = "", ...props }) {
  const Icon = ICONS[suit] ?? SpadeIcon;
  return <Icon className={className} {...props} />;
}
