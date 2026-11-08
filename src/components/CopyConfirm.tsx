/** Stacked labels share one grid cell so the control width stays put. */
export default function CopyConfirm({
  label,
  labels,
}: {
  label: string;
  labels: readonly string[];
}) {
  return (
    <span className="copy-confirm">
      {labels.map((item) => {
        const active = item === label;
        return (
          <span key={item} className={active ? "is-active" : undefined} aria-hidden={active ? undefined : true}>
            {item}
          </span>
        );
      })}
    </span>
  );
}
