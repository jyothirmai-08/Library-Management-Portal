import { useEffect, useState } from "react";

import {
  addTransaction,
  getBooks,
  getMembers,
  getTransactions,
  updateBook,
  updateTransaction
} from "../services/api";

import Message from "../components/Message";

export default function Circulation({ mode }) {

  const isIssue = mode === "issue";

  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [bookId, setBookId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [transactionId, setTransactionId] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {

    try {

      const [b, m, t] = await Promise.all([
        getBooks(),
        getMembers(),
        getTransactions()
      ]);

      setBooks(b);
      setMembers(m);
      setTransactions(t);

    } catch {

      setError("Could not load data. Check JSON Server.");

    }
  }

  useEffect(() => {
    load();
  }, []);

  const activeLoans = transactions.filter(
    (t) => t.status === "Issued"
  );

  // ISSUE BOOK

  async function issueBook(e) {

    e.preventDefault();

    setError("");
    setMessage("");

    const book = books.find(
      (b) => String(b.id) === bookId
    );

    const member = members.find(
      (m) => String(m.id) === memberId
    );

    if (!book || !member || !dueDate) {

      setError("Choose a book, member and due date.");
      return;
    }

    if (Number(book.availableCopies) < 1) {

      setError("This book has no available copies.");
      return;
    }

    try {

      const updatedBook = {
        ...book,
        availableCopies:
          Number(book.availableCopies) - 1
      };

      await updateBook(book.id, updatedBook);

      await addTransaction({

        id: String(Date.now()),

        bookId: String(book.id),
        bookTitle: book.title,

        memberId: String(member.id),
        memberName: member.name,

        issueDate: new Date()
          .toISOString()
          .slice(0, 10),

        dueDate: dueDate,

        returnDate: "",

        status: "Issued"

      });

      setMessage(
        `"${book.title}" issued to ${member.name}.`
      );

      setBookId("");
      setMemberId("");
      setDueDate("");

      await load();

    } catch {

      setError("Issue operation failed. Please try again.");

      await load();

    }
  }

  // RETURN BOOK

  async function returnBook(e) {

    e.preventDefault();

    setError("");
    setMessage("");

    const loan = activeLoans.find(
      (t) => String(t.id) === transactionId
    );

    if (!loan) {

      setError("Select an active issue transaction.");
      return;
    }

    const book = books.find(
      (b) => String(b.id) === String(loan.bookId)
    );

    if (!book) {

      setError("The book record was not found.");
      return;
    }

    try {

      await updateBook(book.id, {

        ...book,

        availableCopies: Math.min(
          Number(book.totalCopies),
          Number(book.availableCopies) + 1
        )

      });

      await updateTransaction(loan.id, {

        ...loan,

        status: "Returned",

        returnDate: new Date()
          .toISOString()
          .slice(0, 10)

      });

      setMessage(
        `"${loan.bookTitle}" returned successfully.`
      );

      setTransactionId("");

      await load();

    } catch {

      setError("Return operation failed. Please try again.");

      await load();

    }
  }

  return (

    <section>

      <div className="page-heading">

        <div>

          <p className="eyebrow">BOOK CIRCULATION</p>

          <h2>
            {isIssue ? "Issue a book" : "Return a book"}
          </h2>

          <p className="muted">
            {isIssue
              ? "Give an available book to a registered member."
              : "Record the return of an issued book."}
          </p>

        </div>

      </div>

      <div className="panel circulation-panel">

        <Message type="success">{message}</Message>
        <Message type="error">{error}</Message>

        {isIssue ? (

          <form
            className="stack-form"
            onSubmit={issueBook}
          >

            <label>
              Select book

              <select
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                required
              >

                <option value="">Choose a book</option>

                {books
                  .filter(
                    (b) => Number(b.availableCopies) > 0
                  )
                  .map((b) => (

                    <option key={b.id} value={b.id}>
                      {b.title} ({b.availableCopies} available)
                    </option>

                  ))}

              </select>

            </label>

            <label>
              Select member

              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                required
              >

                <option value="">Choose a member</option>

                {members.map((m) => (

                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>

                ))}

              </select>

            </label>

            <label>
              Due date

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                required
              />

            </label>

            <button className="primary-button">
              Issue book
            </button>

          </form>

        ) : (

          <form
            className="stack-form"
            onSubmit={returnBook}
          >

            <label>
              Select issued book

              <select
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                required
              >

                <option value="">
                  Choose an active issue
                </option>

                {activeLoans.map((t) => (

                  <option key={t.id} value={t.id}>
                    {t.bookTitle} — {t.memberName}
                    (due {t.dueDate})
                  </option>

                ))}

              </select>

            </label>

            <button className="primary-button">
              Confirm return
            </button>

            {activeLoans.length === 0 && (

              <p className="muted">
                There are no books waiting to be returned.
              </p>

            )}

          </form>

        )}

      </div>

    </section>

  );
}

