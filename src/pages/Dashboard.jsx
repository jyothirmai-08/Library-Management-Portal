import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getBooks,
  getMembers,
  getTransactions
} from "../services/api";

import Message from "../components/Message";

export default function Dashboard() {
  const [data, setData] = useState({
    books: [],
    members: [],
    transactions: []
  });

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [books, members, transactions] =
          await Promise.all([
            getBooks(),
            getMembers(),
            getTransactions()
          ]);

        setData({
          books,
          members,
          transactions
        });

      } catch (err) {
        setError("Could not load dashboard. Check JSON Server.");
      }
    }

    loadDashboard();
  }, []);

  const totalCopies = data.books.reduce(
    (sum, book) => sum + Number(book.totalCopies || 0),
    0
  );

  const availableCopies = data.books.reduce(
    (sum, book) => sum + Number(book.availableCopies || 0),
    0
  );

  const issuedCopies = totalCopies - availableCopies;

  const activeLoans = data.transactions.filter(
    (item) => item.status === "Issued"
  );

  return (
    <section>

      <div className="page-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h2>Dashboard</h2>
          <p className="muted">
            Welcome to your library workspace.
          </p>
        </div>
      </div>

      <Message type="error">{error}</Message>

      <div className="stats-grid">

        <Stat
          label="Book titles"
          value={data.books.length}
        />

        <Stat
          label="Total copies"
          value={totalCopies}
        />

        <Stat
          label="Available copies"
          value={availableCopies}
        />

        <Stat
          label="Issued copies"
          value={issuedCopies}
        />

        <Stat
          label="Members"
          value={data.members.length}
        />

        <Stat
          label="Active loans"
          value={activeLoans.length}
        />

      </div>

      <div className="panel">

        <div className="panel-heading">
          <h3>Currently issued books</h3>

          <Link to="/transactions">
            View transactions →
          </Link>
        </div>

        {activeLoans.length === 0 ? (
          <p className="muted">
            There are no active loans.
          </p>
        ) : (

          <div className="table-wrap">
            <table>

              <thead>
                <tr>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Issue date</th>
                  <th>Due date</th>
                </tr>
              </thead>

              <tbody>
                {activeLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td>{loan.bookTitle}</td>
                    <td>{loan.memberName}</td>
                    <td>{loan.issueDate}</td>
                    <td>{loan.dueDate}</td>
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

function Stat({ label, value }) {
  return (
    <article className="stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}