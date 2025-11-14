#!/usr/bin/env python3
"""
Backend API Testing for Family's Restaurant Back Office Admin Endpoints
Tests all admin endpoints: Categories, Products, Options, Orders, Notifications, Promos, Upload, AI Marketing
"""

import asyncio
import aiohttp
import json
import sys
import uuid
from typing import Dict, Optional, List
from datetime import datetime, timezone
import io

# Backend URL from environment
BACKEND_URL = "https://admin-kitchen.preview.emergentagent.com"

class AdminBackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = None
        self.test_results = []
        self.created_items = {
            "categories": [],
            "products": [],
            "options": [],
            "notifications": [],
            "promos": []
        }
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_result(self, test_name: str, success: bool, message: str, response_data: Optional[Dict] = None, status_code: Optional[int] = None):
        """Log test result."""
        status = "✅ PASS" if success else "❌ FAIL"
        status_info = f" (HTTP {status_code})" if status_code else ""
        print(f"{status} {test_name}{status_info}: {message}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "status_code": status_code,
            "response_data": response_data
        })
        
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
    
    # ==================== CATEGORIES TESTS ====================
    
    async def test_categories_get_all(self) -> bool:
        """Test GET /api/v1/admin/categories - Liste toutes les catégories."""
        test_name = "Categories - GET All"
        
        try:
            async with self.session.get(f"{self.base_url}/api/v1/admin/categories") as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if "categories" in data and isinstance(data["categories"], list):
                        self.log_result(test_name, True, f"Retrieved {len(data['categories'])} categories", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Unexpected status: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_categories_create(self) -> bool:
        """Test POST /api/v1/admin/categories - Créer catégorie."""
        test_name = "Categories - POST Create"
        
        try:
            category_data = {
                "name": "Test Burgers Deluxe",
                "slug": "test-burgers-deluxe",
                "image": "/uploads/test-burger.jpg",
                "order": 1
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/categories",
                json=category_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                status_code = response.status
                
                if status_code == 201:
                    data = await response.json()
                    if data.get("success") and "category" in data:
                        category_id = data["category"]["id"]
                        self.created_items["categories"].append(category_id)
                        self.log_result(test_name, True, f"Category created with ID: {category_id}", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to create: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_categories_update(self) -> bool:
        """Test PUT /api/v1/admin/categories/{id} - Modifier catégorie."""
        test_name = "Categories - PUT Update"
        
        if not self.created_items["categories"]:
            self.log_result(test_name, False, "No category ID available for update test")
            return False
        
        try:
            category_id = self.created_items["categories"][0]
            update_data = {
                "name": "Test Burgers Deluxe UPDATED",
                "description": "Description mise à jour"
            }
            
            async with self.session.put(
                f"{self.base_url}/api/v1/admin/categories/{category_id}",
                json=update_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if data.get("success") and "category" in data:
                        self.log_result(test_name, True, f"Category {category_id} updated successfully", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to update: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_categories_delete(self) -> bool:
        """Test DELETE /api/v1/admin/categories/{id} - Supprimer catégorie."""
        test_name = "Categories - DELETE"
        
        if not self.created_items["categories"]:
            self.log_result(test_name, False, "No category ID available for delete test")
            return False
        
        try:
            category_id = self.created_items["categories"].pop(0)  # Remove from list after delete
            
            async with self.session.delete(f"{self.base_url}/api/v1/admin/categories/{category_id}") as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if data.get("success"):
                        self.log_result(test_name, True, f"Category {category_id} deleted successfully", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to delete: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    # ==================== PRODUCTS TESTS ====================
    
    async def test_products_get_all(self) -> bool:
        """Test GET /api/v1/admin/products - Liste tous les produits."""
        test_name = "Products - GET All"
        
        try:
            async with self.session.get(f"{self.base_url}/api/v1/admin/products") as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if "products" in data and isinstance(data["products"], list):
                        self.log_result(test_name, True, f"Retrieved {len(data['products'])} products", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Unexpected status: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_products_create(self) -> bool:
        """Test POST /api/v1/admin/products - Créer produit."""
        test_name = "Products - POST Create"
        
        try:
            product_data = {
                "name": "Test Burger Royal",
                "slug": f"test-burger-royal-{uuid.uuid4().hex[:8]}",
                "description": "Un burger royal de test",
                "base_price": 12.90,
                "category": "burgers",
                "image_url": "/uploads/test-burger.jpg",
                "tags": ["test"]
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/products",
                json=product_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                status_code = response.status
                
                if status_code == 201:
                    data = await response.json()
                    if data.get("success") and "product" in data:
                        product_id = data["product"]["id"]
                        self.created_items["products"].append(product_id)
                        self.log_result(test_name, True, f"Product created with ID: {product_id}", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to create: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_products_update(self) -> bool:
        """Test PUT /api/v1/admin/products/{id} - Modifier produit."""
        test_name = "Products - PUT Update"
        
        if not self.created_items["products"]:
            self.log_result(test_name, False, "No product ID available for update test")
            return False
        
        try:
            product_id = self.created_items["products"][0]
            update_data = {
                "name": "Test Burger Royal UPDATED",
                "price": 14.90,
                "description": "Description mise à jour"
            }
            
            async with self.session.put(
                f"{self.base_url}/api/v1/admin/products/{product_id}",
                json=update_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if data.get("success") and "product" in data:
                        self.log_result(test_name, True, f"Product {product_id} updated successfully", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to update: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_products_delete(self) -> bool:
        """Test DELETE /api/v1/admin/products/{id} - Supprimer produit."""
        test_name = "Products - DELETE"
        
        if not self.created_items["products"]:
            self.log_result(test_name, False, "No product ID available for delete test")
            return False
        
        try:
            product_id = self.created_items["products"].pop(0)
            
            async with self.session.delete(f"{self.base_url}/api/v1/admin/products/{product_id}") as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if data.get("success"):
                        self.log_result(test_name, True, f"Product {product_id} deleted successfully", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to delete: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    # ==================== OPTIONS TESTS ====================
    
    async def test_options_get_all(self) -> bool:
        """Test GET /api/v1/admin/options - Liste toutes les options."""
        test_name = "Options - GET All"
        
        try:
            async with self.session.get(f"{self.base_url}/api/v1/admin/options") as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if "options" in data and isinstance(data["options"], list):
                        self.log_result(test_name, True, f"Retrieved {len(data['options'])} options", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Unexpected status: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_options_create(self) -> bool:
        """Test POST /api/v1/admin/options - Créer option."""
        test_name = "Options - POST Create"
        
        try:
            option_data = {
                "name": "Taille Test",
                "type": "single",
                "required": True,
                "choices": [
                    {"name": "Petit", "price": 0.0},
                    {"name": "Moyen", "price": 1.50},
                    {"name": "Grand", "price": 2.50}
                ]
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/options",
                json=option_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                status_code = response.status
                
                if status_code == 201:
                    data = await response.json()
                    if data.get("success") and "option" in data:
                        option_id = data["option"]["id"]
                        self.created_items["options"].append(option_id)
                        self.log_result(test_name, True, f"Option created with ID: {option_id}", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to create: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_options_get_by_id(self) -> bool:
        """Test GET /api/v1/admin/options/{id} - Option par ID."""
        test_name = "Options - GET by ID"
        
        if not self.created_items["options"]:
            self.log_result(test_name, False, "No option ID available for get by ID test")
            return False
        
        try:
            option_id = self.created_items["options"][0]
            
            async with self.session.get(f"{self.base_url}/api/v1/admin/options/{option_id}") as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if "option" in data:
                        self.log_result(test_name, True, f"Retrieved option {option_id}", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to get option: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_options_update(self) -> bool:
        """Test PUT /api/v1/admin/options/{id} - Modifier option."""
        test_name = "Options - PUT Update"
        
        if not self.created_items["options"]:
            self.log_result(test_name, False, "No option ID available for update test")
            return False
        
        try:
            option_id = self.created_items["options"][0]
            update_data = {
                "name": "Taille Test UPDATED",
                "required": False
            }
            
            async with self.session.put(
                f"{self.base_url}/api/v1/admin/options/{option_id}",
                json=update_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if data.get("success") and "option" in data:
                        self.log_result(test_name, True, f"Option {option_id} updated successfully", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to update: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_options_delete(self) -> bool:
        """Test DELETE /api/v1/admin/options/{id} - Supprimer option."""
        test_name = "Options - DELETE"
        
        if not self.created_items["options"]:
            self.log_result(test_name, False, "No option ID available for delete test")
            return False
        
        try:
            option_id = self.created_items["options"].pop(0)
            
            async with self.session.delete(f"{self.base_url}/api/v1/admin/options/{option_id}") as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if data.get("success"):
                        self.log_result(test_name, True, f"Option {option_id} deleted successfully", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to delete: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    # ==================== ORDERS TESTS ====================
    
    async def test_orders_get_all(self) -> bool:
        """Test GET /api/v1/admin/orders - Liste toutes commandes."""
        test_name = "Orders - GET All"
        
        try:
            async with self.session.get(f"{self.base_url}/api/v1/admin/orders") as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if "orders" in data and isinstance(data["orders"], list):
                        self.log_result(test_name, True, f"Retrieved {len(data['orders'])} orders", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Unexpected status: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_orders_update_status(self) -> bool:
        """Test PATCH /api/v1/admin/orders/{id}/status - Changer statut."""
        test_name = "Orders - PATCH Status"
        
        try:
            # First get an order to update
            async with self.session.get(f"{self.base_url}/api/v1/admin/orders?limit=1") as response:
                if response.status == 200:
                    data = await response.json()
                    orders = data.get("orders", [])
                    if not orders:
                        self.log_result(test_name, False, "No orders available for status update test")
                        return False
                    
                    order_id = orders[0]["id"]
                    status_data = {"status": "in_preparation"}
                    
                    async with self.session.patch(
                        f"{self.base_url}/api/v1/admin/orders/{order_id}/status",
                        json=status_data,
                        headers={"Content-Type": "application/json"}
                    ) as update_response:
                        status_code = update_response.status
                        
                        if status_code == 200:
                            update_data = await update_response.json()
                            if update_data.get("success"):
                                self.log_result(test_name, True, f"Order {order_id} status updated", update_data, status_code)
                                return True
                            else:
                                self.log_result(test_name, False, "Invalid response structure", update_data, status_code)
                                return False
                        else:
                            error_data = await update_response.text()
                            self.log_result(test_name, False, f"Failed to update status: {error_data}", None, status_code)
                            return False
                else:
                    self.log_result(test_name, False, "Failed to get orders for status test")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_orders_update_payment(self) -> bool:
        """Test POST /api/v1/admin/orders/{id}/payment - Enregistrer paiement."""
        test_name = "Orders - POST Payment"
        
        try:
            # First get an order to update
            async with self.session.get(f"{self.base_url}/api/v1/admin/orders?limit=1") as response:
                if response.status == 200:
                    data = await response.json()
                    orders = data.get("orders", [])
                    if not orders:
                        self.log_result(test_name, False, "No orders available for payment update test")
                        return False
                    
                    order_id = orders[0]["id"]
                    payment_data = {
                        "payment_method": "card",
                        "payment_status": "completed"
                    }
                    
                    async with self.session.post(
                        f"{self.base_url}/api/v1/admin/orders/{order_id}/payment",
                        json=payment_data,
                        headers={"Content-Type": "application/json"}
                    ) as payment_response:
                        status_code = payment_response.status
                        
                        if status_code == 200:
                            payment_result = await payment_response.json()
                            if payment_result.get("success"):
                                self.log_result(test_name, True, f"Order {order_id} payment updated", payment_result, status_code)
                                return True
                            else:
                                self.log_result(test_name, False, "Invalid response structure", payment_result, status_code)
                                return False
                        else:
                            error_data = await payment_response.text()
                            self.log_result(test_name, False, f"Failed to update payment: {error_data}", None, status_code)
                            return False
                else:
                    self.log_result(test_name, False, "Failed to get orders for payment test")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    # ==================== NOTIFICATIONS TESTS ====================
    
    async def test_notifications_get_all(self) -> bool:
        """Test GET /api/v1/admin/notifications - Liste notifications."""
        test_name = "Notifications - GET All"
        
        try:
            async with self.session.get(f"{self.base_url}/api/v1/admin/notifications") as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if "notifications" in data and isinstance(data["notifications"], list):
                        self.log_result(test_name, True, f"Retrieved {len(data['notifications'])} notifications", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Unexpected status: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_notifications_create(self) -> bool:
        """Test POST /api/v1/admin/notifications - Créer notification."""
        test_name = "Notifications - POST Create"
        
        try:
            notification_data = {
                "title": "Test Notification",
                "message": "Ceci est une notification de test",
                "notification_type": "push",
                "target_segment": "all",
                "scheduled_at": datetime.now(timezone.utc).isoformat()
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/notifications",
                json=notification_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                status_code = response.status
                
                if status_code == 201:
                    data = await response.json()
                    if data.get("success") and "notification" in data:
                        notification_id = data["notification"]["id"]
                        self.created_items["notifications"].append(notification_id)
                        self.log_result(test_name, True, f"Notification created with ID: {notification_id}", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to create: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_notifications_update(self) -> bool:
        """Test PUT /api/v1/admin/notifications/{id} - Modifier notification."""
        test_name = "Notifications - PUT Update"
        
        if not self.created_items["notifications"]:
            self.log_result(test_name, False, "No notification ID available for update test")
            return False
        
        try:
            notification_id = self.created_items["notifications"][0]
            update_data = {
                "title": "Test Notification UPDATED",
                "message": "Message mis à jour"
            }
            
            async with self.session.put(
                f"{self.base_url}/api/v1/admin/notifications/{notification_id}",
                json=update_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if data.get("success") and "notification" in data:
                        self.log_result(test_name, True, f"Notification {notification_id} updated successfully", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to update: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_notifications_send(self) -> bool:
        """Test POST /api/v1/admin/notifications/{id}/send - Envoyer immédiatement."""
        test_name = "Notifications - POST Send"
        
        if not self.created_items["notifications"]:
            self.log_result(test_name, False, "No notification ID available for send test")
            return False
        
        try:
            notification_id = self.created_items["notifications"][0]
            
            async with self.session.post(f"{self.base_url}/api/v1/admin/notifications/{notification_id}/send") as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if "message" in data:
                        self.log_result(test_name, True, f"Notification {notification_id} sent successfully", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to send: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_notifications_delete(self) -> bool:
        """Test DELETE /api/v1/admin/notifications/{id} - Supprimer notification."""
        test_name = "Notifications - DELETE"
        
        if not self.created_items["notifications"]:
            self.log_result(test_name, False, "No notification ID available for delete test")
            return False
        
        try:
            notification_id = self.created_items["notifications"].pop(0)
            
            async with self.session.delete(f"{self.base_url}/api/v1/admin/notifications/{notification_id}") as response:
                status_code = response.status
                
                if status_code == 200:
                    self.log_result(test_name, True, f"Notification {notification_id} deleted successfully", None, status_code)
                    return True
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to delete: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    # ==================== PROMOS TESTS ====================
    
    async def test_promos_get_all(self) -> bool:
        """Test GET /api/v1/admin/promos - Liste promos."""
        test_name = "Promos - GET All"
        
        try:
            async with self.session.get(f"{self.base_url}/api/v1/admin/promos") as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if "promos" in data and isinstance(data["promos"], list):
                        self.log_result(test_name, True, f"Retrieved {len(data['promos'])} promos", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Unexpected status: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_promos_create(self) -> bool:
        """Test POST /api/v1/admin/promos - Créer promo."""
        test_name = "Promos - POST Create"
        
        try:
            promo_data = {
                "title": "Test Promo 50%",
                "description": "Promotion de test avec 50% de réduction",
                "discount_type": "percentage",
                "discount_value": 50.0,
                "start_date": datetime.now(timezone.utc).date().isoformat(),
                "end_date": datetime.now(timezone.utc).replace(month=12).date().isoformat(),
                "min_purchase": 20.0
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/promos",
                json=promo_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                status_code = response.status
                
                if status_code == 201:
                    data = await response.json()
                    if data.get("success") and "promo" in data:
                        promo_id = data["promo"]["id"]
                        self.created_items["promos"].append(promo_id)
                        self.log_result(test_name, True, f"Promo created with ID: {promo_id}", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to create: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_promos_update(self) -> bool:
        """Test PUT /api/v1/admin/promos/{id} - Modifier promo."""
        test_name = "Promos - PUT Update"
        
        if not self.created_items["promos"]:
            self.log_result(test_name, False, "No promo ID available for update test")
            return False
        
        try:
            promo_id = self.created_items["promos"][0]
            update_data = {
                "title": "Test Promo 50% UPDATED",
                "discount_value": 60.0
            }
            
            async with self.session.put(
                f"{self.base_url}/api/v1/admin/promos/{promo_id}",
                json=update_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if data.get("success") and "promo" in data:
                        self.log_result(test_name, True, f"Promo {promo_id} updated successfully", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to update: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_promos_delete(self) -> bool:
        """Test DELETE /api/v1/admin/promos/{id} - Supprimer promo."""
        test_name = "Promos - DELETE"
        
        if not self.created_items["promos"]:
            self.log_result(test_name, False, "No promo ID available for delete test")
            return False
        
        try:
            promo_id = self.created_items["promos"].pop(0)
            
            async with self.session.delete(f"{self.base_url}/api/v1/admin/promos/{promo_id}") as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if data.get("success"):
                        self.log_result(test_name, True, f"Promo {promo_id} deleted successfully", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to delete: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    # ==================== UPLOAD TESTS ====================
    
    async def test_upload_image(self) -> bool:
        """Test POST /api/v1/admin/upload/image - Upload image."""
        test_name = "Upload - POST Image"
        
        try:
            # Create a simple test image (1x1 pixel PNG)
            test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
            
            # Create form data
            data = aiohttp.FormData()
            data.add_field('file', 
                          io.BytesIO(test_image_data), 
                          filename='test.png', 
                          content_type='image/png')
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/upload/image",
                data=data
            ) as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if data.get("success") and "url" in data:
                        self.log_result(test_name, True, f"Image uploaded successfully: {data['url']}", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to upload: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    # ==================== AI MARKETING TESTS ====================
    
    async def test_ai_marketing_get_campaigns(self) -> bool:
        """Test GET /api/v1/admin/ai-marketing/campaigns - Liste campagnes."""
        test_name = "AI Marketing - GET Campaigns"
        
        try:
            async with self.session.get(f"{self.base_url}/api/v1/admin/ai-marketing/campaigns/all") as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if "campaigns" in data and isinstance(data["campaigns"], list):
                        self.log_result(test_name, True, f"Retrieved {len(data['campaigns'])} campaigns", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Unexpected status: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_ai_marketing_generate(self) -> bool:
        """Test POST /api/v1/admin/ai-marketing/campaigns/generate - Générer campagne."""
        test_name = "AI Marketing - POST Generate"
        
        try:
            generate_data = {
                "force_regenerate": True
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/ai-marketing/campaigns/generate",
                json=generate_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                status_code = response.status
                
                if status_code == 200:
                    data = await response.json()
                    if data.get("success") and "campaigns_generated" in data:
                        self.log_result(test_name, True, f"Generated {data['campaigns_generated']} campaigns", data, status_code)
                        return True
                    else:
                        self.log_result(test_name, False, "Invalid response structure", data, status_code)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to generate: {error_data}", None, status_code)
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    # ==================== MAIN TEST RUNNER ====================
    
    async def run_all_tests(self):
        """Run all admin backend tests."""
        print(f"🚀 Starting Admin Backend API Tests for: {self.base_url}")
        print("=" * 80)
        
        # Test sequence organized by endpoint
        test_groups = [
            ("CATEGORIES", [
                ("Categories - GET All", self.test_categories_get_all),
                ("Categories - POST Create", self.test_categories_create),
                ("Categories - PUT Update", self.test_categories_update),
                ("Categories - DELETE", self.test_categories_delete),
            ]),
            ("PRODUCTS", [
                ("Products - GET All", self.test_products_get_all),
                ("Products - POST Create", self.test_products_create),
                ("Products - PUT Update", self.test_products_update),
                ("Products - DELETE", self.test_products_delete),
            ]),
            ("OPTIONS", [
                ("Options - GET All", self.test_options_get_all),
                ("Options - POST Create", self.test_options_create),
                ("Options - GET by ID", self.test_options_get_by_id),
                ("Options - PUT Update", self.test_options_update),
                ("Options - DELETE", self.test_options_delete),
            ]),
            ("ORDERS", [
                ("Orders - GET All", self.test_orders_get_all),
                ("Orders - PATCH Status", self.test_orders_update_status),
                ("Orders - POST Payment", self.test_orders_update_payment),
            ]),
            ("NOTIFICATIONS", [
                ("Notifications - GET All", self.test_notifications_get_all),
                ("Notifications - POST Create", self.test_notifications_create),
                ("Notifications - PUT Update", self.test_notifications_update),
                ("Notifications - POST Send", self.test_notifications_send),
                ("Notifications - DELETE", self.test_notifications_delete),
            ]),
            ("PROMOS", [
                ("Promos - GET All", self.test_promos_get_all),
                ("Promos - POST Create", self.test_promos_create),
                ("Promos - PUT Update", self.test_promos_update),
                ("Promos - DELETE", self.test_promos_delete),
            ]),
            ("UPLOAD", [
                ("Upload - POST Image", self.test_upload_image),
            ]),
            ("AI MARKETING", [
                ("AI Marketing - GET Campaigns", self.test_ai_marketing_get_campaigns),
                ("AI Marketing - POST Generate", self.test_ai_marketing_generate),
            ])
        ]
        
        total_passed = 0
        total_tests = 0
        
        for group_name, tests in test_groups:
            print(f"\n📋 Testing {group_name}")
            print("-" * 40)
            
            group_passed = 0
            for test_name, test_func in tests:
                total_tests += 1
                try:
                    result = await test_func()
                    if result:
                        total_passed += 1
                        group_passed += 1
                except Exception as e:
                    self.log_result(test_name, False, f"Test execution failed: {str(e)}")
            
            print(f"   {group_name}: {group_passed}/{len(tests)} tests passed")
        
        print("\n" + "=" * 80)
        print(f"📊 FINAL RESULTS: {total_passed}/{total_tests} tests passed")
        
        if total_passed == total_tests:
            print("🎉 All tests PASSED!")
            return True
        else:
            print(f"⚠️  {total_tests - total_passed} tests FAILED")
            return False

async def main():
    """Main test runner."""
    async with AdminBackendTester() as tester:
        success = await tester.run_all_tests()
        return 0 if success else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)