import { Badge } from "@/components/ui/badge";

type BadgeStatus = 'submitted' | 'under_review' | 'shortlisted' | 'rejected' | 'hired' | 'open' | 'closed';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let colorClass = "";
  let label = status;

  switch (status.toLowerCase()) {
    case 'shortlisted':
    case 'hired':
      colorClass = "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
      label = status.charAt(0).toUpperCase() + status.slice(1);
      break;
    case 'under_review':
      colorClass = "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100";
      label = "Under Review";
      break;
    case 'submitted':
      colorClass = "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100";
      label = "Submitted";
      break;
    case 'rejected':
      colorClass = "bg-red-100 text-red-800 border-red-200 hover:bg-red-100";
      label = "Rejected";
      break;
    case 'open':
      colorClass = "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100";
      label = "Open";
      break;
    case 'closed':
      colorClass = "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100";
      label = "Closed";
      break;
    default:
      colorClass = "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100";
      label = status;
  }

  return (
    <Badge variant="outline" className={`font-medium shadow-none ${colorClass}`}>
      {label}
    </Badge>
  );
}
