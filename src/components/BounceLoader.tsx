/** Boot / suspense loading: bouncing dots (brand champagne → cobalt). */
export default function BounceLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="bounce-loader" role="status" aria-live="polite" aria-label={label}>
      <div className="bounce-loader-wrap" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className={`bounce-loader-circle bounce-loader-circle-${i + 1}`} />
        ))}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
