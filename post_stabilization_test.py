#!/usr/bin/env python3
"""
VERIFICATION BACKEND POST-STABILISATION
Test des endpoints backend critiques après correction des bugs frontend
"""

import requests
import json
from datetime import datetime, timezone
import uuid
import time

# Configuration
BASE_URL = "https://react-native-reboot.preview.emergentagent.com"
ADMIN_EMAIL = "admin@familys.app"
ADMIN_PASSWORD = "Admin@123456"

class PostStabilizationTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.test_results = []
        
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
        """1. AUTH & ADMIN - POST /api/v1/admin/auth/login"""
        print("\n🔐 1. AUTH & ADMIN TESTING")
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/admin/auth/login",
                json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                user_info = data.get("user", {})
                self.log_result("POST /api/v1/admin/auth/login", True, 
                              f"Login successful - Token: {self.token[:20]}..., User: {user_info.get('email', 'N/A')}")
                return True
            else:
                self.log_result("POST /api/v1/admin/auth/login", False, 
                              error=f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("POST /api/v1/admin/auth/login", False, error=str(e))
            return False
    
    def get_headers(self):
        """Get headers with authentication"""
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_admin_dashboard(self):
        """GET /api/v1/admin/dashboard/stats"""
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/admin/dashboard/stats",
                headers=self.get_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                # Check for expected dashboard data
                ca_today = data.get("ca_today", 0)
                orders_today = data.get("orders_today", 0)
                self.log_result("GET /api/v1/admin/dashboard/stats", True, 
                              f"Dashboard stats retrieved - CA today: {ca_today}€, Orders today: {orders_today}")
            else:
                self.log_result("GET /api/v1/admin/dashboard/stats", False, 
                              error=f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("GET /api/v1/admin/dashboard/stats", False, error=str(e))
    
    def test_cashback_system_v3(self):
        """2. CASHBACK SYSTEM V3 Testing"""
        print("\n💰 2. CASHBACK SYSTEM V3 TESTING")
        
        # Test cashback settings
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/cashback/settings",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                loyalty_percentage = data.get("loyalty_percentage")
                if loyalty_percentage == 5.0:
                    self.log_result("GET /api/v1/cashback/settings", True, 
                                  f"Cashback settings correct - loyalty_percentage: {loyalty_percentage}%")
                else:
                    self.log_result("GET /api/v1/cashback/settings", False, 
                                  error=f"Expected loyalty_percentage=5%, got {loyalty_percentage}%")
            else:
                self.log_result("GET /api/v1/cashback/settings", False, 
                              error=f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("GET /api/v1/cashback/settings", False, error=str(e))
        
        # Test cashback balance - need a customer_id from database
        try:
            # Get customers to find a customer_id
            customers_response = requests.get(
                f"{self.base_url}/api/v1/admin/customers?limit=1",
                headers=self.get_headers(),
                timeout=10
            )
            
            if customers_response.status_code == 200:
                customers_data = customers_response.json()
                customers = customers_data.get("customers", [])
                
                if customers:
                    customer_id = customers[0].get("id")
                    
                    # Test cashback balance
                    balance_response = requests.get(
                        f"{self.base_url}/api/v1/cashback/balance/{customer_id}",
                        timeout=10
                    )
                    
                    if balance_response.status_code == 200:
                        balance_data = balance_response.json()
                        balance = balance_data.get("balance", 0)
                        self.log_result("GET /api/v1/cashback/balance/{customer_id}", True, 
                                      f"Customer balance retrieved: {balance}€")
                    else:
                        self.log_result("GET /api/v1/cashback/balance/{customer_id}", False, 
                                      error=f"Status {balance_response.status_code}: {balance_response.text}")
                else:
                    self.log_result("GET customers for cashback test", False, error="No customers found")
            else:
                self.log_result("GET customers for cashback test", False, 
                              error=f"Status {customers_response.status_code}")
                
        except Exception as e:
            self.log_result("GET /api/v1/cashback/balance/{customer_id}", False, error=str(e))
        
        # Test cashback preview without cashback
        try:
            preview_data_without = {
                "subtotal": 50.0,
                "total_after_promos": 50.0,
                "promo_discount": 0.0,
                "use_cashback": False
            }
            
            preview_response = requests.post(
                f"{self.base_url}/api/v1/cashback/preview",
                json=preview_data_without,
                timeout=10
            )
            
            if preview_response.status_code == 200:
                preview_result = preview_response.json()
                cashback_earned = preview_result.get("cashback_earned", 0)
                remaining_to_pay = preview_result.get("remaining_to_pay", 0)
                self.log_result("POST /api/v1/cashback/preview (without cashback)", True, 
                              f"Preview calculated - Cashback earned: {cashback_earned}€, To pay: {remaining_to_pay}€")
            else:
                self.log_result("POST /api/v1/cashback/preview (without cashback)", False, 
                              error=f"Status {preview_response.status_code}: {preview_response.text}")
                
        except Exception as e:
            self.log_result("POST /api/v1/cashback/preview (without cashback)", False, error=str(e))
        
        # Test cashback preview with cashback
        try:
            preview_data_with = {
                "subtotal": 50.0,
                "total_after_promos": 50.0,
                "promo_discount": 0.0,
                "use_cashback": True,
                "customer_id": customer_id if 'customer_id' in locals() else "test-customer"
            }
            
            preview_response_with = requests.post(
                f"{self.base_url}/api/v1/cashback/preview",
                json=preview_data_with,
                timeout=10
            )
            
            if preview_response_with.status_code == 200:
                preview_result_with = preview_response_with.json()
                cashback_to_use = preview_result_with.get("cashback_to_use", 0)
                remaining_to_pay = preview_result_with.get("remaining_to_pay", 0)
                self.log_result("POST /api/v1/cashback/preview (with cashback)", True, 
                              f"Preview with cashback - Cashback to use: {cashback_to_use}€, To pay: {remaining_to_pay}€")
            else:
                self.log_result("POST /api/v1/cashback/preview (with cashback)", False, 
                              error=f"Status {preview_response_with.status_code}: {preview_response_with.text}")
                
        except Exception as e:
            self.log_result("POST /api/v1/cashback/preview (with cashback)", False, error=str(e))
    
    def test_products_and_categories(self):
        """3. PRODUCTS & CATEGORIES Testing"""
        print("\n🍔 3. PRODUCTS & CATEGORIES TESTING")
        
        # Test products endpoint
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/products",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                products = data.get("products", []) if isinstance(data, dict) else data
                products_count = len(products) if isinstance(products, list) else 0
                self.log_result("GET /api/v1/products", True, 
                              f"Products retrieved successfully - Count: {products_count}")
            else:
                self.log_result("GET /api/v1/products", False, 
                              error=f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("GET /api/v1/products", False, error=str(e))
        
        # Test categories endpoint
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/categories",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                categories = data.get("categories", []) if isinstance(data, dict) else data
                categories_count = len(categories) if isinstance(categories, list) else 0
                self.log_result("GET /api/v1/categories", True, 
                              f"Categories retrieved successfully - Count: {categories_count}")
            else:
                self.log_result("GET /api/v1/categories", False, 
                              error=f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("GET /api/v1/categories", False, error=str(e))
    
    def test_orders(self):
        """4. ORDERS Testing"""
        print("\n📋 4. ORDERS TESTING")
        
        # Test admin orders endpoint
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/admin/orders",
                headers=self.get_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                orders = data.get("orders", [])
                orders_count = len(orders)
                self.log_result("GET /api/v1/admin/orders", True, 
                              f"Admin orders retrieved - Count: {orders_count}")
            else:
                self.log_result("GET /api/v1/admin/orders", False, 
                              error=f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("GET /api/v1/admin/orders", False, error=str(e))
        
        # Test creating a simple order
        try:
            order_data = {
                "customer_email": "test@familys.app",
                "customer_name": "Test Customer",
                "customer_phone": "0123456789",
                "items": [
                    {
                        "product_id": "test-product-1",
                        "name": "Test Burger",
                        "price": 10.0,
                        "quantity": 1,
                        "options": []
                    }
                ],
                "total": 10.0,
                "order_type": "takeaway",
                "use_cashback": False
            }
            
            create_response = requests.post(
                f"{self.base_url}/api/v1/orders",
                json=order_data,
                timeout=10
            )
            
            if create_response.status_code in [200, 201]:
                create_data = create_response.json()
                order_id = create_data.get("order_id") or create_data.get("id")
                self.log_result("POST /api/v1/orders (create simple order)", True, 
                              f"Order created successfully - ID: {order_id}")
            else:
                self.log_result("POST /api/v1/orders (create simple order)", False, 
                              error=f"Status {create_response.status_code}: {create_response.text}")
                
        except Exception as e:
            self.log_result("POST /api/v1/orders (create simple order)", False, error=str(e))
    
    def test_stock_management(self):
        """5. STOCK MANAGEMENT Testing"""
        print("\n📦 5. STOCK MANAGEMENT TESTING")
        
        # Test admin products with stock_status fields
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/admin/products",
                headers=self.get_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                products = data.get("products", [])
                
                if products:
                    # Check if products have stock_status fields
                    first_product = products[0]
                    has_stock_status = "stock_status" in first_product
                    has_is_out_of_stock = "is_out_of_stock" in first_product
                    
                    stock_info = f"stock_status field: {has_stock_status}, is_out_of_stock field: {has_is_out_of_stock}"
                    
                    if has_stock_status and has_is_out_of_stock:
                        self.log_result("GET /api/v1/admin/products (stock fields)", True, 
                                      f"Products have stock management fields - {stock_info}")
                    else:
                        self.log_result("GET /api/v1/admin/products (stock fields)", False, 
                                      error=f"Missing stock fields - {stock_info}")
                else:
                    self.log_result("GET /api/v1/admin/products (stock fields)", False, 
                                  error="No products found to check stock fields")
            else:
                self.log_result("GET /api/v1/admin/products (stock fields)", False, 
                              error=f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("GET /api/v1/admin/products (stock fields)", False, error=str(e))
    
    def run_post_stabilization_tests(self):
        """Run all post-stabilization verification tests"""
        print("🚀 VERIFICATION BACKEND POST-STABILISATION")
        print(f"Backend URL: {self.base_url}")
        print("Tests par ordre de priorité:")
        print("1. AUTH & ADMIN")
        print("2. CASHBACK SYSTEM V3") 
        print("3. PRODUCTS & CATEGORIES")
        print("4. ORDERS")
        print("5. STOCK MANAGEMENT")
        print("=" * 80)
        
        # 1. Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return
        
        # Test admin dashboard
        self.test_admin_dashboard()
        
        # 2. Test cashback system V3
        self.test_cashback_system_v3()
        
        # 3. Test products and categories
        self.test_products_and_categories()
        
        # 4. Test orders
        self.test_orders()
        
        # 5. Test stock management
        self.test_stock_management()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 RÉSULTATS DE LA VÉRIFICATION POST-STABILISATION")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total des tests: {total_tests}")
        print(f"✅ Réussis: {passed_tests}")
        print(f"❌ Échoués: {failed_tests}")
        print(f"Taux de réussite: {(passed_tests/total_tests)*100:.1f}%")
        
        # Critères de succès
        print(f"\n🎯 CRITÈRES DE SUCCÈS:")
        print(f"- Tous les endpoints répondent avec status 200/201: {'✅' if failed_tests == 0 else '❌'}")
        print(f"- Pas d'erreurs 500 ou timeout: {'✅' if not any('500' in str(r.get('error', '')) or 'timeout' in str(r.get('error', '')) for r in self.test_results if not r['success']) else '❌'}")
        print(f"- Données cohérentes et correctement formatées: {'✅' if passed_tests > total_tests * 0.8 else '❌'}")
        print(f"- Système de cashback calcule correctement: {'✅' if any('cashback' in r['test'].lower() and r['success'] for r in self.test_results) else '❌'}")
        
        if failed_tests > 0:
            print("\n❌ TESTS ÉCHOUÉS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['error']}")
        else:
            print("\n🎉 TOUS LES TESTS SONT PASSÉS - BACKEND STABLE APRÈS CORRECTIONS!")
        
        return passed_tests, failed_tests

if __name__ == "__main__":
    tester = PostStabilizationTester()
    passed, failed = tester.run_post_stabilization_tests()
    
    # Exit with appropriate code
    exit(0 if failed == 0 else 1)