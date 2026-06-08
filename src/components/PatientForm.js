'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { UserPlus, Save, Loader2 } from 'lucide-react';

const INITIAL_STATE = {
  name: '',
  age: '',
  gender: '',
  contact: '',
  diagnosis: '',
  bedId: '',
  priority: 'MEDIUM',
  doctor: '',
  notes: '',
};

export default function PatientForm({
  isOpen,
  onClose,
  onSubmit,
  patient,
  availableBeds = [],
}) {
  const isEdit = Boolean(patient);
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        age: patient.age?.toString() || '',
        gender: patient.gender || '',
        contact: patient.contact || '',
        diagnosis: patient.diagnosis || '',
        bedId: patient.bedId || '',
        priority: patient.priority || 'MEDIUM',
        doctor: patient.doctor || '',
        notes: patient.notes || '',
      });
    } else {
      setFormData(INITIAL_STATE);
    }
    setErrors({});
    setLoading(false);
  }, [patient, isOpen]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age || Number(formData.age) < 0 || Number(formData.age) > 150)
      newErrors.age = 'Valid age is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.contact.trim()) newErrors.contact = 'Contact is required';
    if (!formData.diagnosis.trim()) newErrors.diagnosis = 'Diagnosis is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        age: parseInt(formData.age, 10),
        bedId: formData.bedId || null,
      });
      onClose();
    } catch {
      setLoading(false);
    }
  };

  /* ---- Styles ---- */
  const styles = {
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
    },

    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
    },

    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },

    label: {
      fontSize: '0.78rem',
      fontWeight: 600,
      color: 'var(--text-secondary, #94a3b8)',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    },

    required: {
      color: '#ef4444',
      marginLeft: '2px',
    },

    input: {
      width: '100%',
      padding: '10px 14px',
      fontSize: '0.875rem',
      color: 'var(--text-primary, #f1f5f9)',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px',
      outline: 'none',
      fontFamily: 'inherit',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      boxSizing: 'border-box',
    },

    inputError: {
      borderColor: '#ef4444',
      boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
    },

    inputFocus: {
      borderColor: 'var(--primary, #14b8a6)',
      boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.1)',
    },

    textarea: {
      resize: 'vertical',
      minHeight: '80px',
    },

    select: {
      appearance: 'none',
      backgroundImage:
        'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      paddingRight: '36px',
    },

    errorText: {
      fontSize: '0.72rem',
      color: '#f87171',
      marginTop: '2px',
    },

    divider: {
      borderTop: '1px solid rgba(255,255,255,0.06)',
      margin: '4px 0',
    },

    submitBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px 28px',
      fontSize: '0.9rem',
      fontWeight: 600,
      color: '#fff',
      background: 'linear-gradient(135deg, var(--primary, #14b8a6), var(--accent, #0ea5e9))',
      border: 'none',
      borderRadius: '10px',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1,
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
      marginTop: '4px',
    },

    spinner: {
      animation: 'spin 1s linear infinite',
    },
  };

  // Helper: merge input styles with error state
  const inputStyle = (fieldName, extra = {}) => ({
    ...styles.input,
    ...extra,
    ...(errors[fieldName] ? styles.inputError : {}),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Update Patient' : 'Admit New Patient'}
      size="lg"
    >
      {/* Inject spinner keyframe */}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      <form style={styles.form} onSubmit={handleSubmit}>
        {/* Name + Age */}
        <div style={styles.row}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name"
              style={inputStyle('name')}
              onFocus={(e) => {
                if (!errors.name) {
                  e.target.style.borderColor = 'var(--primary, #14b8a6)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
                }
              }}
              onBlur={(e) => {
                if (!errors.name) {
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            />
            {errors.name && <span style={styles.errorText}>{errors.name}</span>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Age <span style={styles.required}>*</span>
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="0"
              min="0"
              max="150"
              style={inputStyle('age')}
              onFocus={(e) => {
                if (!errors.age) {
                  e.target.style.borderColor = 'var(--primary, #14b8a6)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
                }
              }}
              onBlur={(e) => {
                if (!errors.age) {
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            />
            {errors.age && <span style={styles.errorText}>{errors.age}</span>}
          </div>
        </div>

        {/* Gender + Contact */}
        <div style={styles.row}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Gender <span style={styles.required}>*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              style={inputStyle('gender', styles.select)}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <span style={styles.errorText}>{errors.gender}</span>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Contact <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Phone number"
              style={inputStyle('contact')}
              onFocus={(e) => {
                if (!errors.contact) {
                  e.target.style.borderColor = 'var(--primary, #14b8a6)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
                }
              }}
              onBlur={(e) => {
                if (!errors.contact) {
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            />
            {errors.contact && <span style={styles.errorText}>{errors.contact}</span>}
          </div>
        </div>

        {/* Diagnosis */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Diagnosis <span style={styles.required}>*</span>
          </label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            placeholder="Primary diagnosis"
            style={inputStyle('diagnosis', styles.textarea)}
            onFocus={(e) => {
              if (!errors.diagnosis) {
                e.target.style.borderColor = 'var(--primary, #14b8a6)';
                e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
              }
            }}
            onBlur={(e) => {
              if (!errors.diagnosis) {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.boxShadow = 'none';
              }
            }}
          />
          {errors.diagnosis && <span style={styles.errorText}>{errors.diagnosis}</span>}
        </div>

        {/* Bed + Priority */}
        <div style={styles.row}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Assign Bed</label>
            <select
              name="bedId"
              value={formData.bedId}
              onChange={handleChange}
              style={{ ...styles.input, ...styles.select }}
            >
              <option value="">No bed assigned</option>
              {availableBeds.map((bed) => (
                <option key={bed.id} value={bed.id}>
                  {bed.bedNumber} – {bed.ward?.name || 'Unknown Ward'}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              style={{ ...styles.input, ...styles.select }}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        {/* Doctor */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Attending Doctor</label>
          <input
            type="text"
            name="doctor"
            value={formData.doctor}
            onChange={handleChange}
            placeholder="Dr. …"
            style={styles.input}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary, #14b8a6)';
              e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.1)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={styles.divider} />

        {/* Notes */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Additional Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Optional notes…"
            rows={3}
            style={{ ...styles.input, ...styles.textarea, minHeight: '60px' }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary, #14b8a6)';
              e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.1)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={styles.submitBtn}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.opacity = '1';
          }}
        >
          {loading ? (
            <Loader2 size={18} style={styles.spinner} />
          ) : isEdit ? (
            <Save size={18} />
          ) : (
            <UserPlus size={18} />
          )}
          {isEdit ? 'Update Patient' : 'Admit Patient'}
        </button>
      </form>
    </Modal>
  );
}
