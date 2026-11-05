import { useEffect, useState } from "react";

import {
  addBook,
  deleteBook,
  getBooks,
  updateBook
} from "../services/api";

import Message from "../components/Message";

const empty = {
  title: "",
  author: "",
  category: "",
  totalCopies: "1",
  availableCopies: "1"
};

export default function Books() {

  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setBooks(await getBooks());
      setError("");
    } catch {
      setError("Cannot connect to JSON Server.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function change(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function submit(e) {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.author.trim() ||
      !form.category.trim()
    ) {
      setError("Please complete all book details.");
      return;
    }

    const total = Number(form.totalCopies);

    if (!Number.isInteger(total) || total < 1) {
      setError("Total copies must be at least 1.");
      return;
    }

    try {
      const book = {
        ...form,
        totalCopies: total,
        availableCopies: editingId
          ? Number(form.availableCopies)
          : total
      };

      if (editingId) {
        await updateBook(editingId, {
          ...book,
          id: String(editingId)
        });
      } else {
        await addBook({
          ...book,
          id: String(Date.now())
        });
      }

      setMessage(
        editingId ? "Book updated." : "Book added."
      );

      setForm(empty);
      setEditingId(null);

      await load();

    } catch {
      setError("Unable to save book.");
    }
  }

  async function remove(book) {

    if (
      Number(book.availableCopies) !==
      Number(book.totalCopies)
    ) {
      setError(
        "Return all issued copies before deleting this book."
      );
      return;
    }

    if (!window.confirm(`Delete "${book.title}"?`)) {
      return;
    }

    await deleteBook(book.id);

    setMessage("Book deleted.");

    await load();
  }

  const filtered = books.filter((book) =>
    `${book.title} ${book.author} ${book.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <section>

      <div className="page-heading">
        <div>
          <p className="eyebrow">COLLECTION</p>
          <h2>Books</h2>
          <p className="muted">
            Manage the books in your library.
          </p>
        </div>
      </div>

      <div className="panel">

        <h3>{editingId ? "Edit book" : "Add a book"}</h3>

        <Message type="success">{message}</Message>
        <Message type="error">{error}</Message>

        <form className="form-grid" onSubmit={submit}>

          <label>
            Book title
            <input
              name="title"
              value={form.title}
              onChange={change}
              placeholder="Book title"
              required
            />
          </label>

          <label>
            Author
            <input
              name="author"
              value={form.author}
              onChange={change}
              placeholder="Author name"
              required
            />
          </label>

          <label>
            Category
            <input
              name="category"
              value={form.category}
              onChange={change}
              placeholder="Category"
              required
            />
          </label>

          <label>
            Total copies
            <input
              name="totalCopies"
              type="number"
              min="1"
              value={form.totalCopies}
              onChange={change}
              required
            />
          </label>

          <div className="form-actions">

            <button className="primary-button">
              {editingId ? "Save changes" : "Add book"}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditingId(null);
                  setForm(empty);
                }}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>

      <div className="panel">

        <div className="panel-heading">
          <h3>Book catalogue</h3>

          <input
            className="search-input"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-wrap">

          <table>

            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Total</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filtered.map((book) => (
                <tr key={book.id}>

                  <td className="strong-cell">
                    {book.title}
                  </td>

                  <td>{book.author}</td>
                  <td>{book.category}</td>
                  <td>{book.totalCopies}</td>

                  <td>
                    <span className="status">
                      {book.availableCopies} available
                    </span>
                  </td>

                  <td className="actions">

                    <button
                      className="small-button"
                      onClick={() => {
                        setEditingId(book.id);

                        setForm({
                          title: book.title,
                          author: book.author,
                          category: book.category,
                          totalCopies: String(book.totalCopies),
                          availableCopies: String(book.availableCopies)
                        });
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="small-button danger-button"
                      onClick={() => remove(book)}
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

          {filtered.length === 0 && (
            <p className="muted">No books found.</p>
          )}

        </div>

      </div>

    </section>
  );
}