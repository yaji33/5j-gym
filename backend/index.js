import express from "express";
import mysql from "mysql";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "yajidev",
  database: "5j_gym",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database");
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json("hello this is the backend!");
});

app.get("/customer/:id/log-history", (req, res) => {
  const customerId = req.params.id;
  const q = "SELECT * FROM customer_logs WHERE customer_id = ?";
  db.query(q, [customerId], (err, data) => {
    if (err) {
      console.error("Error fetching customer logs:", err);
      return res.status(500).json(err);
    }
    return res.json(data);
  });
});

app.post("/customer/:id/log-history", (req, res) => {
  const customerId = req.params.id;
  const { subscription, charge, instructor, date_added, date_ended } = req.body;

  const q = `
    INSERT INTO customer_logs (customer_id, subscription, charge, instructor, date_added, date_ended)
    VALUES (?, ?, ?, ?, ?, ?)`;

  const values = [customerId, subscription, charge, instructor, date_added, date_ended];

  db.query(q, values, (err, data) => {
    if (err) {
      console.error("Error inserting customer log:", err);
      return res.status(500).json(err);
    }
    return res.json("Customer log has been added successfully");
  });
});

app.get("/customer", (req, res) => {
  const q = "SELECT * FROM customer";
  db.query(q, (err, data) => {
    if (err) {
      console.error("Error fetching customers:", err);
      return res.status(500).json(err);
    }
    const currentDate = new Date();

    const updatedData = data.map(customer => {
      let status = 'active';
      const dateAdded = new Date(customer.date_added);
      let expiryDate = new Date(dateAdded);

      switch (customer.subscription) {
        case 'basic':
          expiryDate.setDate(dateAdded.getDate() + 1);
          break;
        case 'premium':
          expiryDate.setDate(dateAdded.getDate() + 7);
          break;
        case 'vip-monthly':
          expiryDate.setMonth(dateAdded.getMonth() + 1);
          break;
        case 'vip-yearly':
          expiryDate.setFullYear(dateAdded.getFullYear() + 1);
          break;
        default:
          expiryDate = dateAdded;
      }
      if (currentDate > expiryDate) {
        status = 'expired';
        // Log the expiration if it hasn't been logged
        const logQuery = `
          INSERT INTO customer_logs (customer_id, subscription, charge, instructor, date_added, date_ended)
          SELECT ?, ?, ?, ?, ?, ?
          FROM DUAL
          WHERE NOT EXISTS (
            SELECT 1 FROM customer_logs
            WHERE customer_id = ? AND date_ended IS NOT NULL
          )`;
        const logValues = [
          customer.id, customer.subscription, customer.charge, customer.instructor,
          customer.date_added, currentDate, customer.id
        ];
        db.query(logQuery, logValues, (logErr) => {
          if (logErr) console.error("Error logging expiration:", logErr);
        });
      }
      return {
        ...customer,
        status
      };
    });

    return res.json(updatedData);
  });
});

app.post("/customer", (req, res) => {
  const q = `
    INSERT INTO customer (firstName, lastName, address, gender, birthdate, instructor, subscription, charge)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    req.body.firstName,
    req.body.lastName,
    req.body.address,
    req.body.gender,
    req.body.birthdate,
    req.body.instructor,
    req.body.subscription,
    req.body.charge,
  ];

  db.query(q, values, (err, data) => {
    if (err) {
      console.error("Error inserting customer:", err);
      return res.status(500).json(err);
    }
    return res.json("Customer has been added successfully");
  });
});
app.put("/customer/:id/renew", (req, res) => {
  const customerId = req.params.id;
  const { instructor, subscription, charge } = req.body;

  // Basic validation
  if (!instructor || !subscription || !charge) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const dateAdded = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const q = `
    UPDATE customer
    SET instructor = ?, subscription = ?, charge = ?, date_added = ?
    WHERE id = ?`;

  const values = [instructor, subscription, charge, dateAdded, customerId];

  db.query(q, values, (err) => {
    if (err) {
      console.error("Error renewing customer subscription:", err);
      return res.status(500).json({ error: "Error renewing customer subscription", details: err });
    }

    // Add a log entry for the renewal
    const logQuery = `
      INSERT INTO customer_logs (customer_id, subscription, charge, instructor, date_added, date_ended)
      VALUES (?, ?, ?, ?, ?, ?)`;

    const logValues = [customerId, subscription, charge, instructor, dateAdded, null];

    db.query(logQuery, logValues, (logErr) => {
      if (logErr) {
        console.error("Error logging renewal:", logErr);
        return res.status(500).json({ error: "Error logging renewal", details: logErr });
      }

      return res.json("Customer subscription has been renewed successfully");
    });
  });
});

app.listen(8800, () => {
  console.log("Connected to backend!");
});

