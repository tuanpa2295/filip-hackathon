# Setup Backend

This repository contains the backend service built using **Django** and managed with **Poetry**. The application uses **PostgreSQL** as the database and supports environment-based configuration using `.env` and `django-environ`.

## 📦 Requirements

- Python 3.11+
- Poetry
- PostgreSQL 13+

## 🚀 Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/duongtq-fpt/reform-hackaithon
cd filip-backend
```

### 2. Install dependencies

```bash
poetry install
```

### 3. Create `.env` file

Edit `.env` with your database credentials:

```env
DEBUG=True
POSTGRES_DB=filip
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

## 🛠 Database Setup

### 4. Create the PostgreSQL database

```sql
-- Create the database
CREATE DATABASE filip;

-- Create the user with a password
CREATE USER "user" WITH PASSWORD 'password';

-- Grant privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE filip TO "user";

-- Set Up PostgreSQL with pgvector
CREATE EXTENSION IF NOT EXISTS vector;
```

## ⚙️ Running the App

### 5. Activate virtual environment

```bash
poetry env activate
```

### 6. Run migrations

```bash
poetry run python manage.py makemigrations
poetry run python manage.py migrate
```

### 7. Load Udemy course data from CSV

Make sure your Udemy CSV file (e.g. `udemy_courses_with_prices.csv`) is in the `data/` directory:

```bash
poetry run python manage.py load_udemy_courses --file data/udemy_courses_with_prices.csv
```

### 8. Embed course data using OpenAI

This will generate and store embeddings for all courses without one:

```bash
poetry run python manage.py embed_udemy_courses
```

### 9. Load skills from json file

- Make sure your json file (e.g `skills.json`) is in the `data/` directory:

```bash
poetry run python manage.py load_skills --file data/skills.json
poetry run python manage.py load_job_posts --file data/all_job_post.csv
```

### 10. Embed skills data using OpenAIEmbeddings

```bash
poetry run python manage.py embed_skills
```

### 9. Start the development server

```bash
poetry run python manage.py runserver
```

## 🛠️ Common Commands

| Task                   | Command                                       |
| ---------------------- | --------------------------------------------- |
| Create migration       | `poetry run python manage.py makemigrations`  |
| Apply migration        | `poetry run python manage.py migrate`         |
| Create superuser       | `poetry run python manage.py createsuperuser` |
| Run development server | `poetry run python manage.py runserver`       |

## 📝 Notes

- Make sure PostgreSQL is running before applying migrations.
- All credentials should be stored securely using `.env` and never committed to Git.
