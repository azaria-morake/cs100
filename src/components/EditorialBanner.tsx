interface EditorialBannerProps {
  badgeText?: string;
  message?: string;
}

export default function EditorialBanner({
  badgeText = "LATEST AUDIT",
  message = "Benchmark suite v4.2 published: Evaluating real-world JSON serialization costs across 14 runtime environments."
}: EditorialBannerProps) {
  return (
    <div className="banner">
      <span className="badge-live">{badgeText}</span>
      <span>{message}</span>
    </div>
  );
}
