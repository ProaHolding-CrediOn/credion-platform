import { ResponsiveFieldGridProps } from "./ResponsiveFieldGrid.type";

export default function ResponsiveFieldGrid({ children }: ResponsiveFieldGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {children}
    </div>
  );
}