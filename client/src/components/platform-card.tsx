import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ArrowUpRight, Clock } from "lucide-react";
import type { Platform } from "@shared/schema";

interface PlatformCardProps {
  platform: Platform;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "Project Management": "from-blue-500 to-blue-600",
    "Financial Analytics": "from-green-500 to-emerald-600",
    "Customer Service": "from-purple-500 to-purple-600",
    "Marketing Automation": "from-orange-500 to-orange-600",
    "Human Resources": "from-teal-500 to-teal-600",
    "E-Commerce": "from-red-500 to-rose-600",
  };
  return colors[category] || "from-gray-500 to-gray-600";
};

const getCategoryBadgeColor = (category: string) => {
  const colors: Record<string, string> = {
    "Project Management": "bg-blue-100 text-blue-700 border-blue-200",
    "Financial Analytics": "bg-green-100 text-green-700 border-green-200",
    "Customer Service": "bg-purple-100 text-purple-700 border-purple-200",
    "Marketing Automation": "bg-orange-100 text-orange-700 border-orange-200",
    "Human Resources": "bg-teal-100 text-teal-700 border-teal-200",
    "E-Commerce": "bg-red-100 text-red-700 border-red-200",
  };
  return colors[category] || "bg-gray-100 text-gray-700 border-gray-200";
};

export default function PlatformCard({ platform }: PlatformCardProps) {
  const isComingSoon = platform.comingSoon === true;

  return (
    <Card className={`group relative bg-white border border-slate-200 hover:border-slate-300 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:-translate-y-1 ${isComingSoon ? "opacity-95" : ""}`}>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getCategoryColor(platform.category)} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>

      {isComingSoon && (
        <div className="absolute top-4 left-4 z-20">
          <Badge className="bg-slate-900/90 text-white border-0 font-semibold px-3 py-1 shadow-lg backdrop-blur-sm">
            <Clock className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
        </div>
      )}

      <CardContent className="p-0">
        {platform.logo && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            <img
              src={platform.logo}
              alt={`${platform.name} Platform`}
              className={`w-full h-52 object-cover transform group-hover:scale-110 transition-transform duration-500 ${isComingSoon ? "grayscale-[40%]" : ""}`}
            />
            {!isComingSoon && (
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <ArrowUpRight className="h-5 w-5 text-slate-700" />
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-2xl font-bold text-lamplight-primary group-hover:text-blue-600 transition-colors">
              {platform.name}
            </h3>
          </div>

          <p className="text-slate-600 mb-5 line-clamp-3 leading-relaxed">
            {platform.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Badge className={`${getCategoryBadgeColor(platform.category)} border font-medium px-3 py-1`}>
              {platform.category}
            </Badge>
            {isComingSoon ? (
              <span
                className="text-slate-500 font-semibold flex items-center gap-1"
                data-testid={`text-coming-soon-${platform.id}`}
              >
                <Clock className="h-4 w-4" />
                <span>In Development</span>
              </span>
            ) : (
              <a
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 group/link"
              >
                <span className="group-hover/link:underline">Launch</span>
                <ExternalLink className="h-4 w-4 transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
