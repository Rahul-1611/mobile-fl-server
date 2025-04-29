// index.js – Mobile-FL receiver + simple log page
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies (built-in middleware)
app.use(express.json());

// ----- in-memory ring buffer -----
const MAX_ROWS = 200;
let rows = [];

// ----- receiver endpoint -----
app.post("/update", (req, res) => {
    const { device_id, accuracy, battery, cpu, maxCPU } = req.body;
    const t = new Date().toISOString();

    const record = { t, device_id, accuracy, battery, cpu, maxCPU };
    console.log(record);

    rows.push(record);
    if (rows.length > MAX_ROWS) rows.shift();

    res.status(200).json({ received: true });
});

// ----- dashboard -----
app.get("/showLog", (_, res) => {
    const html = `
  <!DOCTYPE html><html><head>
    <meta charset="utf-8"><title>Mobile-FL Updates</title>
    <meta http-equiv="refresh" content="6">
    <style>
      body{font-family:Arial;margin:20px}
      table{border-collapse:collapse;width:100%}
      th,td{border:1px solid #ccc;padding:6px;text-align:center}
      th{background:#eee}
    </style></head><body>
    <h2>Last ${rows.length} updates</h2>
    <table>
      <tr><th>Time (UTC)</th><th>Device</th><th>Accuracy</th>
          <th>Battery %</th><th>CPU %</th><th>Max CPU %</th></tr>
      ${rows.map(r => `
        <tr><td>${r.t}</td><td>${r.device_id}</td>
            <td>${r.accuracy}</td><td>${r.battery}</td>
            <td>${r.cpu}</td><td>${r.maxCPU}</td></tr>`).join("")}
    </table>
    <p>Page refreshes every 6 s.</p>
  </body></html>`;
    res.send(html);
});

// Simple health check
app.get("/", (_, res) => res.send("Mobile-FL receiver up. See /showLog for table."));

app.listen(PORT, () => console.log(`Receiver listening on :${PORT}`));