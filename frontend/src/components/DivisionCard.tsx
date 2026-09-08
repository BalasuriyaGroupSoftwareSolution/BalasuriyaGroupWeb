import { Link } from "react-router-dom";

interface Props {
  title: string;
  description: string;
  to: string;
  cta?: string;
}

export function DivisionCard({ title, description, to, cta = "Learn more" }: Props) {
  return (
    <div className="card flex flex-col justify-between">
      <div>
        <h3 className="font-display text-xl font-bold text-brand-navy">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      </div>
      <Link to={to} className="btn-secondary mt-5 self-start py-1.5 text-xs">
        {cta}
      </Link>
    </div>
  );
}
