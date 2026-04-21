import { useState } from "react";

export default function FeedbackComponent() {
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 20 }}>
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <h2>Feedback</h2>

          <input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
          />

          <textarea
            placeholder="Write your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
          />

          <button type="submit" style={{ padding: "8px 16px" }}>
            Submit
          </button>
        </form>
      ) : (
        <div>
          <h3>Thank you!</h3>
          <p>Your feedback has been submitted.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setName("");
              setFeedback("");
            }}
          >
            Submit another
          </button>
        </div>
      )}
    </div>
  );
}
