import pytest
from fastapi.testclient import TestClient


def test_register_user(client):
    user_data = {
        "email": "new@novartis.com",
        "password": "newpassword",
        "name": "New User"
    }
    response = client.post("/users", json=user_data)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["name"] == user_data["name"]
    assert "id" in data


def test_register_user_duplicate_email(client, test_user):
    user_data = {
        "email": test_user["email"],  # Using existing email
        "password": "newpassword",
        "name": "Another User"
    }
    response = client.post("/users", json=user_data)
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


def test_login_user(client, test_user):
    response = client.post("/users/token", data={
        "username": test_user["email"],
        "password": test_user["password"]
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_user_wrong_password(client, test_user):
    response = client.post("/users/token", data={
        "username": test_user["email"],
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_login_user_nonexistent(client):
    response = client.post("/users/token", data={
        "username": "nonexistent@novartis.com",
        "password": "password"
    })
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_get_current_user(authorized_client, test_user):
    response = authorized_client.get("/users/me")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user["email"]
    assert data["name"] == test_user["name"]


def test_get_current_user_unauthorized(client):
    response = client.get("/users/me")
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]
