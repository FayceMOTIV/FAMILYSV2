#!/usr/bin/env python3
"""
Corrected French Review Test - Fixing endpoint paths and issues
"""

import asyncio
import aiohttp
import json
import sys
from typing import Dict, Optional, List
from datetime import datetime, timezone

# Backend URL from environment
BACKEND_URL = "https://resto-admin-11.preview.emergentagent.com"

class CorrectedFrenchTester:
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

    async def test_order_status_transitions_comprehensive(self) -> bool:
        """Test comprehensive order status transitions as per French review."""
        test_name = "Order Status Transitions - Comprehensive French Review"
        
        try:
            # Get orders
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/orders",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    self.log_result(test_name, False, "Could not get orders")
                    return False
                
                data = await response.json()
                orders = data.get("orders", [])
                
                if len(orders) < 30:
                    print(f"   ⚠️  Only {len(orders)} orders found (expected ~30)")
                else:
                    print(f"   ✅ {len(orders)} orders found (≥30 as expected)")
            
            # Find suitable orders for testing
            new_orders = [o for o in orders if o.get("status") == "new"]
            in_prep_orders = [o for o in orders if o.get("status") == "in_preparation"]
            ready_paid_orders = [o for o in orders if o.get("status") == "ready" and o.get("payment_status") == "paid"]
            ready_unpaid_orders = [o for o in orders if o.get("status") == "ready" and o.get("payment_status") != "paid"]
            
            success_tests = 0
            total_tests = 0
            
            # Test 1: Valid transition new → in_preparation
            if new_orders:
                total_tests += 1
                order_id = new_orders[0]["id"]
                
                async with self.session.patch(
                    f"{self.base_url}/api/v1/admin/orders/{order_id}/status",
                    json={"status": "in_preparation"},
                    headers={"Content-Type": "application/json"}
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        if data.get("success"):
                            success_tests += 1
                            print(f"   ✅ new → in_preparation: SUCCESS")
                        else:
                            print(f"   ❌ new → in_preparation: FAILED - {data}")
                    else:
                        error_data = await response.text()
                        print(f"   ❌ new → in_preparation: HTTP {response.status} - {error_data}")
            
            # Test 2: Valid transition in_preparation → ready
            if in_prep_orders:
                total_tests += 1
                order_id = in_prep_orders[0]["id"]
                
                async with self.session.patch(
                    f"{self.base_url}/api/v1/admin/orders/{order_id}/status",
                    json={"status": "ready"},
                    headers={"Content-Type": "application/json"}
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        if data.get("success"):
                            success_tests += 1
                            print(f"   ✅ in_preparation → ready: SUCCESS")
                        else:
                            print(f"   ❌ in_preparation → ready: FAILED - {data}")
                    else:
                        error_data = await response.text()
                        print(f"   ❌ in_preparation → ready: HTTP {response.status} - {error_data}")
            
            # Test 3: Invalid transition ready (unpaid) → completed (should be blocked)
            if ready_unpaid_orders:
                total_tests += 1
                order_id = ready_unpaid_orders[0]["id"]
                
                async with self.session.patch(
                    f"{self.base_url}/api/v1/admin/orders/{order_id}/status",
                    json={"status": "completed"},
                    headers={"Content-Type": "application/json"}
                ) as response:
                    
                    if response.status == 400:
                        error_data = await response.json()
                        if "PAIEMENT REQUIS" in error_data.get("detail", ""):
                            success_tests += 1
                            print(f"   ✅ ready (unpaid) → completed: CORRECTLY BLOCKED")
                        else:
                            print(f"   ❌ ready (unpaid) → completed: Wrong error message - {error_data}")
                    else:
                        print(f"   ❌ ready (unpaid) → completed: NOT BLOCKED - SECURITY ISSUE!")
            
            # Test 4: Payment recording then completion
            if ready_unpaid_orders and len(ready_unpaid_orders) > 1:
                total_tests += 1
                order_id = ready_unpaid_orders[1]["id"]  # Use different order
                
                # Record payment
                async with self.session.post(
                    f"{self.base_url}/api/v1/admin/orders/{order_id}/payment",
                    json={"payment_method": "card", "payment_status": "paid"},
                    headers={"Content-Type": "application/json"}
                ) as payment_response:
                    
                    if payment_response.status == 200:
                        # Try completion now
                        async with self.session.patch(
                            f"{self.base_url}/api/v1/admin/orders/{order_id}/status",
                            json={"status": "completed"},
                            headers={"Content-Type": "application/json"}
                        ) as completion_response:
                            
                            if completion_response.status == 200:
                                data = await completion_response.json()
                                if data.get("success"):
                                    success_tests += 1
                                    print(f"   ✅ Payment → Completion: SUCCESS")
                                else:
                                    print(f"   ❌ Payment → Completion: FAILED - {data}")
                            else:
                                print(f"   ❌ Payment → Completion: HTTP {completion_response.status}")
                    else:
                        print(f"   ❌ Payment recording failed for completion test")
            
            # Test 5: Invalid transition new → completed (should be blocked)
            if new_orders and len(new_orders) > 1:
                total_tests += 1
                order_id = new_orders[1]["id"]  # Use different order
                
                async with self.session.patch(
                    f"{self.base_url}/api/v1/admin/orders/{order_id}/status",
                    json={"status": "completed"},
                    headers={"Content-Type": "application/json"}
                ) as response:
                    
                    if response.status == 400:
                        error_data = await response.json()
                        if "Transition non autorisée" in error_data.get("detail", ""):
                            success_tests += 1
                            print(f"   ✅ new → completed: CORRECTLY BLOCKED")
                        else:
                            print(f"   ❌ new → completed: Wrong error message - {error_data}")
                    else:
                        print(f"   ❌ new → completed: NOT BLOCKED - SECURITY ISSUE!")
            
            # Test 6: Payment validation without payment_method
            if orders:
                total_tests += 1
                order_id = orders[0]["id"]
                
                async with self.session.post(
                    f"{self.base_url}/api/v1/admin/orders/{order_id}/payment",
                    json={"payment_status": "paid"},  # Missing payment_method
                    headers={"Content-Type": "application/json"}
                ) as response:
                    
                    if response.status in [400, 422]:  # Validation error
                        success_tests += 1
                        print(f"   ✅ Payment validation: CORRECTLY REJECTS missing payment_method")
                    else:
                        print(f"   ❌ Payment validation: Should reject missing payment_method")
            
            if total_tests == 0:
                self.log_result(test_name, False, "No suitable orders found for comprehensive testing")
                return False
            
            success_rate = (success_tests / total_tests) * 100
            if success_tests == total_tests:
                self.log_result(test_name, True, f"All {success_tests}/{total_tests} order status tests passed (100%)")
                return True
            else:
                self.log_result(test_name, False, f"Only {success_tests}/{total_tests} order status tests passed ({success_rate:.1f}%)")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_choice_library_endpoint_investigation(self) -> bool:
        """Investigate choice-library endpoint issues."""
        test_name = "Choice Library Endpoint Investigation"
        
        try:
            # First try to GET to see if endpoint exists
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/choice-library",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    choices = data.get("choices", [])
                    print(f"   ✅ GET choice-library works: {len(choices)} choices found")
                    
                    # Try simple CREATE with minimal data
                    create_data = {
                        "name": "Test Choice",
                        "default_price": 1.0
                    }
                    
                    async with self.session.post(
                        f"{self.base_url}/api/v1/admin/choice-library",
                        json=create_data,
                        headers={"Content-Type": "application/json"}
                    ) as create_response:
                        
                        if create_response.status in [200, 201]:
                            create_data = await create_response.json()
                            choice_id = create_data.get("choice", {}).get("id")
                            if choice_id:
                                print(f"   ✅ CREATE choice works: ID {choice_id}")
                                
                                # Try DELETE to clean up
                                async with self.session.delete(
                                    f"{self.base_url}/api/v1/admin/choice-library/{choice_id}",
                                    headers={"Content-Type": "application/json"}
                                ) as delete_response:
                                    
                                    if delete_response.status in [200, 204]:
                                        print(f"   ✅ DELETE choice works")
                                        self.log_result(test_name, True, "Choice-library CRUD operations work correctly")
                                        return True
                                    else:
                                        print(f"   ❌ DELETE failed: HTTP {delete_response.status}")
                            else:
                                print(f"   ❌ CREATE response missing ID")
                        else:
                            error_data = await create_response.text()
                            print(f"   ❌ CREATE failed: HTTP {create_response.status} - {error_data}")
                            self.log_result(test_name, False, f"Choice creation failed: HTTP {create_response.status}")
                            return False
                else:
                    error_data = await response.text()
                    print(f"   ❌ GET failed: HTTP {response.status} - {error_data}")
                    self.log_result(test_name, False, f"Choice-library GET failed: HTTP {response.status}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_stock_management_corrected_path(self) -> bool:
        """Test stock management with correct endpoint path."""
        test_name = "Stock Management - Corrected Path"
        
        try:
            # Get a product for testing
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/products",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    self.log_result(test_name, False, "Could not get products")
                    return False
                
                data = await response.json()
                products = data.get("products", [])
                if not products:
                    self.log_result(test_name, False, "No products available")
                    return False
                
                product_id = products[0]["id"]
            
            # Test all 4 statuses with correct path
            statuses = ["available", "2h", "today", "indefinite"]
            success_count = 0
            
            for status in statuses:
                stock_data = {"status": status}
                
                # Correct path: /api/v1/admin/products/{product_id}/stock-status
                async with self.session.post(
                    f"{self.base_url}/api/v1/admin/products/{product_id}/stock-status",
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

    async def test_ai_marketing_with_auth(self) -> bool:
        """Test AI Marketing with proper authentication."""
        test_name = "AI Marketing - With Authentication"
        
        if not self.auth_token:
            self.log_result(test_name, False, "No auth token available")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Test campaigns endpoint
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/ai-marketing/campaigns/all?status=pending",
                headers=headers
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    campaigns = data.get("campaigns", [])
                    print(f"   ✅ GET campaigns works: {len(campaigns)} campaigns")
                    
                    # Test stats endpoint
                    async with self.session.get(
                        f"{self.base_url}/api/v1/admin/ai-marketing/stats",
                        headers=headers
                    ) as stats_response:
                        
                        if stats_response.status == 200:
                            stats_data = await stats_response.json()
                            print(f"   ✅ GET stats works")
                            self.log_result(test_name, True, f"AI Marketing endpoints work with authentication")
                            return True
                        else:
                            error_data = await stats_response.text()
                            print(f"   ❌ Stats failed: HTTP {stats_response.status} - {error_data}")
                            self.log_result(test_name, False, f"AI Marketing stats failed: HTTP {stats_response.status}")
                            return False
                else:
                    error_data = await response.text()
                    print(f"   ❌ Campaigns failed: HTTP {response.status} - {error_data}")
                    self.log_result(test_name, False, f"AI Marketing campaigns failed: HTTP {response.status}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_existing_endpoints_regression(self) -> bool:
        """Test existing endpoints for regression."""
        test_name = "Existing Endpoints - Regression Test"
        
        try:
            success_count = 0
            total_count = 0
            
            # Test Products
            total_count += 1
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/products",
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    products = data.get("products", [])
                    success_count += 1
                    print(f"   ✅ Products: {len(products)} items")
                else:
                    print(f"   ❌ Products: HTTP {response.status}")
            
            # Test Categories
            total_count += 1
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/categories",
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    categories = data.get("categories", [])
                    success_count += 1
                    print(f"   ✅ Categories: {len(categories)} items")
                else:
                    print(f"   ❌ Categories: HTTP {response.status}")
            
            # Test Options
            total_count += 1
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/options",
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    options = data.get("options", [])
                    success_count += 1
                    print(f"   ✅ Options: {len(options)} items")
                else:
                    print(f"   ❌ Options: HTTP {response.status}")
            
            # Test Promotions V2
            total_count += 1
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/promotions",
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    promotions = data.get("promotions", [])
                    success_count += 1
                    print(f"   ✅ Promotions V2: {len(promotions)} items")
                else:
                    print(f"   ❌ Promotions V2: HTTP {response.status}")
            
            if success_count == total_count:
                self.log_result(test_name, True, f"All {total_count} existing endpoints work correctly")
                return True
            else:
                self.log_result(test_name, False, f"Only {success_count}/{total_count} existing endpoints work")
                return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def run_corrected_tests(self):
        """Run corrected French review tests."""
        print("🇫🇷 CORRECTED FRENCH REVIEW TESTING")
        print("=" * 50)
        
        # Login first
        if not await self.test_login():
            print("❌ Login failed - cannot continue")
            return
        
        print("\n🔄 SYSTÈME DE COMMANDES - Comprehensive Testing")
        print("-" * 50)
        await self.test_order_status_transitions_comprehensive()
        
        print("\n🆕 CHOICE-LIBRARY ENDPOINT - Investigation")
        print("-" * 50)
        await self.test_choice_library_endpoint_investigation()
        
        print("\n📦 STOCK MANAGEMENT - Corrected Path")
        print("-" * 50)
        await self.test_stock_management_corrected_path()
        
        print("\n🤖 AI MARKETING - With Authentication")
        print("-" * 50)
        await self.test_ai_marketing_with_auth()
        
        print("\n🔍 EXISTING ENDPOINTS - Regression Test")
        print("-" * 50)
        await self.test_existing_endpoints_regression()
        
        # Summary
        print("\n" + "=" * 50)
        print("🎯 CORRECTED TEST SUMMARY")
        print("=" * 50)
        
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
    async with CorrectedFrenchTester() as tester:
        await tester.run_corrected_tests()

if __name__ == "__main__":
    asyncio.run(main())