import type { ReactNode } from "react";
import "./JoinButton.css";

export function JoinButton({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className="join-button">
      <span className="points_wrapper" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="point" />
        ))}
      </span>
      <span className="inner-btn">{children}</span>
    </button>
  );
}

