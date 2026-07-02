/** @doc Single static premium Visa card display. */
import React from "react";

interface Props {
  height?: number;
}

export default function CardCarousel3D({ height = 360 }: Props) {
  return (
    <div
      className="card-carousel-3d relative w-full overflow-hidden rounded-2xl bg-black select-none flex items-center justify-center"
      style={{ height }}
    >
      <div
        className="relative w-[min(86%,320px)] aspect-[1.586] rounded-[18px] overflow-hidden"
        style={{
          backgroundColor: "#0f0f0f",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Subtle radial sheen */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,0.08), transparent 50%), radial-gradient(90% 70% at 100% 100%, rgba(255,255,255,0.05), transparent 45%)",
          }}
        />

        {/* Chip */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2">
          <svg width="30" height="30" viewBox="0 0 60 60" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M20 8H40V14C40.0016 14.5299 40.2128 15.0377 40.5875 15.4125C40.9623 15.7872 41.4701 15.9984 42 16H59V24H42C41.4701 24.0016 40.9623 24.2128 40.5875 24.5875C40.2128 24.9623 40.0016 25.4701 40 26V52H20V8ZM18 8H8.00039C4.47435 8 1.56576 10.6083 1.08 14H18V8ZM1 16V24V26V34V36V44H18V36H1V34H18V26H1V24H18V16H1ZM1.08 46C1.56576 49.3917 4.47435 52 8.00039 52H18V46H1.08ZM42 14V8H52.0004C55.5264 8 58.4342 10.6084 58.92 14H42ZM59 26H42V34H59V26ZM59 36H42V44H59V36ZM52.0004 52H42V46H58.92C58.4342 49.3916 55.5264 52 52.0004 52Z"
              fill="url(#chipgrad-static)"
            />
            <defs>
              <linearGradient id="chipgrad-static" x1="30" y1="8" x2="30" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="white" />
                <stop offset="1" stopColor="#999999" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Visa logo */}
        <div className="absolute right-5 top-5">
          <svg width="48" height="16" viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18.036 1.144L15.132 13.856H18.612L21.516 1.144H18.036ZM12.132 1.144L8.58 9.316L7.824 6.124C7.368 4.144 5.784 2.416 3.9 1.5L3.924 1.456H7.74C8.304 1.456 8.796 1.84 8.964 2.392L9.996 7.228L12.84 1.144H12.132ZM30.636 9.076C30.648 6.028 26.58 5.848 26.592 4.288C26.592 3.76 27.096 3.184 28.116 3.076C28.62 3.028 29.916 2.98 31.26 3.688L31.704 1.336C30.936 1.036 29.94 0.856 28.74 0.856C25.704 0.856 23.46 2.344 23.448 4.576C23.436 6.196 25.044 7.084 26.064 7.576C27.12 8.08 27.48 8.416 27.48 8.872C27.468 9.64 26.556 10.012 25.632 10.012C24.264 10.012 23.412 9.724 22.596 9.34L22.14 11.74C23.016 12.136 24.396 12.34 25.812 12.34C28.992 12.34 31.62 10.876 31.632 8.476C31.632 8.488 31.644 8.512 31.644 8.536V8.524C31.632 8.62 30.636 9.076 30.636 9.076ZM40.596 13.828H43.812L46.356 1.144H43.248C43.248 1.144 42.828 1.372 42.588 1.888L39.168 9.7L36.768 2.296C36.468 1.384 35.64 1.144 35.64 1.144H30.264L30.216 1.408C31.464 1.708 32.592 2.176 33.552 2.74L35.772 13.816H39.324L44.808 1.144H40.596V13.828ZM5.784 13.852L2.868 1.144H0.024C0.024 1.144 -0.696 1.792 0.864 4.372L3.624 9.856L1.86 13.852H5.784Z"
              fill="white"
            />
          </svg>
        </div>

        {/* Card number, name, CVV */}
        <div
          className="absolute left-5 right-5 bottom-5 flex flex-col gap-1.5"
          style={{ fontFamily: '"JetBrains Mono", monospace', color: "#fff" }}
        >
          <div className="text-[clamp(11px,3.2vw,15px)]" style={{ letterSpacing: "0.14em" }}>
            4232 8908 1121 4892
          </div>
          <div className="text-[10px] flex items-center gap-2" style={{ color: "rgba(255,255,255,0.7)" }}>
            <span>ZACHARY MERCER</span>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>•</span>
            <span>CVV: 382</span>
          </div>
        </div>
      </div>
    </div>
  );
}
