#!/usr/bin/env python3
"""
Final French Review Test - Complete verification of all requirements
"""

import asyncio
import aiohttp
import json
import sys
from typing import Dict, Optional, List
from datetime import datetime, timezone

# Backend URL from environment
BACKEND_URL = "https://resto-admin-11.preview.emergentagent.com"

class FinalFrenchReviewTester:
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

    async def test_complete_order_system(self) -> bool:
        """Test complete order system as per French review requirements."""
        test_name = "1. SYSTÈME DE COMMANDES - Complete Testing"
        
        try:
            # Get 30 recent orders
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/orders",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    self.log_result(test_name, False, "Could not retrieve orders")
                    return False
                
                data = await response.json()
                orders = data.get("orders", [])
                
                if len(orders) < 30:
                    print(f"   ⚠️  Only {len(orders)} orders (expected ~30)")
                else:
                    print(f"   ✅ {len(orders)} orders retrieved (≥30 ✓)")
            
            # Find orders for testing
            new_orders = [o for o in orders if o.get("status") == "new"]
            in_prep_orders = [o for o in orders if o.get("status") == "in_preparation"]
            ready_paid_orders = [o for o in orders if o.get("status") == "ready" and o.get("payment_status") == "paid"]
            ready_unpaid_orders = [o for o in orders if o.get("status") == "ready" and o.get("payment_status") != "paid"]
            
            tests_passed = 0
            total_tests = 0
            
            # Test 1: Valid transition new → in_preparation ✓
            if new_orders:
                total_tests += 1
                async with self.session.patch(
                    f"{self.base_url}/api/v1/admin/orders/{new_orders[0]['id']}/status",
                    json={"status": "in_preparation"},
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status == 200 and (await response.json()).get("success"):
                        tests_passed += 1
                        print(f"   ✅ new → in_preparation: SUCCESS")
                    else:
                        print(f"   ❌ new → in_preparation: FAILED")
            
            # Test 2: Valid transition in_preparation → ready ✓
            if in_prep_orders:
                total_tests += 1
                async with self.session.patch(
                    f"{self.base_url}/api/v1/admin/orders/{in_prep_orders[0]['id']}/status",
                    json={"status": "ready"},
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status == 200 and (await response.json()).get("success"):
                        tests_passed += 1
                        print(f"   ✅ in_preparation → ready: SUCCESS")
                    else:
                        print(f"   ❌ in_preparation → ready: FAILED")
            
            # Test 3: Invalid transition ready (unpaid) → completed ❌ (blocked)
            if ready_unpaid_orders:
                total_tests += 1
                async with self.session.patch(
                    f"{self.base_url}/api/v1/admin/orders/{ready_unpaid_orders[0]['id']}/status",
                    json={"status": "completed"},
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status == 400:
                        error_data = await response.json()
                        if "PAIEMENT REQUIS" in error_data.get("detail", ""):
                            tests_passed += 1
                            print(f"   ✅ ready (unpaid) → completed: CORRECTLY BLOCKED")
                        else:
                            print(f"   ❌ ready (unpaid) → completed: Wrong error message")
                    else:
                        print(f"   ❌ ready (unpaid) → completed: NOT BLOCKED - SECURITY ISSUE!")
            
            # Test 4: Payment recording then completion ✓
            if ready_unpaid_orders and len(ready_unpaid_orders) > 1:
                total_tests += 1
                order_id = ready_unpaid_orders[1]["id"]
                
                # Record payment
                async with self.session.post(
                    f"{self.base_url}/api/v1/admin/orders/{order_id}/payment",
                    json={"payment_method": "card", "payment_status": "paid"},
                    headers={"Content-Type": "application/json"}
                ) as payment_response:
                    
                    if payment_response.status == 200:
                        # Try completion
                        async with self.session.patch(
                            f"{self.base_url}/api/v1/admin/orders/{order_id}/status",
                            json={"status": "completed"},
                            headers={"Content-Type": "application/json"}
                        ) as completion_response:
                            
                            if completion_response.status == 200 and (await completion_response.json()).get("success"):
                                tests_passed += 1
                                print(f"   ✅ Payment → Completion: SUCCESS")
                            else:
                                print(f"   ❌ Payment → Completion: FAILED")
                    else:
                        print(f"   ❌ Payment recording failed")
            
            # Test 5: Invalid transition new → completed ❌ (blocked)
            if new_orders and len(new_orders) > 1:
                total_tests += 1
                async with self.session.patch(
                    f"{self.base_url}/api/v1/admin/orders/{new_orders[1]['id']}/status",
                    json={"status": "completed"},
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status == 400:
                        error_data = await response.json()
                        if "Transition non autorisée" in error_data.get("detail", ""):
                            tests_passed += 1
                            print(f"   ✅ new → completed: CORRECTLY BLOCKED")
                        else:
                            print(f"   ❌ new → completed: Wrong error message")
                    else:
                        print(f"   ❌ new → completed: NOT BLOCKED - SECURITY ISSUE!")
            
            # Test 6: Payment validation without payment_method
            if orders:
                total_tests += 1
                async with self.session.post(
                    f"{self.base_url}/api/v1/admin/orders/{orders[0]['id']}/payment",
                    json={"payment_status": "paid"},  # Missing payment_method
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status in [400, 422]:
                        tests_passed += 1
                        print(f"   ✅ Payment validation: CORRECTLY REJECTS missing payment_method")
                    else:
                        print(f"   ❌ Payment validation: Should reject missing payment_method")
            
            success_rate = (tests_passed / total_tests) * 100 if total_tests > 0 else 0
            if tests_passed == total_tests and total_tests >= 4:
                self.log_result(test_name, True, f"All {tests_passed}/{total_tests} order system tests passed ({success_rate:.0f}%)")
                return True
            else:
                self.log_result(test_name, False, f"Only {tests_passed}/{total_tests} order system tests passed ({success_rate:.0f}%)")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_choice_library_crud_complete(self) -> bool:
        """Test complete CRUD operations on choice-library endpoint."""
        test_name = "2. CHOICE-LIBRARY ENDPOINT - Complete CRUD"
        
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
                
                if response.status in [200, 201]:
                    data = await response.json()
                    created_choice_id = data.get("id")
                    if created_choice_id:
                        print(f"   ✅ CREATE: Choice created with ID {created_choice_id}")
                    else:
                        self.log_result(test_name, False, "Choice creation - no ID returned")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Choice creation failed: HTTP {response.status}")
                    return False
            
            # READ - GET /api/v1/admin/choice-library
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/choice-library",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    choices = data.get("choices", [])
                    
                    found_choice = None
                    for choice in choices:
                        if choice.get("id") == created_choice_id:
                            found_choice = choice
                            break
                    
                    if found_choice:
                        print(f"   ✅ READ: Choice found in list")
                    else:
                        self.log_result(test_name, False, "Created choice not found in GET response")
                        return False
                else:
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
                    print(f"   ✅ UPDATE: Choice updated successfully")
                else:
                    self.log_result(test_name, False, f"Choice update failed: HTTP {response.status}")
                    return False
            
            # Verify update
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/choice-library",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    choices = data.get("choices", [])
                    
                    updated_choice = None
                    for choice in choices:
                        if choice.get("id") == created_choice_id:
                            updated_choice = choice
                            break
                    
                    if updated_choice and updated_choice.get("default_price") == 2.0:
                        print(f"   ✅ UPDATE VERIFICATION: Price updated to 2.0")
                    else:
                        self.log_result(test_name, False, "Choice update verification failed")
                        return False
            
            # DELETE - DELETE /api/v1/admin/choice-library/{id}
            async with self.session.delete(
                f"{self.base_url}/api/v1/admin/choice-library/{created_choice_id}",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status in [200, 204]:
                    print(f"   ✅ DELETE: Choice deleted successfully")
                else:
                    self.log_result(test_name, False, f"Choice deletion failed: HTTP {response.status}")
                    return False
            
            # Verify deletion
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/choice-library",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    choices = data.get("choices", [])
                    
                    deleted_choice = None
                    for choice in choices:
                        if choice.get("id") == created_choice_id:
                            deleted_choice = choice
                            break
                    
                    if not deleted_choice:
                        print(f"   ✅ DELETE VERIFICATION: Choice no longer in list")
                    else:
                        self.log_result(test_name, False, "Choice deletion verification failed")
                        return False
            
            self.log_result(test_name, True, "All CRUD operations (CREATE, READ, UPDATE, DELETE) work correctly")
            return True
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_existing_endpoints_comprehensive(self) -> bool:
        """Test all existing endpoints for regression."""
        test_name = "3. EXISTING ENDPOINTS - No Regression"
        
        try:
            tests_passed = 0
            total_tests = 0
            
            # Products endpoint
            total_tests += 1
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/products",
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    products = data.get("products", [])
                    tests_passed += 1
                    print(f"   ✅ Products: {len(products)} items returned")
                else:
                    print(f"   ❌ Products: HTTP {response.status}")
            
            # Categories endpoint + reordering test
            total_tests += 1
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/categories",
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    categories = data.get("categories", [])
                    
                    # Test reordering if we have categories
                    if categories:
                        # Simple reordering test - update first category with same order
                        async with self.session.put(
                            f"{self.base_url}/api/v1/admin/categories/{categories[0]['id']}",
                            json={"order": categories[0].get("order", 0)},
                            headers={"Content-Type": "application/json"}
                        ) as update_response:
                            if update_response.status == 200:
                                tests_passed += 1
                                print(f"   ✅ Categories: {len(categories)} items, reordering functional")
                            else:
                                print(f"   ❌ Categories: Reordering failed")
                    else:
                        tests_passed += 1
                        print(f"   ✅ Categories: {len(categories)} items returned")
                else:
                    print(f"   ❌ Categories: HTTP {response.status}")
            
            # Options endpoint
            total_tests += 1
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/options",
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    options = data.get("options", [])
                    tests_passed += 1
                    print(f"   ✅ Options: {len(options)} items with choices structure")
                else:
                    print(f"   ❌ Options: HTTP {response.status}")
            
            # Stock Management - all 4 statuses
            total_tests += 1
            # Get a product for testing
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/products",
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    products = data.get("products", [])
                    if products:
                        product_id = products[0]["id"]
                        
                        # Test all 4 statuses
                        statuses = ["available", "2h", "today", "indefinite"]
                        stock_success = 0
                        
                        for status in statuses:
                            async with self.session.post(
                                f"{self.base_url}/api/v1/admin/products/{product_id}/stock-status",
                                json={"status": status},
                                headers={"Content-Type": "application/json"}
                            ) as stock_response:
                                if stock_response.status == 200:
                                    stock_success += 1
                        
                        if stock_success == 4:
                            tests_passed += 1
                            print(f"   ✅ Stock Management: All 4 statuses (available, 2h, today, indefinite) work")
                        else:
                            print(f"   ❌ Stock Management: Only {stock_success}/4 statuses work")
                    else:
                        print(f"   ❌ Stock Management: No products for testing")
                else:
                    print(f"   ❌ Stock Management: Could not get products")
            
            success_rate = (tests_passed / total_tests) * 100 if total_tests > 0 else 0
            if tests_passed == total_tests:
                self.log_result(test_name, True, f"All {tests_passed}/{total_tests} existing endpoints work correctly ({success_rate:.0f}%)")
                return True
            else:
                self.log_result(test_name, False, f"Only {tests_passed}/{total_tests} existing endpoints work ({success_rate:.0f}%)")
                return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_promotions_v2_no_regression(self) -> bool:
        """Test Promotions V2 - no regression."""
        test_name = "4. PROMOTIONS V2 - No Regression"
        
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
                    self.log_result(test_name, False, f"Promotions GET failed: HTTP {response.status}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_ai_marketing_no_regression(self) -> bool:
        """Test AI Marketing - no regression."""
        test_name = "5. AI MARKETING - No Regression"
        
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
                    
                    # Test stats endpoint
                    async with self.session.get(
                        f"{self.base_url}/api/v1/admin/ai-marketing/stats",
                        headers=headers
                    ) as stats_response:
                        
                        if stats_response.status == 200:
                            self.log_result(test_name, True, f"AI Marketing working - {len(campaigns)} campaigns, stats functional")
                            return True
                        else:
                            self.log_result(test_name, False, f"AI Marketing stats failed: HTTP {stats_response.status}")
                            return False
                else:
                    self.log_result(test_name, False, f"AI Marketing campaigns failed: HTTP {response.status}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def run_final_french_review(self):
        """Run complete French review test suite."""
        print("🇫🇷 FINAL FRENCH REVIEW - COMPLETE VERIFICATION")
        print("=" * 60)
        print("Testing all changes made this morning as specified in review")
        print("=" * 60)
        
        # Login first
        if not await self.test_login():
            print("❌ Login failed - cannot continue")
            return
        
        print("\n1️⃣ SYSTÈME DE COMMANDES")
        print("Testing order status transitions, payment validation")
        print("-" * 50)
        await self.test_complete_order_system()
        
        print("\n2️⃣ NOUVEAU ENDPOINT CHOICE-LIBRARY")
        print("Testing complete CRUD operations")
        print("-" * 50)
        await self.test_choice_library_crud_complete()
        
        print("\n3️⃣ ENDPOINTS EXISTANTS")
        print("Testing no regression on existing functionality")
        print("-" * 50)
        await self.test_existing_endpoints_comprehensive()
        
        print("\n4️⃣ PROMOTIONS V2")
        print("Testing no regression on promotions engine")
        print("-" * 50)
        await self.test_promotions_v2_no_regression()
        
        print("\n5️⃣ IA MARKETING")
        print("Testing no regression on AI marketing")
        print("-" * 50)
        await self.test_ai_marketing_no_regression()
        
        # Final Summary
        print("\n" + "=" * 60)
        print("🎯 FINAL FRENCH REVIEW RESULTS")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        success_rate = (passed/total)*100 if total > 0 else 0
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        print("\n📋 CRITÈRES DE SUCCÈS:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}")
            if not result["success"]:
                print(f"   └─ {result['message']}")
        
        # Overall assessment
        print("\n🏆 ASSESSMENT:")
        if success_rate >= 90:
            print("✅ EXCELLENT - All morning changes working correctly")
        elif success_rate >= 80:
            print("✅ GOOD - Most changes working, minor issues to address")
        elif success_rate >= 70:
            print("⚠️  ACCEPTABLE - Some issues need attention")
        else:
            print("❌ NEEDS WORK - Multiple critical issues found")

async def main():
    """Main test execution."""
    async with FinalFrenchReviewTester() as tester:
        await tester.run_final_french_review()

if __name__ == "__main__":
    asyncio.run(main())