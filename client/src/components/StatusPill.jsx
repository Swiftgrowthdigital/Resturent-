import { Badge } from './Badge';

export function StatusPill({ status }) {
  const tone = status === 'Confirmed' ? 'emerald' : 'orange';
  return <Badge tone={tone}>{status}</Badge>;
}
