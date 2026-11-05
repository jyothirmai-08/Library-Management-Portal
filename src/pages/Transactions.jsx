import { useEffect, useState } from "react";

import {
  deleteTransaction,
  getTransactions
} from "../services/api";

import Message from "../components/Message";

export default function Transactions() {

  const [transactions, setTransactions] = useState([]);

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [error, setError] = useState("");

  async function load() {

    try {

      setTransactions(await getTransactions());
      setError("");

    } catch {

      setError("Could not load transactions. Check JSON Server.");

    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(item) {

    if (
      !window.confirm(
        "Delete this transaction record? This does not change book copies."
      )
    ) {
      return;
    }

    try {

      await deleteTransaction(item.id);

      await load();

    } catch {

      setError("Could not delete transaction.");

    }
  }

  const shown = transactions.filter((t) =>

    (filter === "All" || t.status === filter) &&

    `${t.bookTitle} ${t.memberName}`
      .toLowerCase()
      .includes(search.toLowerCase())

  );

  return (

    <section>

      <div className="page-heading">

        <div>
          <p className="eyebrow">ACTIVITY HISTORY</p>

          <h2>Transactions</h2>

          <p className="muted">
            View issue and return records.
          </p>
        </div>

      </div>

      <Message type="error">{error}</Message>

      <div className="panel">

        <div className="toolbar">

          <h3>Transaction history</h3>

          <input
            className="search-input"
            placeholder="Search book or member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >

            <option value="All">All</option>
            <option value="Issued">Issued</option>
            <option value="Returned">Returned</option>

          </select>

        </div>

        <div className="table-wrap">

          <table>

            <thead>

              <tr>
                <th>Book</th>
                <th>Member</th>
                <th>Issue date</th>
                <th>Due date</th>
                <th>Return date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {shown.map((t) => (

                <tr key={t.id}>

                  <td className="strong-cell">
                    {t.bookTitle}
                  </td>

                  <td>{t.memberName}</td>
                  <td>{t.issueDate}</td>
                  <td>{t.dueDate}</td>

                  <td>{t.returnDate || "—"}</td>

                  <td>
                    <span
                      className={
                        t.status === "Issued"
                          ? "status warning-status"
                          : "status"
                      }
                    >
                      {t.status}
                    </span>
                  </td>

                  <td>

                    <button
                      className="small-button danger-button"
                      onClick={() => remove(t)}
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {shown.length === 0 && (

            <p className="muted">
              No transactions match your search.
            </p>

          )}

        </div>

      </div>

    </section>

  );
}