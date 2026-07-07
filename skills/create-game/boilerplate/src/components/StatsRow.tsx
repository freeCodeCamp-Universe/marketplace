import "./StatsRow.css";

interface Stat {
  label: string;
  value: string | number;
}

interface Props {
  stats: Stat[];
}

export default function StatsRow({ stats }: Props) {
  if (!stats.length) return null;

  return (
    <dl className="stats-row">
      {stats.map((stat, i) => (
        <div key={i} className="stats-row-stat">
          <dt className="stats-row-label">{stat.label}</dt>
          <dd className="stats-row-value">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
