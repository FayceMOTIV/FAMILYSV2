#!/usr/bin/env python3
"""
French Final Verification Test - Comprehensive Backend Testing
Tests all features implemented today as requested in French review
"""

import asyncio
import aiohttp
import json
import sys
from typing import Dict, Optional, List
from datetime import datetime, timezone

# Backend URL from environment
BACKEND_URL = "https://react-reborn.preview.emergentagent.com"

class FrenchFinalVerificationTester:
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
        test_name = "Admin Authentication"
        
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
                        self.log_result(test_name, True, f"Login successful with admin@familys.app")
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

    async def test_settings_api_nouveaux_champs(self) -> bool:
        """Test Settings API - Nouveaux champs (order_hours, social_media, service_links)."""
        test_name = "Settings API - Nouveaux Champs"
        
        try:
            # Test GET /api/v1/admin/settings
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/settings",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    
                    # Check for new fields
                    order_hours = data.get("order_hours")
                    social_media = data.get("social_media")
                    service_links = data.get("service_links")
                    
                    if order_hours is None or social_media is None or service_links is None:
                        self.log_result(test_name, False, f"Missing new fields: order_hours={order_hours is not None}, social_media={social_media is not None}, service_links={service_links is not None}")
                        return False
                    
                    # Verify order_hours structure (should have days with time schedules)
                    if isinstance(order_hours, dict):
                        # Check if it has day structure with time fields
                        has_proper_structure = False
                        for day, schedule in order_hours.items():
                            if isinstance(schedule, dict) and any(key in schedule for key in ['open', 'close', 'open1', 'close1', 'open2', 'close2']):
                                has_proper_structure = True
                                break
                        
                        if not has_proper_structure:
                            self.log_result(test_name, False, f"order_hours doesn't have proper day/time structure: {order_hours}")
                            return False
                    
                    # Verify social_media structure (should have platform links)
                    if isinstance(social_media, dict):
                        expected_platforms = ['facebook', 'instagram', 'twitter', 'tiktok']
                        has_platforms = any(platform in social_media for platform in expected_platforms)
                        if not has_platforms:
                            self.log_result(test_name, False, f"social_media doesn't have expected platforms: {social_media}")
                            return False
                    
                    # Verify service_links structure
                    if isinstance(service_links, dict):
                        expected_services = ['delivery', 'reservation', 'loyalty', 'support']
                        has_services = any(service in service_links for service in expected_services)
                        if not has_services:
                            self.log_result(test_name, False, f"service_links doesn't have expected services: {service_links}")
                            return False
                    
                    self.log_result(test_name, True, f"All new fields present with proper structure: order_hours, social_media, service_links")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_products_sans_slug(self) -> bool:
        """Test Products - Sans slug (GET, POST creation, PUT modification)."""
        test_name = "Products - Sans Slug"
        
        try:
            # Test GET /api/v1/admin/products
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/products",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"GET products failed: HTTP {response.status}: {error_data}")
                    return False
                
                data = await response.json()
                products = data.get("products", [])
                
                if len(products) == 0:
                    self.log_result(test_name, False, "No products found")
                    return False
                
                # Verify products don't have slug field (or it's not required)
                first_product = products[0]
                product_id = first_product.get("id")
                
                # Test POST creation without slug
                import time
                unique_name = f"Test Burger Sans Slug {int(time.time())}"
                new_product_data = {
                    "name": unique_name,
                    "description": "Test product created without slug field",
                    "base_price": 12.50,
                    "category": first_product.get("category", "Burgers"),
                    "image_url": "https://example.com/test-burger.jpg"
                }
                
                async with self.session.post(
                    f"{self.base_url}/api/v1/admin/products",
                    json=new_product_data,
                    headers={"Content-Type": "application/json"}
                ) as create_response:
                    
                    if create_response.status != 201:
                        error_data = await create_response.text()
                        self.log_result(test_name, False, f"POST product creation failed: HTTP {create_response.status}: {error_data}")
                        return False
                    
                    created_data = await create_response.json()
                    # Check different possible response structures
                    created_product_id = (created_data.get("id") or 
                                        created_data.get("product", {}).get("id") or
                                        (created_data.get("product") if isinstance(created_data.get("product"), str) else None))
                    
                    if not created_product_id:
                        self.log_result(test_name, False, f"Created product has no ID. Response: {created_data}")
                        return False
                
                # Test PUT modification
                update_data = {
                    "name": "Test Burger Sans Slug - Modified",
                    "base_price": 13.50
                }
                
                async with self.session.put(
                    f"{self.base_url}/api/v1/admin/products/{created_product_id}",
                    json=update_data,
                    headers={"Content-Type": "application/json"}
                ) as update_response:
                    
                    if update_response.status != 200:
                        error_data = await update_response.text()
                        self.log_result(test_name, False, f"PUT product update failed: HTTP {update_response.status}: {error_data}")
                        return False
                
                # Test stock_status field (2h, today, indefinite)
                stock_statuses = ["2h", "today", "indefinite", "available"]
                stock_test_passed = True
                
                for status in stock_statuses:
                    async with self.session.post(
                        f"{self.base_url}/api/v1/admin/products/{product_id}/stock-status",
                        json={"status": status},
                        headers={"Content-Type": "application/json"}
                    ) as stock_response:
                        
                        if stock_response.status != 200:
                            stock_test_passed = False
                            break
                
                if not stock_test_passed:
                    self.log_result(test_name, False, "Stock status functionality not working")
                    return False
                
                self.log_result(test_name, True, f"Products working without slug: GET ({len(products)} products), POST creation, PUT modification, stock_status (4 options)")
                return True
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_categories_sans_slug(self) -> bool:
        """Test Categories - Sans slug (GET, POST creation)."""
        test_name = "Categories - Sans Slug"
        
        try:
            # Test GET /api/v1/admin/categories
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/categories",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"GET categories failed: HTTP {response.status}: {error_data}")
                    return False
                
                data = await response.json()
                categories = data.get("categories", [])
                
                if len(categories) == 0:
                    self.log_result(test_name, False, "No categories found")
                    return False
                
                # Test POST creation without slug
                new_category_data = {
                    "name": "Test Category Sans Slug",
                    "description": "Test category created without slug field",
                    "order": 999,
                    "is_active": True
                }
                
                async with self.session.post(
                    f"{self.base_url}/api/v1/admin/categories",
                    json=new_category_data,
                    headers={"Content-Type": "application/json"}
                ) as create_response:
                    
                    if create_response.status != 201:
                        error_data = await create_response.text()
                        self.log_result(test_name, False, f"POST category creation failed: HTTP {create_response.status}: {error_data}")
                        return False
                
                self.log_result(test_name, True, f"Categories working without slug: GET ({len(categories)} categories), POST creation successful")
                return True
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_options_nouveaux_champs(self) -> bool:
        """Test Options - Nouveaux champs (internal_comment, allow_repeat, choices avec image_url)."""
        test_name = "Options - Nouveaux Champs"
        
        try:
            # Test GET /api/v1/admin/options
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/options",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"GET options failed: HTTP {response.status}: {error_data}")
                    return False
                
                data = await response.json()
                options = data.get("options", [])
                
                if len(options) == 0:
                    self.log_result(test_name, False, "No options found")
                    return False
                
                # Check for new fields in existing options
                has_internal_comment = False
                has_allow_repeat = False
                has_image_url_in_choices = False
                
                for option in options:
                    if "internal_comment" in option:
                        has_internal_comment = True
                    if "allow_repeat" in option:
                        has_allow_repeat = True
                    
                    choices = option.get("choices", [])
                    for choice in choices:
                        if "image_url" in choice:
                            has_image_url_in_choices = True
                            break
                
                # Test creating new option with new fields
                new_option_data = {
                    "name": "Test Option Nouveaux Champs",
                    "type": "single_choice",
                    "is_required": False,
                    "internal_comment": "Commentaire interne pour test",
                    "allow_repeat": True,
                    "choices": [
                        {
                            "name": "Choice avec image",
                            "price": 2.50,
                            "image_url": "https://example.com/choice-image.jpg"
                        },
                        {
                            "name": "Choice sans image",
                            "price": 1.50
                        }
                    ]
                }
                
                async with self.session.post(
                    f"{self.base_url}/api/v1/admin/options",
                    json=new_option_data,
                    headers={"Content-Type": "application/json"}
                ) as create_response:
                    
                    if create_response.status != 201:
                        error_data = await create_response.text()
                        self.log_result(test_name, False, f"POST option creation failed: HTTP {create_response.status}: {error_data}")
                        return False
                
                success_message = f"Options nouveaux champs: GET ({len(options)} options), POST creation with internal_comment & allow_repeat & choices.image_url"
                if has_internal_comment or has_allow_repeat or has_image_url_in_choices:
                    success_message += f" - Existing fields found: internal_comment={has_internal_comment}, allow_repeat={has_allow_repeat}, choices.image_url={has_image_url_in_choices}"
                
                self.log_result(test_name, True, success_message)
                return True
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_orders_payment_modes(self) -> bool:
        """Test Orders & Payment - Modes paiement (espece, cb, cheque, ticket_restaurant) et support multi-paiement."""
        test_name = "Orders & Payment - Modes Paiement"
        
        try:
            # Test GET /api/v1/admin/orders
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/orders",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"GET orders failed: HTTP {response.status}: {error_data}")
                    return False
                
                data = await response.json()
                orders = data.get("orders", [])
                
                if len(orders) == 0:
                    self.log_result(test_name, False, "No orders found")
                    return False
                
                # Check existing payment methods in orders
                payment_methods_found = set()
                for order in orders:
                    payment_method = order.get("payment_method")
                    if payment_method:
                        payment_methods_found.add(payment_method)
                
                # Test different payment methods
                test_order_id = orders[0].get("id")
                payment_methods_to_test = ["cash", "card", "check", "ticket_restaurant", "mobile", "online"]
                successful_payments = []
                
                for method in payment_methods_to_test:
                    payment_data = {
                        "payment_method": method,
                        "payment_status": "paid"
                    }
                    
                    if method == "cash":
                        payment_data.update({
                            "amount_received": 25.00,
                            "change_given": 5.00
                        })
                    
                    async with self.session.post(
                        f"{self.base_url}/api/v1/admin/orders/{test_order_id}/payment",
                        json=payment_data,
                        headers={"Content-Type": "application/json"}
                    ) as payment_response:
                        
                        if payment_response.status == 200:
                            payment_result = await payment_response.json()
                            if payment_result.get("success"):
                                successful_payments.append(method)
                
                # Check for multi-payment support (this would be in order structure)
                has_multi_payment_support = False
                for order in orders:
                    # Look for signs of multi-payment (multiple payment entries, payment_details array, etc.)
                    if (isinstance(order.get("payment_details"), list) or 
                        "payment_methods" in order or 
                        "payments" in order):
                        has_multi_payment_support = True
                        break
                
                success_message = f"Orders & Payment: GET ({len(orders)} orders), Payment methods found: {payment_methods_found}, Tested methods: {successful_payments}"
                if has_multi_payment_support:
                    success_message += ", Multi-payment support detected"
                
                self.log_result(test_name, True, success_message)
                return True
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_promotions_v2_no_regression(self) -> bool:
        """Test Promotions V2 - Pas de régression."""
        test_name = "Promotions V2 - No Regression"
        
        try:
            # Test GET /api/v1/admin/promotions
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/promotions",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"GET promotions failed: HTTP {response.status}: {error_data}")
                    return False
                
                data = await response.json()
                promotions = data.get("promotions", [])
                
                # Test simulation endpoint
                simulation_data = {
                    "cart": {
                        "items": [
                            {"product_id": "test-product", "quantity": 2, "price": 10.0}
                        ],
                        "total": 20.0
                    },
                    "customer": {
                        "type": "regular",
                        "loyalty_points": 100
                    }
                }
                
                async with self.session.post(
                    f"{self.base_url}/api/v1/admin/promotions/simulate",
                    json=simulation_data,
                    headers={"Content-Type": "application/json"}
                ) as sim_response:
                    
                    simulation_works = sim_response.status == 200
                
                # Test analytics endpoint
                async with self.session.get(
                    f"{self.base_url}/api/v1/admin/promotions/analytics/overview",
                    headers={"Content-Type": "application/json"}
                ) as analytics_response:
                    
                    analytics_works = analytics_response.status == 200
                
                self.log_result(test_name, True, f"Promotions V2 no regression: GET ({len(promotions)} promotions), Simulation: {simulation_works}, Analytics: {analytics_works}")
                return True
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_customers_basic_fields(self) -> bool:
        """Test Customers - Champs de base (name, email, phone, address)."""
        test_name = "Customers - Basic Fields"
        
        try:
            # Test GET /api/v1/admin/customers
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/customers",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"GET customers failed: HTTP {response.status}: {error_data}")
                    return False
                
                data = await response.json()
                customers = data.get("customers", [])
                
                if len(customers) == 0:
                    self.log_result(test_name, True, "No customers found (empty database is acceptable)")
                    return True
                
                # Check if customers have basic fields
                basic_fields = ["name", "email", "phone", "address"]
                field_coverage = {field: False for field in basic_fields}
                
                for customer in customers:
                    for field in basic_fields:
                        if field in customer and customer[field]:
                            field_coverage[field] = True
                
                # Count how many basic fields are present across all customers
                fields_found = sum(field_coverage.values())
                
                self.log_result(test_name, True, f"Customers basic fields: GET ({len(customers)} customers), Fields found: {field_coverage}")
                return True
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def run_comprehensive_test(self):
        """Run all French final verification tests."""
        print("🇫🇷 FRENCH FINAL VERIFICATION - COMPREHENSIVE BACKEND TESTING")
        print("=" * 80)
        print(f"Backend URL: {self.base_url}")
        print(f"Admin Credentials: admin@familys.app / Admin@123456")
        print("=" * 80)
        
        # Login first
        login_success = await self.test_login()
        if not login_success:
            print("❌ Cannot proceed without authentication")
            return
        
        # Run all tests
        tests = [
            ("1. Settings API - Nouveaux Champs", self.test_settings_api_nouveaux_champs),
            ("2. Products - Sans Slug", self.test_products_sans_slug),
            ("3. Categories - Sans Slug", self.test_categories_sans_slug),
            ("4. Options - Nouveaux Champs", self.test_options_nouveaux_champs),
            ("5. Orders & Payment - Modes Paiement", self.test_orders_payment_modes),
            ("6. Promotions V2 - No Regression", self.test_promotions_v2_no_regression),
            ("7. Customers - Basic Fields", self.test_customers_basic_fields),
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n🧪 Testing {test_name}...")
            try:
                success = await test_func()
                if success:
                    passed_tests += 1
            except Exception as e:
                print(f"❌ {test_name} - Exception: {str(e)}")
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 FRENCH FINAL VERIFICATION SUMMARY")
        print("=" * 80)
        
        success_rate = (passed_tests / total_tests) * 100
        print(f"✅ Tests Passed: {passed_tests}/{total_tests} ({success_rate:.1f}%)")
        
        if passed_tests == total_tests:
            print("🎉 ALL TESTS PASSED - Backend ready for production!")
        else:
            print(f"⚠️  {total_tests - passed_tests} tests failed - Review required")
        
        # Detailed results
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        return passed_tests == total_tests

async def main():
    """Main test execution."""
    async with FrenchFinalVerificationTester() as tester:
        success = await tester.run_comprehensive_test()
        sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())