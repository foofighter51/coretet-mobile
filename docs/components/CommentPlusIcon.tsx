interface CommentPlusIconProps {
  size?: number;
  className?: string;
}

export function CommentPlusIcon({ size = 16, className = "" }: CommentPlusIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Comment bubble outline */}
      <path
        d="M14 2H2C1.45 2 1 2.45 1 3V10C1 10.55 1.45 11 2 11H3V13.5L6 11H14C14.55 11 15 10.55 15 10V3C15 2.45 14.55 2 14 2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="currentColor"
        fillOpacity="0.1"
      />
      
      {/* Plus sign inside */}
      <path
        d="M8 5V9M6 7H10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}