import os

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models.product import Product
from app.models.user import User

# Create a test database
SQLALCHEMY_TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/novartis_test"
)

engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency override
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session")
def setup_test_db():
    Base.metadata.drop_all(bind=engine)

    # Run Alembic migrations
    Base.metadata.create_all(bind=engine)

    yield

    # Teardown - drop all tables
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_db(setup_test_db):
    """Reset the database state between tests"""
    # Start with a clean slate for each test
    connection = engine.connect()
    transaction = connection.begin()

    # Create a session bound to the transaction
    session = TestingSessionLocal(bind=connection)

    # Override the get_db dependency
    app.dependency_overrides[get_db] = lambda: session

    yield session

    # Clear the session
    session.close()

    # Rollback the transaction after the test
    transaction.rollback()
    connection.close()

    # Clear the dependency override
    app.dependency_overrides = {}


@pytest.fixture(scope="function")
def client(test_db):
    """Create a test client"""
    with TestClient(app=app) as c:
        yield c


@pytest.fixture(scope="function")
def test_user(client):
    user_data = {
        "email": "test@novartis.com",
        "password": "testpassword",
        "name": "Test User"
    }
    response = client.post("/users", json=user_data)
    assert response.status_code == 200
    return user_data


@pytest.fixture(scope="function")
def test_user_token(client, test_user):
    response = client.post("/users/token", data={
        "username": test_user["email"],
        "password": test_user["password"]
    })
    assert response.status_code == 200
    token = response.json().get("access_token")
    return token


@pytest.fixture(scope="function")
def authorized_client(client, test_user_token):
    client.headers = {
        **client.headers,
        "Authorization": f"Bearer {test_user_token}"
    }
    return client
