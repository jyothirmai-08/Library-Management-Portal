import { useEffect, useState } from "react";

import {
  addMember,
  deleteMember,
  getMembers,
  updateMember
} from "../services/api";

import Message from "../components/Message";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  membershipDate: new Date().toISOString().slice(0, 10)
};

export default function Members() {

  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadMembers() {

    try {
      setLoading(true);

      const data = await getMembers();

      setMembers(data);
      setError("");

    } catch {
      setError(
        "Unable to load members. Make sure JSON Server is running."
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  function handleChange(event) {

    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {

    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      setError(
        "Please fill in the name, email and phone number."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {

      setError("Please enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(form.phone)) {

      setError("Phone number must contain exactly 10 digits.");
      return;
    }

    try {

      if (editingId) {

        await updateMember(editingId, {
          ...form,
          id: String(editingId)
        });

        setMessage("Member updated successfully.");

      } else {

        await addMember({
          ...form,
          id: String(Date.now())
        });

        setMessage("Member added successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);

      await loadMembers();

    } catch {

      setError("Could not save the member. Please try again.");

    }
  }

  function startEdit(member) {

    setForm({
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      membershipDate: member.membershipDate || ""
    });

    setEditingId(member.id);

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  async function handleDelete(member) {

    if (!window.confirm(`Delete member "${member.name}"?`)) {
      return;
    }

    try {

      await deleteMember(member.id);

      setMessage("Member deleted.");

      if (editingId === member.id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      await loadMembers();

    } catch {

      setError("Could not delete this member.");

    }
  }

  const filteredMembers = members.filter((member) =>
    `${member.name} ${member.email} ${member.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <section>

      <div className="page-heading">

        <div>
          <p className="eyebrow">LIBRARY RECORDS</p>
          <h2>Members</h2>

          <p className="muted">
            Add, search, edit and remove library members.
          </p>
        </div>

        <span className="count-pill">
          {members.length} members
        </span>

      </div>

      <div className="panel">

        <h3>
          {editingId ? "Edit member" : "Add a new member"}
        </h3>

        <Message type="success">{message}</Message>
        <Message type="error">{error}</Message>

        <form className="form-grid" onSubmit={handleSubmit}>

          <label>
            Full name

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter member name"
              required
            />

          </label>

          <label>
            Email address

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />

          </label>

          <label>
            Phone number

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              maxLength="10"
              placeholder="10 digit phone number"
              required
            />

          </label>

          <label>
            Membership date

            <input
              name="membershipDate"
              type="date"
              value={form.membershipDate}
              onChange={handleChange}
              required
            />

          </label>

          <div className="form-actions">

            <button
              className="primary-button"
              type="submit"
            >
              {editingId ? "Save changes" : "Add member"}
            </button>

            {editingId && (

              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel edit
              </button>

            )}

          </div>

        </form>

      </div>

      <div className="panel">

        <div className="panel-heading">

          <h3>Member list</h3>

          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email or phone..."
          />

        </div>

        {loading ? (
          <p>Loading members...</p>

        ) : filteredMembers.length === 0 ? (

          <p className="muted">
            No members found. Add your first member above.
          </p>

        ) : (

          <div className="table-wrap">

            <table>

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredMembers.map((member) => (

                  <tr key={member.id}>

                    <td className="strong-cell">
                      {member.name}
                    </td>

                    <td>{member.email}</td>
                    <td>{member.phone}</td>
                    <td>{member.membershipDate}</td>

                    <td className="actions">

                      <button
                        className="small-button"
                        onClick={() => startEdit(member)}
                      >
                        Edit
                      </button>

                      <button
                        className="small-button danger-button"
                        onClick={() => handleDelete(member)}
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </section>
  );
}