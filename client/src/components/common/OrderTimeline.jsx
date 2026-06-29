import { Check } from 'lucide-react';
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from '../../utils/orderStatus';

// Renders the linear pending→confirmed→processing→shipped→delivered flow
// as a row of steps. Cancelled orders don't render this at all (OrderDetail
// shows a cancelled banner instead) since 'cancelled' has no fixed position
// in a linear timeline — it can branch off from pending or confirmed.
const OrderTimeline = ({ status }) => {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

  return (
    <div className="flex items-center">
      {ORDER_STATUS_FLOW.map((step, i) => {
        const isDone = i <= currentIndex;
        const isLast = i === ORDER_STATUS_FLOW.length - 1;
        return (
          <div key={step} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  isDone ? 'bg-(--color-accent) text-white' : 'bg-black/10 text-(--color-muted)'
                }`}
              >
                {isDone ? <Check size={14} /> : i + 1}
              </span>
              <span className="whitespace-nowrap text-xs text-(--color-muted)">{ORDER_STATUS_LABELS[step]}</span>
            </div>
            {!isLast && <div className={`mx-2 h-0.5 flex-1 ${i < currentIndex ? 'bg-(--color-accent)' : 'bg-black/10'}`} />}
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
