import {
  FRESHNESS_CONFIG, getTopicFreshness,
} from '../data/constants';
import { BODY } from '../styles/base';

const FreshnessBadge = ({ topic, style }) => {
  const freshness = getTopicFreshness(topic);
  const cfg = FRESHNESS_CONFIG[freshness];
  return (
    <span style={{
      fontFamily: BODY, fontSize: 9, padding: "2px 7px", borderRadius: 10,
      background: `${cfg.color}15`, color: cfg.color,
      border: `1px solid ${cfg.color}30`, fontWeight: 500,
      letterSpacing: "0.03em", whiteSpace: "nowrap", ...style,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

export default FreshnessBadge;
