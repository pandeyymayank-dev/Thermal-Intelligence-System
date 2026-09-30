import React, { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    const ticketId = `TI-${Math.floor(1000 + Math.random() * 9000)}`;
    setToastMessage(`Transmission Sent: Ticket #${ticketId} logged. Desk notified at ntro-thermal-intel@gov.in.`);
    setShowToast(true);

    setFormData({
      name: '',
      email: '',
      message: '',
    });

    setTimeout(() => {
      setShowToast(false);
    }, 4500);
  };

  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100vh - 56px)',
        overflowY: 'auto',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        padding: '40px 24px 64px 24px',
        boxSizing: 'border-box',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#38bdf8',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontFamily: "'JetBrains Mono', monospace",
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '3px 10px',
                borderRadius: '12px',
              }}
            >
              COMMUNICATIONS &bull; DIRECT LIAISON
            </span>
          </div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: '#f8fafc' }}>
            Contact &amp; Operational Support
          </h1>
          <p style={{ margin: 0, fontSize: '14.5px', color: '#94a3b8', lineHeight: '1.6', maxWidth: '540px', marginLeft: 'auto', marginRight: 'auto' }}>
            Direct channel for intelligence coordination, anomaly escalations, and technical inquiries.
          </p>
        </div>

        {/* Direct Liaison Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '14px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              borderRadius: '8px',
              padding: '16px 18px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", marginBottom: '4px' }}>
              Operational Desk Email
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
              ntro-thermal-intel@gov.in
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Monitored 24/7 for urgent escalations &amp; API access.
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              borderRadius: '8px',
              padding: '16px 18px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", marginBottom: '4px' }}>
              Direct Operations Unit
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
              Technical Operations Directorate
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              National Technical Research Organisation, New Delhi.
            </div>
          </div>
        </div>

        {/* Minimal 3-Field Message Form */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '10px',
            padding: '28px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ marginBottom: '22px' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
              Send a Secure Message
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
              Please provide your details and message below. We typically respond within 2 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Field 1: Name */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#cbd5e1',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Name / Organization *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Capt. R. Sharma / State Disaster Authority"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  borderRadius: '6px',
                  padding: '11px 14px',
                  color: '#f8fafc',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#38bdf8')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(148, 163, 184, 0.25)')}
              />
            </div>

            {/* Field 2: Email */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#cbd5e1',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Official Email *
              </label>
              <input
                type="email"
                required
                placeholder="officer@agency.gov.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  borderRadius: '6px',
                  padding: '11px 14px',
                  color: '#f8fafc',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#38bdf8')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(148, 163, 184, 0.25)')}
              />
            </div>

            {/* Field 3: Message */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#cbd5e1',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Message / Anomaly Context *
              </label>
              <textarea
                rows={5}
                required
                placeholder="Describe your inquiry, report a ground discrepancy, or request system integration support..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  borderRadius: '6px',
                  padding: '11px 14px',
                  color: '#f8fafc',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#38bdf8')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(148, 163, 184, 0.25)')}
              />
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button
                type="submit"
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  padding: '11px 26px',
                  borderRadius: '6px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(56, 189, 248, 0.25)';
                  e.currentTarget.style.borderColor = '#38bdf8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                }}
              >
                <span>Send Message</span>
                <span>&rarr;</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Notification Toast */}
      {showToast && (
        <div className="tactical-toast">
          <span style={{ fontSize: '16px' }}>✅</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
