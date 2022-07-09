let db;

const request = indexedDB.open("budget_tracker", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;

  db.createObjectStore("new_transactions", { autoIncrement: true });
};


request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadTransaction();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transactions = db.transactions(["new_transactions"], "readwrite");

  const transactonObjectStore = transactions.objectStore("new_transactions");

  transactonObjectStore.add(record);
}

function uploadTransaction() {
  const transaction = db.transaction(["new_transactions"], "readwrite");

  const transactonObjectStore = transaction.objectStore("new_transactions");

  const getAll = transactonObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(["new_transactions"], "readwrite");

          const transactonObjectStore =
            transaction.objectStore("new_transactions");

          transactonObjectStore.clear();

          alert("All saved transactions have been submitted");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

window.addEventListener('online', uploadTransaction);