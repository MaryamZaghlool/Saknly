"use client";
import React, { useState } from "react";
import styles from "./ContactForm.module.css";

const initialForm = { name: "", email: "", subject: "", message: "" };

const validateEmail = (email: string) =>
  /^\S+@\S+\.\S+$/.test(email);

const ContactForm = () => {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info" | ""; message: string }>({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; subject?: string; message?: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = "الاسم مطلوب";
    else if (formData.name.trim().length < 2) newErrors.name = "الاسم يجب أن يكون على الأقل حرفين";
    if (!formData.email.trim()) newErrors.email = "البريد الإلكتروني مطلوب";
    else if (!validateEmail(formData.email)) newErrors.email = "صيغة البريد غير صحيحة";
    if (!formData.message.trim()) newErrors.message = "الرسالة مطلوبة";
    else if (formData.message.trim().length < 10) newErrors.message = "الرسالة يجب أن تكون على الأقل 10 أحرف";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatus({ type: "error", message: "يرجى تصحيح الحقول المطلوبة" });
      return;
    }
    setLoading(true);
    setStatus({ type: "info", message: "جاري الإرسال..." });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      if (response.ok) {
        setStatus({ type: "success", message: "تم إرسال الرسالة بنجاح!" });
        setFormData(initialForm);
      } else {
        setStatus({ type: "error", message: "فشل في إرسال الرسالة. حاول لاحقًا." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ أثناء الإرسال. حاول لاحقًا." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formCard} noValidate>
      <div className={styles.inputWrapper}>
        <label htmlFor="name" className={styles.label}>
          الاسم
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          required
        />
        {errors.name && <span id="name-error" className={styles.errorMsg}>{errors.name}</span>}
      </div>
      <div className={styles.inputWrapper}>
        <label htmlFor="email" className={styles.label}>
          البريد الإلكتروني
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          required
        />
        {errors.email && <span id="email-error" className={styles.errorMsg}>{errors.email}</span>}
      </div>
      <div className={styles.inputWrapper}>
  <label htmlFor="subject" className={styles.label}>
    الموضوع
  </label>
  <input
    type="text"
    name="subject"
    id="subject"
    value={formData.subject}
    onChange={handleChange}
    className={`${styles.input} ${errors.subject ? styles.inputError : ""}`}
    aria-invalid={!!errors.subject}
    aria-describedby={errors.subject ? "subject-error" : undefined}
    required
  />
  {errors.subject && <span id="subject-error" className={styles.errorMsg}>{errors.subject}</span>}
</div>
      <div className={styles.inputWrapper}>
        <label htmlFor="message" className={styles.label}>
          رسالتك
        </label>
        <textarea
          name="message"
          id="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          className={`${styles.input} ${errors.message ? styles.inputError : ""}`}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          required></textarea>
        {errors.message && <span id="message-error" className={styles.errorMsg}>{errors.message}</span>}
      </div>
      <div style={{ textAlign: "center" }}>
        <button
          type="submit"
          className={styles.button}
          disabled={loading}
          aria-busy={loading}
        >
          {loading && <span className={styles.spinner} aria-hidden="true"></span>}
          إرسال الرسالة
        </button>
      </div>
      <div aria-live="polite" style={{ minHeight: 40 }}>
        {status.message && (
          <p
            className={
              status.type === "success"
                ? `${styles.status} ${styles.statusSuccess}`
                : status.type === "error"
                ? `${styles.status} ${styles.statusError}`
                : status.type === "info"
                ? `${styles.status} ${styles.statusInfo}`
                : styles.status
            }
          >
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
};

export default ContactForm;
