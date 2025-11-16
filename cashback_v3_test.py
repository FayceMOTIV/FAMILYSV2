#!/usr/bin/env python3
"""
Test complet du système cashback Family's V3
Testing all cashback endpoints as specified in the review request
Backend URL: https://foodapp-redesign.preview.emergentagent.com
"""

import requests
import json
from datetime import datetime, timezone
import uuid
import time

# Configuration
BASE_URL = "https://foodapp-redesign.preview.emergentagent.com"
ADMIN_EMAIL = "admin@familys.app"
ADMIN_PASSWORD = "Admin@123456"

class CashbackV3Tester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.test_results = []
        self.test_customer_id = None
        
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
        """Authenticate as admin"""
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/admin/auth/login",
                json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.log_result("Admin Authentication", True, f"Token obtained successfully")
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
    
    def get_test_customer(self):
        """Get a test customer for cashback testing"""
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/admin/customers?limit=1",
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                customers = response.json().get("customers", [])
                if customers:
                    customer = customers[0]
                    self.test_customer_id = customer.get("id")
                    customer_email = customer.get("email")
                    loyalty_points = customer.get("loyalty_points", 0)
                    
                    self.log_result("Get Test Customer", True, 
                                  f"Using customer {customer_email} (ID: {self.test_customer_id}) with {loyalty_points}€ balance")
                    return True
                else:
                    self.log_result("Get Test Customer", False, error="No customers found in database")
                    return False
            else:
                self.log_result("Get Test Customer", False, error=f"Status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Get Test Customer", False, error=str(e))
            return False
    
    def test_cashback_settings(self):
        """Test Scenario 1: GET /api/v1/cashback/settings"""
        print("\n💰 TESTING CASHBACK SETTINGS")
        
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/cashback/settings",
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify required fields are present
                loyalty_percentage = data.get("loyalty_percentage")
                loyalty_exclude_promos = data.get("loyalty_exclude_promos_from_calculation")
                
                if loyalty_percentage is not None and loyalty_exclude_promos is not None:
                    self.log_result("Cashback Settings", True, 
                                  f"loyalty_percentage: {loyalty_percentage}%, loyalty_exclude_promos_from_calculation: {loyalty_exclude_promos}")
                    return True
                else:
                    missing_fields = []
                    if loyalty_percentage is None:
                        missing_fields.append("loyalty_percentage")
                    if loyalty_exclude_promos is None:
                        missing_fields.append("loyalty_exclude_promos_from_calculation")
                    
                    self.log_result("Cashback Settings", False, 
                                  error=f"Missing required fields: {', '.join(missing_fields)}")
                    return False
            else:
                self.log_result("Cashback Settings", False, error=f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Cashback Settings", False, error=str(e))
            return False
    
    def test_cashback_balance(self):
        """Test Scenario 2: GET /api/v1/cashback/balance/{customer_id}"""
        print("\n💳 TESTING CASHBACK BALANCE")
        
        if not self.test_customer_id:
            self.log_result("Cashback Balance", False, error="No test customer available")
            return False
        
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/cashback/balance/{self.test_customer_id}",
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify required fields
                customer_id = data.get("customer_id")
                balance = data.get("balance")
                currency = data.get("currency")
                
                if customer_id and balance is not None and currency:
                    if currency == "EUR":
                        self.log_result("Cashback Balance", True, 
                                      f"Customer {customer_id} has balance: {balance} {currency}")
                        return True
                    else:
                        self.log_result("Cashback Balance", False, 
                                      error=f"Currency should be EUR, got: {currency}")
                        return False
                else:
                    self.log_result("Cashback Balance", False, 
                                  error="Missing required fields: customer_id, balance, or currency")
                    return False
            else:
                self.log_result("Cashback Balance", False, error=f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Cashback Balance", False, error=str(e))
            return False
    
    def test_cashback_preview_without_using(self):
        """Test Scenario 3: POST /api/v1/cashback/preview (without using cashback)"""
        print("\n🔍 TESTING CASHBACK PREVIEW (WITHOUT USING CASHBACK)")
        
        try:
            preview_data = {
                "customer_id": self.test_customer_id or "test_customer",
                "subtotal": 50.0,
                "total_after_promos": 50.0,
                "promo_discount": 0.0,
                "use_cashback": False
            }
            
            response = requests.post(
                f"{self.base_url}/api/v1/cashback/preview",
                json=preview_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify required fields
                required_fields = ["cashback_earned", "cashback_available", "remaining_to_pay", "new_balance_after_order"]
                missing_fields = []
                
                for field in required_fields:
                    if field not in data:
                        missing_fields.append(field)
                
                if not missing_fields:
                    cashback_earned = data.get("cashback_earned")
                    cashback_available = data.get("cashback_available")
                    remaining_to_pay = data.get("remaining_to_pay")
                    new_balance = data.get("new_balance_after_order")
                    
                    self.log_result("Cashback Preview (No Use)", True, 
                                  f"cashback_earned: {cashback_earned}€, cashback_available: {cashback_available}€, "
                                  f"remaining_to_pay: {remaining_to_pay}€, new_balance_after_order: {new_balance}€")
                    return True
                else:
                    self.log_result("Cashback Preview (No Use)", False, 
                                  error=f"Missing required fields: {', '.join(missing_fields)}")
                    return False
            else:
                self.log_result("Cashback Preview (No Use)", False, error=f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Cashback Preview (No Use)", False, error=str(e))
            return False
    
    def test_cashback_preview_with_using(self):
        """Test Scenario 4: POST /api/v1/cashback/preview (with using cashback)"""
        print("\n💸 TESTING CASHBACK PREVIEW (WITH USING CASHBACK)")
        
        try:
            preview_data = {
                "customer_id": self.test_customer_id or "test_customer",
                "subtotal": 50.0,
                "total_after_promos": 50.0,
                "promo_discount": 0.0,
                "use_cashback": True
            }
            
            response = requests.post(
                f"{self.base_url}/api/v1/cashback/preview",
                json=preview_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify required fields
                required_fields = ["cashback_earned", "cashback_available", "cashback_to_use", "remaining_to_pay"]
                missing_fields = []
                
                for field in required_fields:
                    if field not in data:
                        missing_fields.append(field)
                
                if not missing_fields:
                    cashback_earned = data.get("cashback_earned")
                    cashback_available = data.get("cashback_available")
                    cashback_to_use = data.get("cashback_to_use")
                    remaining_to_pay = data.get("remaining_to_pay")
                    
                    # Verify that remaining_to_pay is reduced when using cashback
                    if cashback_to_use > 0 and remaining_to_pay < 50.0:
                        self.log_result("Cashback Preview (With Use)", True, 
                                      f"cashback_earned: {cashback_earned}€, cashback_available: {cashback_available}€, "
                                      f"cashback_to_use: {cashback_to_use}€, remaining_to_pay: {remaining_to_pay}€ (reduced from 50€)")
                        return True
                    elif cashback_to_use == 0:
                        self.log_result("Cashback Preview (With Use)", True, 
                                      f"No cashback available to use. cashback_available: {cashback_available}€, remaining_to_pay: {remaining_to_pay}€")
                        return True
                    else:
                        self.log_result("Cashback Preview (With Use)", False, 
                                      error=f"Expected remaining_to_pay to be reduced, but got: {remaining_to_pay}€")
                        return False
                else:
                    self.log_result("Cashback Preview (With Use)", False, 
                                  error=f"Missing required fields: {', '.join(missing_fields)}")
                    return False
            else:
                self.log_result("Cashback Preview (With Use)", False, error=f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Cashback Preview (With Use)", False, error=str(e))
            return False
    
    def test_order_creation_with_cashback(self):
        """Test Scenario 5: POST /api/v1/orders (order creation with cashback)"""
        print("\n🛒 TESTING ORDER CREATION WITH CASHBACK")
        
        try:
            order_data = {
                "customer_email": "test@test.com",
                "customer_name": "Test User",
                "customer_phone": "0612345678",
                "items": [
                    {
                        "product_id": "test_product",
                        "name": "Burger",
                        "base_price": 10.0,
                        "quantity": 1,
                        "total_price": 10.0
                    }
                ],
                "subtotal": 10.0,
                "vat_amount": 1.0,
                "total": 10.0,
                "use_cashback": False,
                "payment_method": "card",
                "consumption_mode": "takeaway",
                "pickup_date": "2025-11-15",
                "pickup_time": "18:00"
            }
            
            response = requests.post(
                f"{self.base_url}/api/v1/orders",
                json=order_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify required fields
                success = data.get("success")
                order_id = data.get("order_id")
                order_number = data.get("order_number")
                cashback_earned = data.get("cashback_earned")
                
                if success and order_id and order_number and cashback_earned is not None:
                    self.log_result("Order Creation with Cashback", True, 
                                  f"Order created successfully. ID: {order_id}, Number: {order_number}, "
                                  f"Cashback earned: {cashback_earned}€")
                    return True
                else:
                    missing_fields = []
                    if not success:
                        missing_fields.append("success")
                    if not order_id:
                        missing_fields.append("order_id")
                    if not order_number:
                        missing_fields.append("order_number")
                    if cashback_earned is None:
                        missing_fields.append("cashback_earned")
                    
                    self.log_result("Order Creation with Cashback", False, 
                                  error=f"Missing or invalid fields: {', '.join(missing_fields)}")
                    return False
            else:
                self.log_result("Order Creation with Cashback", False, error=f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Order Creation with Cashback", False, error=str(e))
            return False
    
    def run_all_tests(self):
        """Run all cashback V3 tests"""
        print("🚀 STARTING FAMILY'S CASHBACK V3 SYSTEM TESTING")
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return
        
        # Get test customer
        self.get_test_customer()
        
        # Run all test scenarios as specified in review request
        self.test_cashback_settings()
        self.test_cashback_balance()
        self.test_cashback_preview_without_using()
        self.test_cashback_preview_with_using()
        self.test_order_creation_with_cashback()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 CASHBACK V3 TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['error']}")
        
        return passed_tests, failed_tests

if __name__ == "__main__":
    tester = CashbackV3Tester()
    passed, failed = tester.run_all_tests()
    
    # Exit with appropriate code
    exit(0 if failed == 0 else 1)