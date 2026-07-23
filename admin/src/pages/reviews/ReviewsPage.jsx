import { useEffect, useState } from 'react';
import { Check, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services';
import { getError } from '../../services/api';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('pending');

  const load = () =>
    adminApi
      .reviews({ status, limit: 50 })
      .then(({ data }) => setReviews(data.data || []))
      .catch((e) => toast.error(getError(e)));

  useEffect(() => {
    load();
  }, [status]);

  const approve = async (id) => {
    try {
      await adminApi.approveReview(id);
      toast.success('Approved');
      load();
    } catch (e) {
      toast.error(getError(e));
    }
  };

  const reject = async (id) => {
    try {
      await adminApi.rejectReview(id);
      toast.success('Rejected');
      load();
    } catch (e) {
      toast.error(getError(e));
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete review?')) return;
    try {
      await adminApi.deleteReview(id);
      toast.success('Deleted');
      load();
    } catch (e) {
      toast.error(getError(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold">Reviews</h2>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="text-muted">No reviews found</p>
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {r.user?.name} · {r.product?.name}
                  </p>
                  <p className="mt-1 text-sm text-amber-500">{'★'.repeat(r.rating)}</p>
                  <p className="mt-2 text-sm text-muted">{r.comment}</p>
                  <p className="mt-2 text-xs capitalize text-muted">Status: {r.status}</p>
                </div>
                <div className="flex gap-2">
                  {r.status !== 'approved' && (
                    <button
                      onClick={() => approve(r._id)}
                      className="rounded-lg bg-emerald-50 p-2 text-success"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  {r.status !== 'rejected' && (
                    <button
                      onClick={() => reject(r._id)}
                      className="rounded-lg bg-amber-50 p-2 text-warning"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => remove(r._id)}
                    className="rounded-lg bg-rose-50 p-2 text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
