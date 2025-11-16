#!/usr/bin/env python3
"""
Mobile App Backend API Testing
Testing all endpoints required for the new mobile app as specified in the review request.

Endpoints to test:
1. Products API: GET /api/v1/products, GET /api/v1/products/{id}
2. Categories API: GET /api/v1/categories
3. Orders API: POST /api/v1/orders, GET /api/v1/orders/{order_id}, GET /api/v1/orders/customer/{email}
4. Promotions API: GET /api/v1/admin/promotions?status=active
5. Cashback API: GET /api/v1/cashback/settings, GET /api/v1/cashback/balance/{customer_id}, POST /api/v1/cashback/preview

Backend URL: https://react-reborn.preview.emergentagent.com
"""

import requests
import json
from datetime import datetime, timezone
import uuid
import time

# Configuration
BASE_URL = "https://react-reborn.preview.emergentagent.com"
ADMIN_EMAIL = "admin@familys.app"
ADMIN_PASSWORD = "Admin@123456"

class MobileAppBackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.test_results = []
        self.test_customer_id = None
        self.test_product_id = None
        self.test_order_id = None
        
    def log_result(self, test_name, success, details="", error=""):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "error": error,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅" if success else "❌"
        print(f"{status} {test_name}: {details}")
        if error:
            print(f"   Error: {error}")
    
    def authenticate(self):
        """Authenticate as admin for protected endpoints"""
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/admin/auth/login",
                json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.log_result("Admin Authentication", True, f"Token obtained for protected endpoints")
                return True
            else:
                self.log_result("Admin Authentication", False, error=f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Admin Authentication", False, error=str(e))
            return False
    
    def get_headers(self):
        """Get headers with authentication"""
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_products_api(self):
        """Test Products API endpoints"""
        print("\n🍔 TESTING PRODUCTS API")
        
        # 1. Test GET /api/v1/products (liste produits)
        try:
            response = requests.get(f"{self.base_url}/api/v1/products")
            
            if response.status_code == 200:
                data = response.json()
                products = data.get("products", []) if isinstance(data, dict) else data
                
                if products and len(products) > 0:
                    self.log_result("GET /api/v1/products", True, f"Retrieved {len(products)} products")
                    
                    # Store first product ID for detail test
                    self.test_product_id = products[0].get("id")
                    
                    # Verify product structure
                    first_product = products[0]
                    required_fields = ["id", "name", "price"]
                    missing_fields = [field for field in required_fields if field not in first_product]
                    
                    if not missing_fields:
                        self.log_result("Product Structure Validation", True, f"Products have required fields: {required_fields}")
                    else:
                        self.log_result("Product Structure Validation", False, error=f"Missing fields: {missing_fields}")
                else:
                    self.log_result("GET /api/v1/products", False, error="No products returned")
            else:
                self.log_result("GET /api/v1/products", False, error=f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("GET /api/v1/products", False, error=str(e))
        
        # 2. Test GET /api/v1/products/{id} (détail produit)
        if self.test_product_id:
            try:
                response = requests.get(f"{self.base_url}/api/v1/products/{self.test_product_id}")
                
                if response.status_code == 200:
                    product = response.json()
                    
                    if product and product.get("id") == self.test_product_id:
                        self.log_result("GET /api/v1/products/{id}", True, f"Retrieved product details for ID: {self.test_product_id}")
                        
                        # Verify detailed product structure
                        expected_fields = ["id", "name", "price", "description"]
                        available_fields = list(product.keys())
                        self.log_result("Product Detail Fields", True, f"Available fields: {', '.join(available_fields)}")
                    else:
                        self.log_result("GET /api/v1/products/{id}", False, error="Product ID mismatch or empty response")
                else:
                    self.log_result("GET /api/v1/products/{id}", False, error=f"Status {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("GET /api/v1/products/{id}", False, error=str(e))
        else:
            self.log_result("GET /api/v1/products/{id}", False, error="No product ID available for testing")
    
    def test_categories_api(self):
        """Test Categories API endpoints"""
        print("\n📂 TESTING CATEGORIES API")
        
        # Test GET /api/v1/categories (liste catégories)
        try:
            response = requests.get(f"{self.base_url}/api/v1/categories")
            
            if response.status_code == 200:
                data = response.json()
                categories = data.get("categories", []) if isinstance(data, dict) else data
                
                if categories and len(categories) > 0:
                    self.log_result("GET /api/v1/categories", True, f"Retrieved {len(categories)} categories")
                    
                    # Verify category structure
                    first_category = categories[0]
                    required_fields = ["id", "name"]
                    missing_fields = [field for field in required_fields if field not in first_category]
                    
                    if not missing_fields:
                        self.log_result("Category Structure Validation", True, f"Categories have required fields: {required_fields}")
                    else:
                        self.log_result("Category Structure Validation", False, error=f"Missing fields: {missing_fields}")
                        
                    # Show available category names
                    category_names = [cat.get("name", "Unknown") for cat in categories[:5]]
                    self.log_result("Category Names Sample", True, f"Sample categories: {', '.join(category_names)}")
                else:
                    self.log_result("GET /api/v1/categories", False, error="No categories returned")
            else:
                self.log_result("GET /api/v1/categories", False, error=f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("GET /api/v1/categories", False, error=str(e))
    
    def test_orders_api(self):
        """Test Orders API endpoints"""
        print("\n📋 TESTING ORDERS API")
        
        # First, get existing orders to test retrieval endpoints
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/admin/orders?limit=10",
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                orders = data.get("orders", [])
                
                if orders:
                    # Test GET /api/v1/orders/{order_id} (détail commande)
                    test_order = orders[0]
                    self.test_order_id = test_order.get("id")
                    customer_email = test_order.get("customer_email")
                    
                    # Test order detail endpoint
                    try:
                        detail_response = requests.get(f"{self.base_url}/api/v1/orders/{self.test_order_id}")
                        
                        if detail_response.status_code == 200:
                            order_detail = detail_response.json()
                            if order_detail and order_detail.get("id") == self.test_order_id:
                                self.log_result("GET /api/v1/orders/{order_id}", True, f"Retrieved order details for ID: {self.test_order_id}")
                            else:
                                self.log_result("GET /api/v1/orders/{order_id}", False, error="Order ID mismatch or empty response")
                        else:
                            self.log_result("GET /api/v1/orders/{order_id}", False, error=f"Status {detail_response.status_code}: {detail_response.text}")
                            
                    except Exception as e:
                        self.log_result("GET /api/v1/orders/{order_id}", False, error=str(e))
                    
                    # Test GET /api/v1/orders/customer/{email} (commandes client)
                    if customer_email:
                        try:
                            customer_orders_response = requests.get(f"{self.base_url}/api/v1/orders/customer/{customer_email}")
                            
                            if customer_orders_response.status_code == 200:
                                customer_orders = customer_orders_response.json()
                                if isinstance(customer_orders, list) and len(customer_orders) > 0:
                                    self.log_result("GET /api/v1/orders/customer/{email}", True, f"Retrieved {len(customer_orders)} orders for customer: {customer_email}")
                                elif isinstance(customer_orders, dict) and customer_orders.get("orders"):
                                    orders_list = customer_orders.get("orders", [])
                                    self.log_result("GET /api/v1/orders/customer/{email}", True, f"Retrieved {len(orders_list)} orders for customer: {customer_email}")
                                else:
                                    self.log_result("GET /api/v1/orders/customer/{email}", True, f"No orders found for customer: {customer_email} (valid response)")
                            else:
                                self.log_result("GET /api/v1/orders/customer/{email}", False, error=f"Status {customer_orders_response.status_code}: {customer_orders_response.text}")
                                
                        except Exception as e:
                            self.log_result("GET /api/v1/orders/customer/{email}", False, error=str(e))
                    else:
                        self.log_result("GET /api/v1/orders/customer/{email}", False, error="No customer email available for testing")
                else:
                    self.log_result("Get Existing Orders", False, error="No orders found for testing")
                    
        except Exception as e:
            self.log_result("Get Existing Orders", False, error=str(e))
        
        # Test POST /api/v1/orders (créer commande)
        try:
            # Create a test order
            test_order_data = {
                "customer_email": "test.mobile@familys.app",
                "customer_name": "Test Mobile User",
                "customer_phone": "+33123456789",
                "items": [
                    {
                        "product_id": self.test_product_id or "test-product-123",
                        "name": "Test Burger",
                        "price": 12.50,
                        "quantity": 1,
                        "options": []
                    }
                ],
                "total": 12.50,
                "order_type": "takeaway",
                "payment_method": "card"
            }
            
            create_response = requests.post(
                f"{self.base_url}/api/v1/orders",
                json=test_order_data,
                headers={"Content-Type": "application/json"}
            )
            
            if create_response.status_code == 200 or create_response.status_code == 201:
                created_order = create_response.json()
                if created_order and created_order.get("id"):
                    self.log_result("POST /api/v1/orders", True, f"Created order with ID: {created_order.get('id')}")
                    self.test_order_id = created_order.get("id")  # Update for further tests
                else:
                    self.log_result("POST /api/v1/orders", False, error="Order created but no ID returned")
            else:
                self.log_result("POST /api/v1/orders", False, error=f"Status {create_response.status_code}: {create_response.text}")
                
        except Exception as e:
            self.log_result("POST /api/v1/orders", False, error=str(e))
    
    def test_promotions_api(self):
        """Test Promotions API endpoints"""
        print("\n🎯 TESTING PROMOTIONS API")
        
        # Test GET /api/v1/admin/promotions?status=active (promotions actives)
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/admin/promotions?status=active",
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                promotions = data.get("promotions", []) if isinstance(data, dict) else data
                
                if isinstance(promotions, list):
                    active_promotions = [p for p in promotions if p.get("status") == "active"]
                    self.log_result("GET /api/v1/admin/promotions?status=active", True, f"Retrieved {len(active_promotions)} active promotions (total: {len(promotions)})")
                    
                    if active_promotions:
                        # Verify promotion structure
                        first_promo = active_promotions[0]
                        promo_fields = list(first_promo.keys())
                        self.log_result("Promotion Structure", True, f"Promotion fields: {', '.join(promo_fields[:10])}")
                    else:
                        self.log_result("Active Promotions Check", True, "No active promotions found (valid state)")
                else:
                    self.log_result("GET /api/v1/admin/promotions?status=active", False, error="Invalid response format")
            else:
                self.log_result("GET /api/v1/admin/promotions?status=active", False, error=f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("GET /api/v1/admin/promotions?status=active", False, error=str(e))
    
    def test_cashback_api(self):
        """Test Cashback API endpoints"""
        print("\n💰 TESTING CASHBACK API")
        
        # 1. Test GET /api/v1/cashback/settings (paramètres cashback)
        try:
            response = requests.get(f"{self.base_url}/api/v1/cashback/settings")
            
            if response.status_code == 200:
                settings = response.json()
                
                if settings and "loyalty_percentage" in settings:
                    loyalty_percentage = settings.get("loyalty_percentage")
                    self.log_result("GET /api/v1/cashback/settings", True, f"Cashback settings retrieved - Loyalty: {loyalty_percentage}%")
                    
                    # Show all available settings
                    settings_keys = list(settings.keys())
                    self.log_result("Cashback Settings Fields", True, f"Available settings: {', '.join(settings_keys)}")
                else:
                    self.log_result("GET /api/v1/cashback/settings", False, error="Invalid settings format or missing loyalty_percentage")
            else:
                self.log_result("GET /api/v1/cashback/settings", False, error=f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("GET /api/v1/cashback/settings", False, error=str(e))
        
        # Get a customer ID for balance testing
        try:
            customers_response = requests.get(
                f"{self.base_url}/api/v1/admin/customers?limit=5",
                headers=self.get_headers()
            )
            
            if customers_response.status_code == 200:
                customers_data = customers_response.json()
                customers = customers_data.get("customers", [])
                
                if customers:
                    self.test_customer_id = customers[0].get("id")
                    customer_email = customers[0].get("email")
                    self.log_result("Get Test Customer", True, f"Using customer ID: {self.test_customer_id} ({customer_email})")
                else:
                    self.log_result("Get Test Customer", False, error="No customers found")
                    
        except Exception as e:
            self.log_result("Get Test Customer", False, error=str(e))
        
        # 2. Test GET /api/v1/cashback/balance/{customer_id} (solde cashback)
        if self.test_customer_id:
            try:
                response = requests.get(f"{self.base_url}/api/v1/cashback/balance/{self.test_customer_id}")
                
                if response.status_code == 200:
                    balance_data = response.json()
                    
                    if "balance" in balance_data:
                        balance = balance_data.get("balance")
                        self.log_result("GET /api/v1/cashback/balance/{customer_id}", True, f"Customer balance: {balance}")
                    else:
                        self.log_result("GET /api/v1/cashback/balance/{customer_id}", False, error="Balance field not found in response")
                else:
                    self.log_result("GET /api/v1/cashback/balance/{customer_id}", False, error=f"Status {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("GET /api/v1/cashback/balance/{customer_id}", False, error=str(e))
        else:
            self.log_result("GET /api/v1/cashback/balance/{customer_id}", False, error="No customer ID available for testing")
        
        # 3. Test POST /api/v1/cashback/preview (prévisualisation cashback)
        try:
            # Create a test cart for cashback preview
            test_cart = {
                "customer_id": self.test_customer_id or "test-customer-123",
                "items": [
                    {
                        "product_id": self.test_product_id or "test-product-123",
                        "name": "Test Burger",
                        "price": 15.00,
                        "quantity": 1
                    },
                    {
                        "product_id": "test-product-456",
                        "name": "Test Fries",
                        "price": 5.00,
                        "quantity": 1
                    }
                ],
                "total": 20.00,
                "use_cashback": False
            }
            
            preview_response = requests.post(
                f"{self.base_url}/api/v1/cashback/preview",
                json=test_cart,
                headers={"Content-Type": "application/json"}
            )
            
            if preview_response.status_code == 200:
                preview_data = preview_response.json()
                
                expected_fields = ["cashback_earned", "cashback_available", "remaining_to_pay"]
                available_fields = list(preview_data.keys())
                missing_fields = [field for field in expected_fields if field not in preview_data]
                
                if not missing_fields:
                    cashback_earned = preview_data.get("cashback_earned", 0)
                    remaining_to_pay = preview_data.get("remaining_to_pay", 0)
                    self.log_result("POST /api/v1/cashback/preview", True, f"Preview calculated - Earned: {cashback_earned}€, To pay: {remaining_to_pay}€")
                    
                    # Test with cashback usage
                    test_cart["use_cashback"] = True
                    preview_with_cashback = requests.post(
                        f"{self.base_url}/api/v1/cashback/preview",
                        json=test_cart,
                        headers={"Content-Type": "application/json"}
                    )
                    
                    if preview_with_cashback.status_code == 200:
                        cashback_data = preview_with_cashback.json()
                        cashback_to_use = cashback_data.get("cashback_to_use", 0)
                        new_remaining = cashback_data.get("remaining_to_pay", 0)
                        self.log_result("Cashback Preview with Usage", True, f"With cashback - Using: {cashback_to_use}€, Remaining: {new_remaining}€")
                    else:
                        self.log_result("Cashback Preview with Usage", False, error=f"Status {preview_with_cashback.status_code}")
                else:
                    self.log_result("POST /api/v1/cashback/preview", False, error=f"Missing fields: {missing_fields}")
            else:
                self.log_result("POST /api/v1/cashback/preview", False, error=f"Status {preview_response.status_code}: {preview_response.text}")
                
        except Exception as e:
            self.log_result("POST /api/v1/cashback/preview", False, error=str(e))
    
    def run_all_tests(self):
        """Run all mobile app backend tests"""
        print("🚀 STARTING MOBILE APP BACKEND API TESTING")
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        # Authenticate for protected endpoints
        if not self.authenticate():
            print("⚠️  Authentication failed. Some protected endpoints may not be testable.")
        
        # Run all test scenarios
        self.test_products_api()
        self.test_categories_api()
        self.test_orders_api()
        self.test_promotions_api()
        self.test_cashback_api()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 MOBILE APP BACKEND TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Group results by API category
        api_categories = {
            "Products API": ["GET /api/v1/products", "GET /api/v1/products/{id}", "Product Structure", "Product Detail"],
            "Categories API": ["GET /api/v1/categories", "Category Structure", "Category Names"],
            "Orders API": ["GET /api/v1/orders/{order_id}", "GET /api/v1/orders/customer/{email}", "POST /api/v1/orders"],
            "Promotions API": ["GET /api/v1/admin/promotions?status=active", "Promotion Structure", "Active Promotions"],
            "Cashback API": ["GET /api/v1/cashback/settings", "GET /api/v1/cashback/balance/{customer_id}", "POST /api/v1/cashback/preview", "Cashback Preview"]
        }
        
        print("\n📋 RESULTS BY API CATEGORY:")
        for category, test_names in api_categories.items():
            category_results = [r for r in self.test_results if any(test_name in r["test"] for test_name in test_names)]
            if category_results:
                category_passed = sum(1 for r in category_results if r["success"])
                category_total = len(category_results)
                status = "✅" if category_passed == category_total else "⚠️" if category_passed > 0 else "❌"
                print(f"  {status} {category}: {category_passed}/{category_total} tests passed")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS DETAILS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['error']}")
        
        print("\n🎯 MOBILE APP READINESS:")
        critical_endpoints = [
            "GET /api/v1/products",
            "GET /api/v1/categories", 
            "POST /api/v1/orders",
            "GET /api/v1/cashback/settings"
        ]
        
        critical_passed = sum(1 for result in self.test_results 
                            if result["success"] and any(endpoint in result["test"] for endpoint in critical_endpoints))
        
        if critical_passed >= len(critical_endpoints):
            print("✅ All critical endpoints for mobile app are working!")
        else:
            print(f"⚠️  {critical_passed}/{len(critical_endpoints)} critical endpoints working")
        
        return passed_tests, failed_tests

if __name__ == "__main__":
    tester = MobileAppBackendTester()
    passed, failed = tester.run_all_tests()
    
    # Exit with appropriate code
    exit(0 if failed == 0 else 1)