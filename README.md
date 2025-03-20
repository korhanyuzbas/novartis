# Novartis Products Application

## Overview

This web application serves as a centralized repository for Novartis products. It provides a platform where authenticated employees can manage product information while offering a searchable catalog for all users.

## Features

### For All Users
- Browse a complete catalog of Novartis pharmaceutical products
- View detailed product information including name, ingredients, therapeutic areas, and regional availability
- Search products by name or ingredient
- Filter products by therapeutic area, region, or employee who added them
- Sort products by name, ingredient, therapeutic area, or creation date (ascending/descending)

### For Authenticated Employees
- Secure authentication system (login/signup)
- Create new product entries with comprehensive details
- Update product information (limited to products created by the user)
- Personal dashboard showing products they've added

## Technical Details

### Technology Stack
- **Backend**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT token-based authentication
- **Frontend**: HTML, CSS, JavaScript
- **Containerization**: Docker

### API Endpoints

The application provides RESTful API endpoints for:
- User authentication (login/signup)
- Product CRUD operations
- Search, filter, and sorting functionality

### Data Model

#### Product
- Name
- Ingredient
- Therapeutic Area
- Description
- Regions (available locations)
- Creation Date (automatically assigned)
- Creator (reference to Employee)

#### Employee (User)
- Username
- Email
- Password (hashed)
- Created Products (relationship)

## Docker Deployment Instructions

### Prerequisites
- Docker and Docker Compose installed on your system
- Git (to clone the repository)

### Setup and Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/korhanyuzbas/novartis.git
   cd novartis
   ```

2. **Build and start the Docker containers**
   ```bash
   docker-compose up -d --build
   ```
   
   This command will:
   - Build the application container
   - Set up the PostgreSQL database container
   - Configure the network between containers
   - Run database migrations
   - Start the web application

3. **Access the application**
   - Web interface: http://localhost
   - API documentation: http://localhost:8000/docs

## Development Setup (Optional)

If you prefer to run the application locally for development:

1. **Set up a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

4. **Start the application**
   ```bash
   uvicorn app.main:app --reload
   ```

5. **Open Main Page**
   
   - Open index.html inside `frontend` directory with your browser 
   

## Testing

Run the test suite with:
```bash
pytest
```


## TODOs

- Startup event should be removed after adding dynamic therapeutic area and regions
- Config data should be retrieved with dotenv
- Testing for products (currently user endpoints covered partially)

