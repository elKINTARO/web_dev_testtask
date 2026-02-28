# Drone Food Delivery — Backend

A FastAPI backend for a drone-based food delivery platform. Users can browse cafes, order dishes, and the system automatically calculates the delivery route, flight time, and NY sales tax.

---

## Prerequisites

Before you start, make sure the following tools are installed on your machine:

| Tool | Version | Download |
|------|---------|----------|
| **Python** | 3.10 or higher | https://www.python.org/downloads/ |
| **Docker Desktop** | latest | https://www.docker.com/products/docker-desktop/ |
| **Git** | latest | https://git-scm.com/downloads |

> **Windows users:** During Python installation, check the box **"Add Python to PATH"**. Without this the `python` command will not work in the terminal.

> **Docker Desktop** must be **running** (open the app) before you start the database step.

---

## Step-by-Step Setup

### 1. Clone the repository

Open a terminal (PowerShell on Windows, Terminal on macOS/Linux) and run:

```bash
git clone <repository-url>
cd web_dev_testtask/backend
```

### 2. Create a virtual environment

A virtual environment keeps the project dependencies isolated from the rest of your system.

```bash
python -m venv venv
```

### 3. Activate the virtual environment

You must activate it every time you open a new terminal session.

**Windows (PowerShell):**
```powershell
venv\Scripts\Activate.ps1
```

> If you get a security error on Windows, run this first:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

**macOS / Linux:**
```bash
source venv/bin/activate
```

After activation your terminal prompt will show `(venv)` at the beginning — that means it is active.

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

This installs FastAPI, SQLAlchemy, asyncpg, Pydantic, and all other required packages.

### 5. Create the environment file

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**
```bash
cp .env.example .env
```

The `.env` file stores your database credentials. The default values work out of the box with the provided Docker configuration — **no changes needed**.

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/drone_delivery
```

### 6. Start the PostgreSQL database

Make sure **Docker Desktop is open and running**, then:

```bash
docker compose up -d
```

This downloads a PostgreSQL 17 image and starts it as a background container. Data is persisted between restarts.

To verify the database is running:
```bash
docker compose ps
```
You should see a container with status `running`.

### 7. Seed the database

Populate the database with sample cafes and dishes:

```bash
python seed.py
```

Expected output:
```
Initializing database tables...
Tables created OK
Seeding cafes and dishes...
  + Pizza Palace       (3 dishes)
  + Sushi World        (3 dishes)
  + Burger House 3     (5 dishes)
Done! Database seeded successfully.
```

> To reset and re-seed from scratch: `python seed.py --clear`

### 8. Start the API server

**Windows (PowerShell):**
```powershell
venv\Scripts\uvicorn.exe main:app --port 8000 --reload
```

**macOS / Linux:**
```bash
uvicorn main:app --port 8000 --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

The `--reload` flag automatically restarts the server when you edit a source file — useful during development.

---

## Exploring the API

### Interactive docs (recommended for beginners)

Open your browser and go to:

- **Swagger UI:** http://localhost:8000/docs — click any endpoint, press **"Try it out"**, fill in the fields, and click **"Execute"**
- **ReDoc:** http://localhost:8000/redoc — clean readable reference

---

## API Endpoints

### Cafes

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/cafes` | List all cafes (supports `?category=Fast Food&limit=20&offset=0`) |
| `GET` | `/cafes/{id}` | Get a single cafe with its full dish menu |

### Orders

| Method | URL | Description |
|--------|-----|-------------|
| `POST` | `/orders` | Create a new order |
| `GET` | `/orders` | List all orders (supports `?limit=20&offset=0`) |
| `GET` | `/orders/{id}` | Get a single order with all its items |

### System

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/health` | Health check — returns `{"status": "ok"}` |

---

## Testing the API

You can test via the Swagger UI at http://localhost:8000/docs or with the terminal examples below.

### Get all cafes

**macOS / Linux:**
```bash
curl http://localhost:8000/cafes
```

**Windows PowerShell:**
```powershell
Invoke-RestMethod http://localhost:8000/cafes | ConvertTo-Json -Depth 3
```

### Get a single cafe with its dishes

**macOS / Linux:**
```bash
curl http://localhost:8000/cafes/3
```

**Windows PowerShell:**
```powershell
Invoke-RestMethod http://localhost:8000/cafes/3 | ConvertTo-Json -Depth 4
```

### Create an order

Order 2x Classic Cheeseburger and 1x Bacon Burger from Burger House 3, delivered to Manhattan:

**macOS / Linux:**
```bash
curl -X POST http://localhost:8000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "cafe_id": 3,
    "end_lat": 40.7128,
    "end_lon": -74.0060,
    "items": [
      {"dish_id": 7, "quantity": 2},
      {"dish_id": 8, "quantity": 1}
    ]
  }'
```

