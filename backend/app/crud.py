from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from . import models, schemas

# Products
def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.model_dump())
    try:
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")

def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    
    update_data = product.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
        return True
    return False

# Customers
def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Customer).offset(skip).limit(limit).all()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = models.Customer(**customer.model_dump())
    try:
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        return db_customer
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Customer with this email already exists")

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if db_customer:
        db.delete(db_customer)
        db.commit()
        return True
    return False

# Orders
def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Order).offset(skip).limit(limit).all()

def create_order(db: Session, order: schemas.OrderCreate):
    # Verify customer
    db_customer = get_customer(db, order.customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    total_amount = 0
    # Use a nested transaction/savepoint effectively by not committing until everything is verified
    db_order = models.Order(customer_id=order.customer_id, total_amount=0)
    db.add(db_order)
    db.flush() # get the order.id
    
    for item in order.items:
        db_product = db.query(models.Product).filter(models.Product.id == item.product_id).with_for_update().first()
        if not db_product:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Product with ID {item.product_id} not found")
            
        if db_product.quantity < item.quantity:
            db.rollback()
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient inventory for product {db_product.name}. Available: {db_product.quantity}, Requested: {item.quantity}"
            )
            
        # Reduce inventory
        db_product.quantity -= item.quantity
        
        # Calculate amount
        total_amount += db_product.price * item.quantity
        
        # Create order item
        db_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(db_item)
        
    try:
        db_order.total_amount = total_amount
        db.commit()
        db.refresh(db_order)
        return db_order
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error during order creation.")

def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if not db_order:
        return False
        
    # We could theoretically restore inventory here, but typical simple systems don't require it unless specified.
    # We will just delete it, and let cascade handle items.
    # Actually, we should probably restore stock just to be safe.
    for item in db_order.items:
        db_product = get_product(db, item.product_id)
        if db_product:
            db_product.quantity += item.quantity
            
    db.delete(db_order)
    db.commit()
    return True
