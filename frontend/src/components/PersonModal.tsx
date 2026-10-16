import { AnimatePresence, motion } from "framer-motion";
import { Mail, X } from "lucide-react";
import type { TeamMember } from "../data/companyProfile";

export function PersonModal({
  person,
  imageSrc,
  onClose,
}: {
  person: TeamMember | null;
  imageSrc?: string;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {person && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 p-4 sm:p-6 backdrop-blur-sm"
        >
          <div className="flex min-h-full items-start justify-center pt-8 pb-12 sm:py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl my-auto"
            >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
            >
              <X className="h-4 w-4" />
            </button>
            <img src={imageSrc} alt={person.name} className="h-80 w-full object-cover" />
            <div className="p-6 text-center">
              <h3 className="font-display text-lg font-bold text-brand-navy">{person.name}</h3>
              <p className="mt-1 text-sm text-brand-accent">{person.role}</p>
              {person.email && (
                <a
                  href={`mailto:${person.email}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-navy"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {person.email}
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    )}
    </AnimatePresence>
  );
}
