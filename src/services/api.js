
const API_URL = "http://localhost:3000";

// Get all books
export const getBooks = async () => {
  const response = await fetch(`${API_URL}/books`);
  if (!response.ok) throw new Error("Failed to load books");
  return response.json();
};

// Add a new book
export const addBook = async (book) => {
  const response = await fetch(`${API_URL}/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(book)
  });

  if (!response.ok) throw new Error("Failed to add book");
  return response.json();
};

// Update a book
export const updateBook = async (id, book) => {
  const response = await fetch(`${API_URL}/books/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(book)
  });

  if (!response.ok) throw new Error("Failed to update book");
  return response.json();
};

// Delete a book
export const deleteBook = async (id) => {
  const response = await fetch(`${API_URL}/books/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) throw new Error("Failed to delete book");
  return true;
};

// Get all members
export const getMembers = async () => {
  const response = await fetch(`${API_URL}/members`);
  if (!response.ok) throw new Error("Failed to load members");
  return response.json();
};

// Add a member
export const addMember = async (member) => {
  const response = await fetch(`${API_URL}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(member)
  });

  if (!response.ok) throw new Error("Failed to add member");
  return response.json();
};

// Update a member
export const updateMember = async (id, member) => {
  const response = await fetch(`${API_URL}/members/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(member)
  });

  if (!response.ok) throw new Error("Failed to update member");
  return response.json();
};

// Delete a member
export const deleteMember = async (id) => {
  const response = await fetch(`${API_URL}/members/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) throw new Error("Failed to delete member");
  return true;
};

// Get transactions
export const getTransactions = async () => {
  const response = await fetch(`${API_URL}/transactions`);
  if (!response.ok) throw new Error("Failed to load transactions");
  return response.json();
};

// Add transaction
export const addTransaction = async (transaction) => {
  const response = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(transaction)
  });

  if (!response.ok) throw new Error("Failed to add transaction");
  return response.json();
};

// Update an existing transaction
export const updateTransaction = async (id, transaction) => {
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(transaction)
  });

  if (!response.ok) {
    throw new Error("Failed to update transaction");
  }

  return response.json();
};

// Delete an existing transaction
export const deleteTransaction = async (id) => {
  const response = await fetch(
    `${API_URL}/transactions/${id}`,
    {
      method: "DELETE"
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete transaction");
  }

  return true;
};
