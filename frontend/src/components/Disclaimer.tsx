import { AlertTriangle } from "lucide-react";

interface DisclaimerProps {
  text: string;
}

export default function Disclaimer({ text }: DisclaimerProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-ocre-200 bg-ocre-50 px-4 py-3">
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-ocre-600" />
      <p className="text-xs leading-relaxed text-ocre-800">{text}</p>
    </div>
  );
}
