#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Family's Restaurant Notification System
Testing notification CRUD endpoints and order payment flow with loyalty notifications
"""

import requests
import json
from datetime import datetime, timezone
import uuid
import time

# Configuration
BASE_URL = "https://chefs-control.preview.emergentagent.com"
ADMIN_EMAIL = "admin@familys.app"
ADMIN_PASSWORD = "Admin@123456"

class NotificationSystemTester:
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
        """Authenticate as admin"""
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/admin/auth/login",
                json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.log_result("Admin Authentication", True, f"Token obtained: {self.token[:20]}...")
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
    
    def test_notification_crud_endpoints(self):
        """Test all notification CRUD endpoints"""
        print("\n🔔 TESTING NOTIFICATION CRUD ENDPOINTS")
        
        # 1. Test GET /api/v1/notifications/{user_id} - Get user notifications
        try:
            # First, get a customer to use their ID
            customer_response = requests.get(
                f"{self.base_url}/api/v1/admin/customers",
                headers=self.get_headers()
            )
            
            if customer_response.status_code == 200:
                customers = customer_response.json().get("customers", [])
                if customers:
                    test_user_id = customers[0].get("id")
                    self.log_result("Get Customer for Testing", True, f"Using customer ID: {test_user_id}")
                    
                    # Test GET user notifications
                    notif_response = requests.get(
                        f"{self.base_url}/api/v1/notifications/{test_user_id}",
                        headers={"Content-Type": "application/json"}
                    )
                    
                    if notif_response.status_code == 200:
                        data = notif_response.json()
                        notifications = data.get("notifications", [])
                        count = data.get("count", 0)
                        self.log_result("GET User Notifications", True, f"Found {count} notifications for user {test_user_id}")
                    else:
                        self.log_result("GET User Notifications", False, error=f"Status {notif_response.status_code}: {notif_response.text}")
                else:
                    self.log_result("Get Customer for Testing", False, error="No customers found in database")
            else:
                self.log_result("Get Customer for Testing", False, error=f"Status {customer_response.status_code}")
                
        except Exception as e:
            self.log_result("GET User Notifications", False, error=str(e))
        
        # 2. Test POST /api/v1/notifications - Create notification
        try:
            test_notification = {
                "user_id": "test-user-123",
                "type": "loyalty_credited",
                "title": "🎉 Test Notification",
                "message": "Merci pour ta commande, ta carte de fidélité a été crédité de 5.50 €!",
                "data": {
                    "order_id": "test-order-123",
                    "amount_credited": 5.50,
                    "total_points": 25.75
                }
            }
            
            create_response = requests.post(
                f"{self.base_url}/api/v1/notifications",
                json=test_notification,
                headers={"Content-Type": "application/json"}
            )
            
            if create_response.status_code == 200:
                data = create_response.json()
                if data.get("success"):
                    notification_id = data.get("notification_id")
                    self.log_result("POST Create Notification", True, f"Created notification ID: {notification_id}")
                    
                    # 3. Test PUT /api/v1/notifications/{notification_id}/read - Mark as read
                    try:
                        read_response = requests.put(
                            f"{self.base_url}/api/v1/notifications/{notification_id}/read",
                            headers={"Content-Type": "application/json"}
                        )
                        
                        if read_response.status_code == 200:
                            read_data = read_response.json()
                            if read_data.get("success"):
                                self.log_result("PUT Mark as Read", True, f"Marked notification {notification_id} as read")
                            else:
                                self.log_result("PUT Mark as Read", False, error="Success flag not returned")
                        else:
                            self.log_result("PUT Mark as Read", False, error=f"Status {read_response.status_code}: {read_response.text}")
                            
                    except Exception as e:
                        self.log_result("PUT Mark as Read", False, error=str(e))
                        
                else:
                    self.log_result("POST Create Notification", False, error="Success flag not returned")
            else:
                self.log_result("POST Create Notification", False, error=f"Status {create_response.status_code}: {create_response.text}")
                
        except Exception as e:
            self.log_result("POST Create Notification", False, error=str(e))
        
        # 4. Test POST /api/v1/notifications/{user_id}/mark-all-read - Mark all as read
        try:
            mark_all_response = requests.post(
                f"{self.base_url}/api/v1/notifications/test-user-123/mark-all-read",
                headers={"Content-Type": "application/json"}
            )
            
            if mark_all_response.status_code == 200:
                data = mark_all_response.json()
                if data.get("success"):
                    marked_count = data.get("marked_count", 0)
                    self.log_result("POST Mark All as Read", True, f"Marked {marked_count} notifications as read")
                else:
                    self.log_result("POST Mark All as Read", False, error="Success flag not returned")
            else:
                self.log_result("POST Mark All as Read", False, error=f"Status {mark_all_response.status_code}: {mark_all_response.text}")
                
        except Exception as e:
            self.log_result("POST Mark All as Read", False, error=str(e))
    
    def test_order_payment_flow_with_notification(self):
        """Test order payment flow and verify notification creation"""
        print("\n💳 TESTING ORDER PAYMENT FLOW WITH NOTIFICATION")
        
        try:
            # 1. Get orders to find one that's ready or in_preparation
            orders_response = requests.get(
                f"{self.base_url}/api/v1/admin/orders?limit=50",
                headers=self.get_headers()
            )
            
            if orders_response.status_code == 200:
                orders_data = orders_response.json()
                orders = orders_data.get("orders", [])
                
                # Find an order that's ready or in_preparation and not yet paid
                target_order = None
                for order in orders:
                    if order.get("status") in ["ready", "in_preparation"] and order.get("payment_status") != "paid":
                        target_order = order
                        break
                
                if target_order:
                    order_id = target_order.get("id")
                    customer_email = target_order.get("customer_email")
                    order_total = target_order.get("total", 0)
                    
                    self.log_result("Find Target Order", True, f"Found order {order_id} with status {target_order.get('status')}, total: {order_total}€")
                    
                    # 2. Get customer info to check loyalty_points field
                    if customer_email:
                        customer_response = requests.get(
                            f"{self.base_url}/api/v1/admin/customers",
                            headers=self.get_headers()
                        )
                        
                        if customer_response.status_code == 200:
                            customers = customer_response.json().get("customers", [])
                            customer = None
                            for c in customers:
                                if c.get("email") == customer_email:
                                    customer = c
                                    break
                            
                            if customer:
                                loyalty_points = customer.get("loyalty_points", 0)
                                customer_id = customer.get("id")
                                self.log_result("Customer Lookup", True, f"Customer {customer_email} has {loyalty_points}€ loyalty points")
                                
                                # 3. Mark order as paid to trigger notification
                                payment_data = {
                                    "payment_method": "card",
                                    "payment_status": "paid",
                                    "amount_received": order_total,
                                    "change_given": 0
                                }
                                
                                payment_response = requests.post(
                                    f"{self.base_url}/api/v1/admin/orders/{order_id}/payment",
                                    json=payment_data,
                                    headers=self.get_headers()
                                )
                                
                                if payment_response.status_code == 200:
                                    self.log_result("Mark Order as Paid", True, f"Order {order_id} marked as paid")
                                    
                                    # 4. Check if notification was created
                                    # Wait a moment for notification to be created
                                    time.sleep(2)
                                    
                                    # Get notifications for this customer
                                    notif_response = requests.get(
                                        f"{self.base_url}/api/v1/notifications/{customer_id}",
                                        headers={"Content-Type": "application/json"}
                                    )
                                    
                                    if notif_response.status_code == 200:
                                        notif_data = notif_response.json()
                                        notifications = notif_data.get("notifications", [])
                                        
                                        # Look for loyalty_credited notification
                                        loyalty_notification = None
                                        for notif in notifications:
                                            if notif.get("type") == "loyalty_credited" and order_id in notif.get("message", ""):
                                                loyalty_notification = notif
                                                break
                                        
                                        if loyalty_notification:
                                            message = loyalty_notification.get("message", "")
                                            # Check if message is in French
                                            if "Merci pour ta commande" in message and "crédité" in message:
                                                self.log_result("Loyalty Notification Created", True, f"Found French loyalty notification: {message}")
                                            else:
                                                self.log_result("Loyalty Notification Created", False, error=f"Notification message not in expected French format: {message}")
                                        else:
                                            self.log_result("Loyalty Notification Created", False, error="No loyalty_credited notification found for this order")
                                    else:
                                        self.log_result("Check Notification Creation", False, error=f"Status {notif_response.status_code}: {notif_response.text}")
                                        
                                else:
                                    self.log_result("Mark Order as Paid", False, error=f"Status {payment_response.status_code}: {payment_response.text}")
                            else:
                                self.log_result("Customer Lookup", False, error=f"Customer with email {customer_email} not found")
                        else:
                            self.log_result("Customer Lookup", False, error=f"Status {customer_response.status_code}")
                    else:
                        self.log_result("Customer Email Check", False, error="Target order has no customer_email")
                        
                else:
                    self.log_result("Find Target Order", False, error="No suitable order found (need ready/in_preparation status and unpaid)")
            else:
                self.log_result("Get Orders", False, error=f"Status {orders_response.status_code}: {orders_response.text}")
                
        except Exception as e:
            self.log_result("Order Payment Flow", False, error=str(e))
    
    def test_customer_lookup(self):
        """Test customer lookup and verify loyalty_points field"""
        print("\n👥 TESTING CUSTOMER LOOKUP")
        
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/admin/customers?limit=10",
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                customers = data.get("customers", [])
                
                if customers:
                    self.log_result("Get Customers", True, f"Retrieved {len(customers)} customers")
                    
                    # Check first customer for loyalty_points field
                    first_customer = customers[0]
                    customer_id = first_customer.get("id")
                    customer_email = first_customer.get("email")
                    loyalty_points = first_customer.get("loyalty_points")
                    
                    if loyalty_points is not None:
                        self.log_result("Loyalty Points Field", True, f"Customer {customer_email} has loyalty_points: {loyalty_points}€")
                    else:
                        self.log_result("Loyalty Points Field", False, error="loyalty_points field not found in customer data")
                        
                    # Show customer structure
                    customer_fields = list(first_customer.keys())
                    self.log_result("Customer Fields", True, f"Available fields: {', '.join(customer_fields)}")
                    
                else:
                    self.log_result("Get Customers", False, error="No customers found in database")
            else:
                self.log_result("Get Customers", False, error=f"Status {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Customer Lookup", False, error=str(e))
    
    def run_all_tests(self):
        """Run all notification system tests"""
        print("🚀 STARTING FAMILY'S RESTAURANT NOTIFICATION SYSTEM TESTING")
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return
        
        # Run all test scenarios
        self.test_notification_crud_endpoints()
        self.test_order_payment_flow_with_notification()
        self.test_customer_lookup()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
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
    tester = NotificationSystemTester()
    passed, failed = tester.run_all_tests()
    
    # Exit with appropriate code
    exit(0 if failed == 0 else 1)