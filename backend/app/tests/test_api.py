import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

# Setup in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_duplicate_sku():
    # 1. Create first product
    product_data = {"name": "Test Prod", "sku": "SKU-1", "price": 10.0, "quantity": 100}
    res = client.post("/products", json=product_data)
    assert res.status_code == 201

    # 2. Try creating same SKU
    res2 = client.post("/products", json=product_data)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]

def test_duplicate_email():
    # 1. Create customer
    customer_data = {"full_name": "John Doe", "email": "john@test.com", "phone": "12345"}
    res = client.post("/customers", json=customer_data)
    assert res.status_code == 201

    # 2. Try creating same email
    res2 = client.post("/customers", json=customer_data)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]

def test_successful_order_creation_and_stock_reduction():
    # 1. Create Product
    product_data = {"name": "Test Prod", "sku": "SKU-ORDER", "price": 10.0, "quantity": 50}
    prod_res = client.post("/products", json=product_data)
    prod_id = prod_res.json()["id"]

    # 2. Create Customer
    customer_data = {"full_name": "Jane Doe", "email": "jane@test.com", "phone": "12345"}
    cust_res = client.post("/customers", json=customer_data)
    cust_id = cust_res.json()["id"]

    # 3. Create Order for 10 items
    order_data = {
        "customer_id": cust_id,
        "items": [{"product_id": prod_id, "quantity": 10}]
    }
    order_res = client.post("/orders", json=order_data)
    assert order_res.status_code == 201
    assert order_res.json()["total_amount"] == 100.0

    # 4. Verify Stock is reduced to 40
    prod_verify = client.get(f"/products/{prod_id}")
    assert prod_verify.json()["quantity"] == 40

def test_insufficient_stock():
    # 1. Create Product with 5 items
    product_data = {"name": "Test Prod", "sku": "SKU-LOW", "price": 10.0, "quantity": 5}
    prod_res = client.post("/products", json=product_data)
    prod_id = prod_res.json()["id"]

    # 2. Create Customer
    customer_data = {"full_name": "Low Stock", "email": "low@test.com", "phone": "12345"}
    cust_res = client.post("/customers", json=customer_data)
    cust_id = cust_res.json()["id"]

    # 3. Attempt Order for 10 items
    order_data = {
        "customer_id": cust_id,
        "items": [{"product_id": prod_id, "quantity": 10}]
    }
    order_res = client.post("/orders", json=order_data)
    assert order_res.status_code == 400
    assert "Insufficient inventory" in order_res.json()["detail"]
