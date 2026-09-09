import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  title: string;
  description: string;
  to: string;
  cta?: string;
  image?: string;
  icon?: ReactNode;
}

export function DivisionCard({ title, description, to, cta = "Learn more", image, icon }: Props) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="card flex flex-col justify-between overflow-hidden p-0"
    >
      {image && (
        <div className="relative flex h-40 w-full items-center justify-center bg-white p-3">
          {/* object-contain: these are full branding graphics (logo + wordmark) —
              cropping them with object-cover cuts off the division name at the bottom. */}
          <img src={image} alt={title} className="max-h-full max-w-full object-contain" />
          {icon && (
            <span className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold text-brand-navy shadow-md">
              {icon}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between border-t border-black/5 p-5">
        <div>
          <h3 className="font-display text-xl font-bold text-brand-navy">{title}</h3>
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        </div>
        <Link to={to} className="btn-secondary mt-5 self-start py-1.5 text-xs">
          {cta}
        </Link>
      </div>
    </motion.div>
  );
}
