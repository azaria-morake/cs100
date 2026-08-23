import { BenchmarkRow } from '@/lib/types';

interface BenchmarkTableProps {
  benchmarks?: BenchmarkRow[];
}

export default function BenchmarkTable({ benchmarks }: BenchmarkTableProps) {
  if (!benchmarks || benchmarks.length === 0) return null;

  return (
    <table className="benchmark-table">
      <thead>
        <tr>
          <th>Architecture Model</th>
          <th>p50 Latency</th>
          <th>p99 Latency</th>
          <th>Total Mem Alloc</th>
        </tr>
      </thead>
      <tbody>
        {benchmarks.map((row, idx) => (
          <tr key={idx}>
            <td>
              <strong>{row.architecture}</strong>
            </td>
            <td>{row.p50}</td>
            <td>{row.p99}</td>
            <td>{row.memory}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