**Windows PowerShell:**
```powershell
$body = '{"cafe_id":3,"end_lat":40.7128,"end_lon":-74.0060,"items":[{"dish_id":7,"quantity":2},{"dish_id":8,"quantity":1}]}'
Invoke-RestMethod -Method POST http://localhost:8000/orders -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 4
```

**Expected response:**
```json
{
  "id": 1,
  "cafe_id": 3,
  "end_lat": 40.7128,
  "end_lon": -74.006,
  "subtotal": 28.0,
  "tax_amount": 2.48,
  "total_amount": 30.48,
  "breakdown": {
    "county": "New York",
    "tax_key": "New York City",
    "rate": 0.08875,
    "subtotal": 28.0,
    "tax_amount": 2.48,
    "total_amount": 30.48
  },
  "distance_km": 4.17,
  "estimated_flight_time": 4.17,
  "status": "pending",
  "timestamp": "2026-02-25T17:49:33.197900Z",
  "items": [
    {"id": 1, "order_id": 1, "dish_id": 7, "quantity": 2},
    {"id": 2, "order_id": 1, "dish_id": 8, "quantity": 1}
  ]
}
```

The backend automatically:
- Calculated the `subtotal` from dish prices x quantities ($9x2 + $10x1 = $28)
- Looked up the cafe GPS coordinates and calculated drone `distance_km` and `estimated_flight_time`
- Determined the NY sales tax rate (8.875% for Manhattan) based on delivery coordinates

### List all orders

**macOS / Linux:**
```bash
curl "http://localhost:8000/orders?limit=10"
```

**Windows PowerShell:**
```powershell
Invoke-RestMethod "http://localhost:8000/orders?limit=10" | ConvertTo-Json -Depth 3
```

### Get a specific order

**macOS / Linux:**
```bash
curl http://localhost:8000/orders/1
```

**Windows PowerShell:**
```powershell
Invoke-RestMethod http://localhost:8000/orders/1 | ConvertTo-Json -Depth 4
```

### Filter cafes by category

**macOS / Linux:**
```bash
curl "http://localhost:8000/cafes?category=Fast Food"
```

**Windows PowerShell:**
```powershell
Invoke-RestMethod "http://localhost:8000/cafes?category=Fast%20Food" | ConvertTo-Json -Depth 3
```

### Validation errors (expected failures)

**Order from nonexistent cafe — returns 404:**
```powershell
Invoke-WebRequest -Method POST http://localhost:8000/orders `
  -ContentType "application/json" `
  -Body '{"cafe_id":999,"end_lat":40.7128,"end_lon":-74.006,"items":[{"dish_id":7,"quantity":1}]}'
# Response: {"detail":"Cafe 999 not found."}
```

**Dish that does not belong to the cafe — returns 404:**
```powershell
Invoke-WebRequest -Method POST http://localhost:8000/orders `
  -ContentType "application/json" `
  -Body '{"cafe_id":3,"end_lat":40.7128,"end_lon":-74.006,"items":[{"dish_id":1,"quantity":1}]}'
# Response: {"detail":"Dishes not found in cafe 3: [1]"}
```

---

## Seeded Data Reference

After running `python seed.py` the database contains:

| Cafe ID | Name | Category | Location | Dish IDs |
|---------|------|----------|----------|----------|
| 1 | Pizza Palace | Italian | Midtown Manhattan | 1, 2, 3 |
| 2 | Sushi World | Japanese | Jamaica, Queens | 4, 5, 6 |
| 3 | Burger House 3 | Fast Food | Bay Ridge, Brooklyn | 7, 8, 9, 10, 11 |

**Dishes:**

| ID | Name | Price | Cafe |
|----|------|-------|------|
| 1 | Margherita | $12.00 | Pizza Palace |
| 2 | Pepperoni | $14.00 | Pizza Palace |
| 3 | BBQ Chicken Pizza | $15.00 | Pizza Palace |
| 4 | Salmon Roll | $11.00 | Sushi World |
| 5 | Tuna Sashimi | $16.00 | Sushi World |
| 6 | Dragon Roll | $18.00 | Sushi World |
| 7 | Classic Cheeseburger | $9.00 | Burger House 3 |
| 8 | Bacon Burger | $10.00 | Burger House 3 |
| 9 | Mushroom Swiss Burger | $11.00 | Burger House 3 |
| 10 | Crispy Chicken Burger | $10.50 | Burger House 3 |
| 11 | Veggie Burger | $8.50 | Burger House 3 |

---

## Stopping

```bash
# Stop the API server
# Press Ctrl+C in the terminal where uvicorn is running

# Stop the database container (data is preserved)
docker compose down

# Stop and delete all database data (full reset)
docker compose down -v
```
