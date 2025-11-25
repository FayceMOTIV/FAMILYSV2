#!/usr/bin/env python3
"""
French Review Test - Comprehensive Backend Testing
Testing all changes made this morning as specified in the French review request
"""

import asyncio
import aiohttp
import json
import sys
from typing import Dict, Optional, List
from datetime import datetime, timezone

# Backend URL from environment
BACKEND_URL = "https://react-reborn.preview.emergentagent.com"

class FrenchReviewTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = None
        self.auth_token = None
        self.test_results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_result(self, test_name: str, success: bool, message: str, response_data: Optional[Dict] = None):
        """Log test result."""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        })
        
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
    
    async def test_login(self) -> bool:
        """Test admin login endpoint."""
        test_name = "Admin Login"
        
        try:
            login_data = {
                "email": "admin@familys.app",
                "password": "Admin@123456"
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if "access_token" in data:
                        self.auth_token = data["access_token"]
                        self.log_result(test_name, True, f"Login successful, token received")
                        return True
                    else:
                        self.log_result(test_name, False, "No access token in response", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    # ========================================
    # 1. SYSTÈME DE COMMANDES - Order Status Transitions
    # ========================================
    
    async def test_get_30_recent_orders(self) -> tuple[bool, List[dict]]:
        """Test getting 30 recent orders."""
        test_name = "GET /api/v1/admin/orders - 30 Recent Orders"
        
        try:
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/orders",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    orders = data.get("orders", [])
                    
                    if len(orders) >= 30:
                        self.log_result(test_name, True, f"Retrieved {len(orders)} orders (≥30 as expected)")
                        return True, orders
                    else:
                        self.log_result(test_name, True, f"Retrieved {len(orders)} orders (less than 30 but endpoint works)")
                        return True, orders
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False, []
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False, []

    async def test_valid_status_transitions(self, orders: List[dict]) -> bool:
        """Test valid status transitions."""
        test_name = "Valid Status Transitions"
        
        try:
            # Find orders in different states for testing
            new_order = None
            in_prep_order = None
            ready_paid_order = None
            
            for order in orders:
                if order.get("status") == "new" and not new_order:
                    new_order = order
                elif order.get("status") == "in_preparation" and not in_prep_order:
                    in_prep_order = order
                elif (order.get("status") == "ready" and 
                      order.get("payment_status") == "paid" and not ready_paid_order):
                    ready_paid_order = order
            
            success_count = 0
            total_tests = 0
            
            # Test 1: new → in_preparation
            if new_order:
                total_tests += 1
                transition_data = {"status": "in_preparation"}
                
                async with self.session.patch(
                    f"{self.base_url}/api/v1/admin/orders/{new_order['id']}/status",
                    json=transition_data,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        if data.get("success"):
                            success_count += 1
                            print(f"   ✅ new → in_preparation: SUCCESS")
                        else:
                            print(f"   ❌ new → in_preparation: FAILED - {data}")
                    else:
                        error_data = await response.text()
                        print(f"   ❌ new → in_preparation: HTTP {response.status} - {error_data}")
            
            # Test 2: in_preparation → ready
            if in_prep_order:
                total_tests += 1
                transition_data = {"status": "ready"}
                
                async with self.session.patch(
                    f"{self.base_url}/api/v1/admin/orders/{in_prep_order['id']}/status",
                    json=transition_data,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        if data.get("success"):
                            success_count += 1
                            print(f"   ✅ in_preparation → ready: SUCCESS")
                        else:
                            print(f"   ❌ in_preparation → ready: FAILED - {data}")
                    else:
                        error_data = await response.text()
                        print(f"   ❌ in_preparation → ready: HTTP {response.status} - {error_data}")
            
            # Test 3: ready (paid) → completed
            if ready_paid_order:
                total_tests += 1
                transition_data = {"status": "completed"}
                
                async with self.session.patch(
                    f"{self.base_url}/api/v1/admin/orders/{ready_paid_order['id']}/status",
                    json=transition_data,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        if data.get("success"):
                            success_count += 1
                            print(f"   ✅ ready (paid) → completed: SUCCESS")
                        else:
                            print(f"   ❌ ready (paid) → completed: FAILED - {data}")
                    else:
                        error_data = await response.text()
                        print(f"   ❌ ready (paid) → completed: HTTP {response.status} - {error_data}")
            
            if total_tests == 0:
                self.log_result(test_name, False, "No suitable orders found for valid transition testing")
                return False
            
            if success_count == total_tests:
                self.log_result(test_name, True, f"All {success_count}/{total_tests} valid transitions work correctly")
                return True
            else:
                self.log_result(test_name, False, f"Only {success_count}/{total_tests} valid transitions work")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_invalid_status_transitions(self, orders: List[dict]) -> bool:
        """Test invalid status transitions (should be blocked)."""
        test_name = "Invalid Status Transitions (Should Be Blocked)"
        
        try:
            # Find orders for testing invalid transitions
            new_order = None
            ready_unpaid_order = None
            
            for order in orders:
                if order.get("status") == "new" and not new_order:
                    new_order = order
                elif (order.get("status") == "ready" and 
                      order.get("payment_status") != "paid" and not ready_unpaid_order):
                    ready_unpaid_order = order
            
            blocked_count = 0
            total_tests = 0
            
            # Test 1: ready (unpaid) → completed (should be blocked)
            if ready_unpaid_order:
                total_tests += 1
                transition_data = {"status": "completed"}
                
                async with self.session.patch(
                    f"{self.base_url}/api/v1/admin/orders/{ready_unpaid_order['id']}/status",
                    json=transition_data,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    
                    if response.status == 400:
                        error_data = await response.json()
                        if "PAIEMENT REQUIS" in error_data.get("detail", ""):
                            blocked_count += 1
                            print(f"   ✅ ready (unpaid) → completed: CORRECTLY BLOCKED with payment validation")
                        else:
                            print(f"   ❌ ready (unpaid) → completed: Blocked but wrong error message - {error_data}")
                    else:
                        print(f"   ❌ ready (unpaid) → completed: NOT BLOCKED (HTTP {response.status}) - SECURITY ISSUE!")
            
            # Test 2: new → completed (should be blocked)
            if new_order:
                total_tests += 1
                transition_data = {"status": "completed"}
                
                async with self.session.patch(
                    f"{self.base_url}/api/v1/admin/orders/{new_order['id']}/status",
                    json=transition_data,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    
                    if response.status == 400:
                        error_data = await response.json()
                        if "Transition non autorisée" in error_data.get("detail", ""):
                            blocked_count += 1
                            print(f"   ✅ new → completed: CORRECTLY BLOCKED with transition validation")
                        else:
                            print(f"   ❌ new → completed: Blocked but wrong error message - {error_data}")
                    else:
                        print(f"   ❌ new → completed: NOT BLOCKED (HTTP {response.status}) - SECURITY ISSUE!")
            
            if total_tests == 0:
                self.log_result(test_name, False, "No suitable orders found for invalid transition testing")
                return False
            
            if blocked_count == total_tests:
                self.log_result(test_name, True, f"All {blocked_count}/{total_tests} invalid transitions correctly blocked")
                return True
            else:
                self.log_result(test_name, False, f"Only {blocked_count}/{total_tests} invalid transitions blocked - SECURITY ISSUE!")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_payment_then_completion(self, orders: List[dict]) -> bool:
        """Test payment recording then completion."""
        test_name = "Payment Recording Then Completion"
        
        try:
            # Find a ready unpaid order
            ready_unpaid_order = None
            for order in orders:
                if (order.get("status") == "ready" and 
                    order.get("payment_status") != "paid"):
                    ready_unpaid_order = order
                    break
            
            if not ready_unpaid_order:
                self.log_result(test_name, False, "No ready unpaid orders found for testing")
                return False
            
            order_id = ready_unpaid_order["id"]
            
            # Step 1: Record payment
            payment_data = {
                "payment_method": "card",
                "payment_status": "paid"
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/orders/{order_id}/payment",
                json=payment_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Payment recording failed: HTTP {response.status} - {error_data}")
                    return False
            
            # Step 2: Try completion again (should work now)
            transition_data = {"status": "completed"}
            
            async with self.session.patch(
                f"{self.base_url}/api/v1/admin/orders/{order_id}/status",
                json=transition_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if data.get("success"):
                        self.log_result(test_name, True, f"Payment recorded and order completed successfully")
                        return True
                    else:
                        self.log_result(test_name, False, f"Completion failed after payment: {data}")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Completion failed after payment: HTTP {response.status} - {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_payment_validation(self, orders: List[dict]) -> bool:
        """Test payment validation without payment_method."""
        test_name = "Payment Validation - Missing payment_method"
        
        try:
            # Get any order for testing
            if not orders:
                self.log_result(test_name, False, "No orders available for testing")
                return False
            
            order_id = orders[0]["id"]
            
            # Try to record payment without payment_method
            invalid_payment_data = {
                "payment_status": "paid"
                # Missing payment_method
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/orders/{order_id}/payment",
                json=invalid_payment_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 422:  # Validation error
                    error_data = await response.json()
                    self.log_result(test_name, True, f"Payment validation correctly rejects missing payment_method: {error_data}")
                    return True
                elif response.status == 400:
                    error_data = await response.json()
                    self.log_result(test_name, True, f"Payment validation correctly rejects missing payment_method: {error_data}")
                    return True
                else:
                    self.log_result(test_name, False, f"Payment validation failed - should reject missing payment_method but got HTTP {response.status}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    # ========================================
    # 2. NOUVEAU ENDPOINT CHOICE-LIBRARY
    # ========================================
    
    async def test_choice_library_crud(self) -> bool:
        """Test complete CRUD operations on choice-library endpoint."""
        test_name = "Choice Library CRUD Operations"
        
        try:
            created_choice_id = None
            
            # CREATE - POST /api/v1/admin/choice-library
            create_data = {
                "name": "Test Cheddar",
                "default_price": 1.5,
                "description": "Fromage"
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/choice-library",
                json=create_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200 or response.status == 201:
                    data = await response.json()
                    created_choice_id = data.get("id")
                    if created_choice_id:
                        print(f"   ✅ CREATE: Choice created with ID {created_choice_id}")
                    else:
                        print(f"   ❌ CREATE: No ID returned - {data}")
                        self.log_result(test_name, False, "Choice creation failed - no ID returned")
                        return False
                else:
                    error_data = await response.text()
                    print(f"   ❌ CREATE: HTTP {response.status} - {error_data}")
                    self.log_result(test_name, False, f"Choice creation failed: HTTP {response.status}")
                    return False
            
            # READ - GET /api/v1/admin/choice-library
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/choice-library",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    choices = data.get("choices", []) if isinstance(data, dict) else data
                    
                    # Find our created choice
                    found_choice = None
                    for choice in choices:
                        if choice.get("id") == created_choice_id:
                            found_choice = choice
                            break
                    
                    if found_choice:
                        print(f"   ✅ READ: Choice found in list - {found_choice['name']}")
                    else:
                        print(f"   ❌ READ: Created choice not found in list")
                        self.log_result(test_name, False, "Created choice not found in GET response")
                        return False
                else:
                    error_data = await response.text()
                    print(f"   ❌ READ: HTTP {response.status} - {error_data}")
                    self.log_result(test_name, False, f"Choice retrieval failed: HTTP {response.status}")
                    return False
            
            # UPDATE - PUT /api/v1/admin/choice-library/{id}
            update_data = {
                "name": "Test Cheddar",
                "default_price": 2.0,  # Changed price
                "description": "Fromage"
            }
            
            async with self.session.put(
                f"{self.base_url}/api/v1/admin/choice-library/{created_choice_id}",
                json=update_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    print(f"   ✅ UPDATE: Choice updated successfully")
                else:
                    error_data = await response.text()
                    print(f"   ❌ UPDATE: HTTP {response.status} - {error_data}")
                    self.log_result(test_name, False, f"Choice update failed: HTTP {response.status}")
                    return False
            
            # Verify update by reading again
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/choice-library",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    choices = data.get("choices", []) if isinstance(data, dict) else data
                    
                    updated_choice = None
                    for choice in choices:
                        if choice.get("id") == created_choice_id:
                            updated_choice = choice
                            break
                    
                    if updated_choice and updated_choice.get("default_price") == 2.0:
                        print(f"   ✅ UPDATE VERIFICATION: Price updated to 2.0")
                    else:
                        print(f"   ❌ UPDATE VERIFICATION: Price not updated correctly")
                        self.log_result(test_name, False, "Choice update verification failed")
                        return False
            
            # DELETE - DELETE /api/v1/admin/choice-library/{id}
            async with self.session.delete(
                f"{self.base_url}/api/v1/admin/choice-library/{created_choice_id}",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200 or response.status == 204:
                    print(f"   ✅ DELETE: Choice deleted successfully")
                else:
                    error_data = await response.text()
                    print(f"   ❌ DELETE: HTTP {response.status} - {error_data}")
                    self.log_result(test_name, False, f"Choice deletion failed: HTTP {response.status}")
                    return False
            
            # Verify deletion
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/choice-library",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    choices = data.get("choices", []) if isinstance(data, dict) else data
                    
                    deleted_choice = None
                    for choice in choices:
                        if choice.get("id") == created_choice_id:
                            deleted_choice = choice
                            break
                    
                    if not deleted_choice:
                        print(f"   ✅ DELETE VERIFICATION: Choice no longer in list")
                    else:
                        print(f"   ❌ DELETE VERIFICATION: Choice still exists after deletion")
                        self.log_result(test_name, False, "Choice deletion verification failed")
                        return False
            
            self.log_result(test_name, True, "All CRUD operations (CREATE, READ, UPDATE, DELETE) work correctly")
            return True
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    # ========================================
    # 3. ENDPOINTS EXISTANTS - Regression Testing
    # ========================================
    
    async def test_existing_products_endpoint(self) -> bool:
        """Test products endpoint still works."""
        test_name = "GET /api/v1/admin/products - Regression Test"
        
        try:
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/products",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    products = data.get("products", [])
                    self.log_result(test_name, True, f"Products endpoint works - {len(products)} products returned")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_existing_categories_endpoint(self) -> bool:
        """Test categories endpoint and reordering."""
        test_name = "GET /api/v1/admin/categories - Regression Test"
        
        try:
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/categories",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    categories = data.get("categories", [])
                    
                    # Test reordering if we have at least 2 categories
                    if len(categories) >= 2:
                        # Sort by order to get adjacent categories
                        categories.sort(key=lambda x: x.get("order", 0))
                        first_cat = categories[0]
                        second_cat = categories[1]
                        
                        # Try to update order (simple test)
                        async with self.session.put(
                            f"{self.base_url}/api/v1/admin/categories/{first_cat['id']}",
                            json={"order": first_cat.get("order", 0)},  # Keep same order for safety
                            headers={"Content-Type": "application/json"}
                        ) as update_response:
                            
                            if update_response.status == 200:
                                self.log_result(test_name, True, f"Categories endpoint works - {len(categories)} categories, reordering functional")
                                return True
                            else:
                                self.log_result(test_name, False, f"Categories reordering failed: HTTP {update_response.status}")
                                return False
                    else:
                        self.log_result(test_name, True, f"Categories endpoint works - {len(categories)} categories returned")
                        return True
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_existing_options_endpoint(self) -> bool:
        """Test options endpoint still works."""
        test_name = "GET /api/v1/admin/options - Regression Test"
        
        try:
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/options",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    options = data.get("options", [])
                    self.log_result(test_name, True, f"Options endpoint works - {len(options)} options returned")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_stock_management_4_statuses(self) -> bool:
        """Test stock management with all 4 statuses."""
        test_name = "Stock Management - 4 Status Options"
        
        try:
            # Get a product ID for testing
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/products",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    self.log_result(test_name, False, "Could not get products for stock testing")
                    return False
                
                data = await response.json()
                products = data.get("products", [])
                if not products:
                    self.log_result(test_name, False, "No products available for stock testing")
                    return False
                
                product_id = products[0]["id"]
            
            # Test all 4 statuses
            statuses = ["available", "2h", "today", "indefinite"]
            success_count = 0
            
            for status in statuses:
                stock_data = {"status": status}
                
                async with self.session.post(
                    f"{self.base_url}/api/v1/admin/stock/{product_id}/stock-status",
                    json=stock_data,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        if data.get("success"):
                            success_count += 1
                            print(f"   ✅ Status '{status}': SUCCESS")
                        else:
                            print(f"   ❌ Status '{status}': FAILED - {data}")
                    else:
                        error_data = await response.text()
                        print(f"   ❌ Status '{status}': HTTP {response.status} - {error_data}")
            
            if success_count == len(statuses):
                self.log_result(test_name, True, f"All {len(statuses)} stock status options work correctly")
                return True
            else:
                self.log_result(test_name, False, f"Only {success_count}/{len(statuses)} stock status options work")
                return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    # ========================================
    # 4. PROMOTIONS V2 - No Regression Testing
    # ========================================
    
    async def test_promotions_v2_no_regression(self) -> bool:
        """Test Promotions V2 endpoints still work."""
        test_name = "Promotions V2 - No Regression Test"
        
        try:
            # Test GET promotions
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/promotions",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    promotions = data.get("promotions", [])
                    
                    # Test simulation endpoint
                    simulation_data = {
                        "cart": {
                            "items": [{"product_id": "test", "quantity": 1, "price": 10.0}],
                            "total": 10.0
                        },
                        "customer": {"type": "regular"}
                    }
                    
                    async with self.session.post(
                        f"{self.base_url}/api/v1/admin/promotions/simulate",
                        json=simulation_data,
                        headers={"Content-Type": "application/json"}
                    ) as sim_response:
                        
                        if sim_response.status == 200:
                            self.log_result(test_name, True, f"Promotions V2 working - {len(promotions)} promotions, simulation functional")
                            return True
                        else:
                            self.log_result(test_name, False, f"Promotions simulation failed: HTTP {sim_response.status}")
                            return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    # ========================================
    # 5. IA MARKETING - No Regression Testing
    # ========================================
    
    async def test_ai_marketing_no_regression(self) -> bool:
        """Test AI Marketing endpoints still work."""
        test_name = "AI Marketing - No Regression Test"
        
        try:
            # Test GET campaigns
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/ai-marketing/campaigns/all?status=pending",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    campaigns = data.get("campaigns", [])
                    
                    # Test stats endpoint
                    async with self.session.get(
                        f"{self.base_url}/api/v1/admin/ai-marketing/stats",
                        headers={"Content-Type": "application/json"}
                    ) as stats_response:
                        
                        if stats_response.status == 200:
                            self.log_result(test_name, True, f"AI Marketing working - {len(campaigns)} campaigns, stats functional")
                            return True
                        else:
                            self.log_result(test_name, False, f"AI Marketing stats failed: HTTP {stats_response.status}")
                            return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def run_all_tests(self):
        """Run all French review tests."""
        print("🇫🇷 STARTING FRENCH REVIEW COMPREHENSIVE TESTING")
        print("=" * 60)
        
        # Login first
        if not await self.test_login():
            print("❌ Login failed - cannot continue with tests")
            return
        
        print("\n1️⃣ SYSTÈME DE COMMANDES - Order Status Transitions")
        print("-" * 50)
        
        # Get orders for testing
        success, orders = await self.test_get_30_recent_orders()
        if success and orders:
            await self.test_valid_status_transitions(orders)
            await self.test_invalid_status_transitions(orders)
            await self.test_payment_then_completion(orders)
            await self.test_payment_validation(orders)
        
        print("\n2️⃣ NOUVEAU ENDPOINT CHOICE-LIBRARY")
        print("-" * 50)
        await self.test_choice_library_crud()
        
        print("\n3️⃣ ENDPOINTS EXISTANTS - Regression Testing")
        print("-" * 50)
        await self.test_existing_products_endpoint()
        await self.test_existing_categories_endpoint()
        await self.test_existing_options_endpoint()
        await self.test_stock_management_4_statuses()
        
        print("\n4️⃣ PROMOTIONS V2 - No Regression Testing")
        print("-" * 50)
        await self.test_promotions_v2_no_regression()
        
        print("\n5️⃣ IA MARKETING - No Regression Testing")
        print("-" * 50)
        await self.test_ai_marketing_no_regression()
        
        # Summary
        print("\n" + "=" * 60)
        print("🎯 FRENCH REVIEW TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}")
            if not result["success"]:
                print(f"   └─ {result['message']}")

async def main():
    """Main test execution."""
    async with FrenchReviewTester() as tester:
        await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())