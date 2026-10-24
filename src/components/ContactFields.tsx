import type { Stage } from "../data";
import { stages } from "../data";
import { ChevronDown } from "lucide-react";
const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
const stageClass = (stage: Stage) => stage.toLowerCase();
export function Avatar({
  name,
  small = false,
}: {
  name: string;
  small?: boolean;
}) {
  const color = [...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 5;
  return (
    <span
      aria-hidden="true"
      className={`avatar avatar-${color} ${small ? "small" : ""}`}
    >
      {initials(name)}
    </span>
  );
}
export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className={`stage-badge ${stageClass(stage)}`}>
      <span className="stage-dot" />
      {stage}
    </span>
  );
}
export function StageSelect({
  id,
  name,
  stage,
  onChange,
}: {
  id: string;
  name: string;
  stage: Stage;
  onChange: (id: string, stage: Stage) => void;
}) {
  return (
    <span className={`quick-stage ${stageClass(stage)}`}>
      <span className="stage-dot" aria-hidden="true" />
      <select
        id={`quick-stage-${id}`}
        aria-label={`Stage for ${name}`}
        value={stage}
        onChange={(event) => onChange(id, event.target.value as Stage)}
      >
        {stages.map((value) => (
          <option key={value}>{value}</option>
        ))}
      </select>
      <ChevronDown size={11} aria-hidden="true" />
    </span>
  );
}
export function Labels({ labels }: { labels: string[] }) {
  return (
    <span className="labels">
      {labels.length ? (
        labels.map((label) => (
          <span key={label} className={`label label-${label.toLowerCase()}`}>
            {label}
          </span>
        ))
      ) : (
        <span className="missing">—</span>
      )}
    </span>
  );
}
