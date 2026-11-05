import { useState } from "react";
import { changeUserPassword } from "../services/auth";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const result = await changeUserPassword(
        oldPassword,
        newPassword
      );

      setMessage(result.message);
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Change Password</h2>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <label>Current Password</label>
        <input
          type="password"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          required
        />

        <label>New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          minLength="8"
          placeholder="Minimum 8 characters"
          required
        />

        <button type="submit">Update Password</button>
      </form>
    </div>
  );
}