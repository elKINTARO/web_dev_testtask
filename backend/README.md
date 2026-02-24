## Local Setup

### 1. Clone & navigate

```bash
cd backend
```

### 2. Create and activate virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\Activate.ps1

# macOS/Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment

```bash
cp .env.example .env
```

Edit `.env` if needed (default values work out of the box with Docker Compose):

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/drone_delivery
```

### 5. Start PostgreSQL

```bash
docker compose up -d
```

### 6. Run the server

```bash
uvicorn main:app --reload
```

API is available at: `http://localhost:8000`  
Swagger UI: `http://localhost:8000/docs`

---

## Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| `POST` | `/orders` | Create a single order `{lat, lon, subtotal}` |
| `POST` | `/orders/import` | Bulk import from CSV file |
| `GET` | `/orders` | List orders with pagination `?limit=20&offset=0` |
| `GET` | `/health` | Health check |

## CSV Format for Import

```csv
lat,lon,subtotal
40.7128,-74.0060,100.00
42.6526,-73.7562,75.00
```

---

## Stopping

```bash
# Stop server: Ctrl+C

# Stop database
docker compose down

# Stop database and remove data
docker compose down -v
```
