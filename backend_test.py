#!/usr/bin/env python3
"""
Backend API Testing for Family's Back Office AI Assistant
Tests CORS fix and AI integration endpoints
"""

import asyncio
import aiohttp
import json
import sys
from typing import Dict, Optional

# Backend URL from environment
BACKEND_URL = "https://resto-backoffice-1.preview.emergentagent.com"

class BackendTester:
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
    
    async def test_ai_chat(self) -> bool:
        """Test AI chat endpoint."""
        test_name = "AI Chat"
        
        if not self.auth_token:
            self.log_result(test_name, False, "No auth token available")
            return False
        
        try:
            chat_data = {
                "question": "Bonjour, comment ça va?"
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/ai/chat",
                json=chat_data,
                headers=headers
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if "response" in data and data["response"]:
                        self.log_result(test_name, True, f"AI responded: {data['response'][:100]}...")
                        return True
                    else:
                        self.log_result(test_name, False, "No AI response in data", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_marketing_generation(self) -> bool:
        """Test marketing generation endpoint."""
        test_name = "Marketing Generation"
        
        if not self.auth_token:
            self.log_result(test_name, False, "No auth token available")
            return False
        
        try:
            marketing_data = {
                "type": "social_post"
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/ai/generate-marketing",
                json=marketing_data,
                headers=headers
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if "generated_text" in data and data["generated_text"]:
                        self.log_result(test_name, True, f"Marketing text generated: {data['generated_text'][:100]}...")
                        return True
                    else:
                        self.log_result(test_name, False, "No generated text in response", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_sales_analysis(self) -> bool:
        """Test sales analysis endpoint."""
        test_name = "Sales Analysis"
        
        if not self.auth_token:
            self.log_result(test_name, False, "No auth token available")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/ai/analyze-sales",
                headers=headers
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if "ai_analysis" in data or "message" in data:
                        if "message" in data:
                            self.log_result(test_name, True, f"Analysis result: {data['message']}")
                        else:
                            self.log_result(test_name, True, f"Sales analysis completed with AI insights")
                        return True
                    else:
                        self.log_result(test_name, False, "No analysis data in response", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_promo_suggestion(self) -> bool:
        """Test promo suggestion endpoint."""
        test_name = "Promo Suggestion"
        
        if not self.auth_token:
            self.log_result(test_name, False, "No auth token available")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/ai/suggest-promo",
                headers=headers
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if "suggestion" in data and data["suggestion"]:
                        self.log_result(test_name, True, f"Promo suggestion generated successfully")
                        return True
                    else:
                        self.log_result(test_name, False, "No suggestion in response", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_cors_headers(self) -> bool:
        """Test CORS headers are present."""
        test_name = "CORS Headers"
        
        try:
            # Test preflight request
            headers = {
                "Origin": "https://resto-backoffice-1.preview.emergentagent.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "authorization,content-type"
            }
            
            async with self.session.options(
                f"{self.base_url}/api/v1/admin/auth/login",
                headers=headers
            ) as response:
                
                cors_headers = {
                    "access-control-allow-origin": response.headers.get("access-control-allow-origin"),
                    "access-control-allow-methods": response.headers.get("access-control-allow-methods"),
                    "access-control-allow-headers": response.headers.get("access-control-allow-headers"),
                    "access-control-allow-credentials": response.headers.get("access-control-allow-credentials")
                }
                
                if any(cors_headers.values()):
                    self.log_result(test_name, True, f"CORS headers present: {cors_headers}")
                    return True
                else:
                    self.log_result(test_name, False, f"No CORS headers found. Response headers: {dict(response.headers)}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False
    
    async def test_get_orders(self) -> tuple[bool, Optional[str]]:
        """Test getting orders and return first available order ID."""
        test_name = "Get Orders"
        
        try:
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/orders",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if "orders" in data and len(data["orders"]) > 0:
                        order_id = data["orders"][0].get("id")
                        self.log_result(test_name, True, f"Retrieved {len(data['orders'])} orders, first order ID: {order_id}")
                        return True, order_id
                    else:
                        self.log_result(test_name, False, "No orders found in response", data)
                        return False, None
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False, None
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False, None

    async def test_payment_recording(self, order_id: str) -> bool:
        """Test payment recording with amount_received and change_given fields."""
        test_name = "Payment Recording with Amount Details"
        
        if not order_id:
            self.log_result(test_name, False, "No order ID available")
            return False
        
        try:
            # Test cash payment with change - including amount_received and change_given
            payment_data = {
                "payment_method": "cash",
                "payment_status": "paid",
                "amount_received": 25.50,
                "change_given": 5.50
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/orders/{order_id}/payment",
                json=payment_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if data.get("success"):
                        # Verify the payment details were saved by getting the order
                        async with self.session.get(
                            f"{self.base_url}/api/v1/admin/orders",
                            headers={"Content-Type": "application/json"}
                        ) as get_response:
                            
                            if get_response.status == 200:
                                orders_data = await get_response.json()
                                updated_order = None
                                for order in orders_data.get("orders", []):
                                    if order.get("id") == order_id:
                                        updated_order = order
                                        break
                                
                                if updated_order:
                                    payment_method = updated_order.get("payment_method")
                                    payment_status = updated_order.get("payment_status")
                                    amount_received = updated_order.get("amount_received")
                                    change_given = updated_order.get("change_given")
                                    
                                    if (payment_method == "cash" and payment_status == "paid"):
                                        if amount_received is not None and change_given is not None:
                                            self.log_result(test_name, True, f"Payment recorded with all details: method={payment_method}, status={payment_status}, amount_received={amount_received}, change_given={change_given}")
                                            return True
                                        else:
                                            self.log_result(test_name, False, f"Payment recorded but amount_received and change_given fields missing. Only method={payment_method}, status={payment_status} saved")
                                            return False
                                    else:
                                        self.log_result(test_name, False, f"Payment details not saved correctly: method={payment_method}, status={payment_status}")
                                        return False
                                else:
                                    self.log_result(test_name, False, f"Could not find updated order {order_id}")
                                    return False
                            else:
                                self.log_result(test_name, False, f"Could not verify payment details: HTTP {get_response.status}")
                                return False
                    else:
                        self.log_result(test_name, False, "Payment recording failed", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_payment_methods(self, order_id: str) -> bool:
        """Test different payment methods."""
        test_name = "Payment Methods"
        
        if not order_id:
            self.log_result(test_name, False, "No order ID available")
            return False
        
        payment_methods = ["card", "mobile", "online"]
        success_count = 0
        
        for method in payment_methods:
            try:
                payment_data = {
                    "payment_method": method,
                    "payment_status": "paid"
                }
                
                async with self.session.post(
                    f"{self.base_url}/api/v1/admin/orders/{order_id}/payment",
                    json=payment_data,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        if data.get("success"):
                            success_count += 1
                            print(f"   ✅ {method} payment method works")
                        else:
                            print(f"   ❌ {method} payment method failed: {data}")
                    else:
                        error_data = await response.text()
                        print(f"   ❌ {method} payment method failed: HTTP {response.status}: {error_data}")
                        
            except Exception as e:
                print(f"   ❌ {method} payment method exception: {str(e)}")
        
        if success_count == len(payment_methods):
            self.log_result(test_name, True, f"All {len(payment_methods)} payment methods work correctly")
            return True
        else:
            self.log_result(test_name, False, f"Only {success_count}/{len(payment_methods)} payment methods work")
            return False

    async def test_order_cancellation(self, order_id: str) -> bool:
        """Test order cancellation with reason."""
        test_name = "Order Cancellation with Reason"
        
        if not order_id:
            self.log_result(test_name, False, "No order ID available")
            return False
        
        try:
            # Test cancellation with reason
            cancellation_data = {
                "status": "canceled",
                "cancellation_reason": "❌ Client a annulé"
            }
            
            async with self.session.patch(
                f"{self.base_url}/api/v1/admin/orders/{order_id}/status",
                json=cancellation_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if data.get("success"):
                        # Verify the cancellation was saved
                        async with self.session.get(
                            f"{self.base_url}/api/v1/admin/orders",
                            headers={"Content-Type": "application/json"}
                        ) as get_response:
                            
                            if get_response.status == 200:
                                orders_data = await get_response.json()
                                cancelled_order = None
                                for order in orders_data.get("orders", []):
                                    if order.get("id") == order_id:
                                        cancelled_order = order
                                        break
                                
                                if cancelled_order:
                                    if (cancelled_order.get("status") == "canceled" and 
                                        cancelled_order.get("cancellation_reason") == "❌ Client a annulé"):
                                        self.log_result(test_name, True, f"Order {order_id} cancelled with reason saved correctly")
                                        return True
                                    else:
                                        self.log_result(test_name, False, f"Cancellation data not saved correctly: status={cancelled_order.get('status')}, reason={cancelled_order.get('cancellation_reason')}")
                                        return False
                                else:
                                    self.log_result(test_name, False, f"Could not find cancelled order {order_id}")
                                    return False
                            else:
                                self.log_result(test_name, False, f"Could not verify cancellation: HTTP {get_response.status}")
                                return False
                    else:
                        self.log_result(test_name, False, "Cancellation failed", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_cancellation_without_reason(self, order_id: str) -> bool:
        """Test order cancellation without reason (should still work)."""
        test_name = "Cancellation Without Reason"
        
        if not order_id:
            self.log_result(test_name, False, "No order ID available")
            return False
        
        try:
            # Test cancellation without reason
            cancellation_data = {
                "status": "canceled"
            }
            
            async with self.session.patch(
                f"{self.base_url}/api/v1/admin/orders/{order_id}/status",
                json=cancellation_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if data.get("success"):
                        self.log_result(test_name, True, f"Order {order_id} cancelled without reason successfully")
                        return True
                    else:
                        self.log_result(test_name, False, "Cancellation without reason failed", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_exact_amount_payment(self, order_id: str) -> bool:
        """Test payment with exact amount (no change)."""
        test_name = "Exact Amount Payment"
        
        if not order_id:
            self.log_result(test_name, False, "No order ID available")
            return False
        
        try:
            # Test exact payment
            payment_data = {
                "payment_method": "cash",
                "payment_status": "paid",
                "amount_received": 20.00,
                "change_given": 0.00
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/orders/{order_id}/payment",
                json=payment_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if data.get("success"):
                        self.log_result(test_name, True, f"Exact amount payment recorded successfully for order {order_id}")
                        return True
                    else:
                        self.log_result(test_name, False, "Exact amount payment failed", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_paid_order_cancellation(self) -> bool:
        """Test that cancelled orders retain payment information."""
        test_name = "Paid Order Cancellation Retention"
        
        try:
            # Get a fresh order to test with
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/orders",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    self.log_result(test_name, False, "Could not get orders for test")
                    return False
                
                data = await response.json()
                if not data.get("orders"):
                    self.log_result(test_name, False, "No orders available for test")
                    return False
                
                # Find an order that's not already cancelled
                test_order_id = None
                for order in data["orders"]:
                    if order.get("status") != "canceled":
                        test_order_id = order.get("id")
                        break
                
                if not test_order_id:
                    self.log_result(test_name, False, "No non-cancelled orders available for test")
                    return False
            
            # First, record payment for this order
            payment_data = {
                "payment_method": "card",
                "payment_status": "paid",
                "amount_received": 30.00,
                "change_given": 0.00
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/orders/{test_order_id}/payment",
                json=payment_data,
                headers={"Content-Type": "application/json"}
            ) as payment_response:
                
                if payment_response.status != 200:
                    self.log_result(test_name, False, "Could not record payment for test")
                    return False
            
            # Now cancel the order
            cancellation_data = {
                "status": "canceled",
                "cancellation_reason": "Test cancellation after payment"
            }
            
            async with self.session.patch(
                f"{self.base_url}/api/v1/admin/orders/{test_order_id}/status",
                json=cancellation_data,
                headers={"Content-Type": "application/json"}
            ) as cancel_response:
                
                if cancel_response.status != 200:
                    self.log_result(test_name, False, "Could not cancel order for test")
                    return False
            
            # Verify the cancelled order still has payment information
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/orders",
                headers={"Content-Type": "application/json"}
            ) as verify_response:
                
                if verify_response.status == 200:
                    verify_data = await verify_response.json()
                    cancelled_order = None
                    for order in verify_data.get("orders", []):
                        if order.get("id") == test_order_id:
                            cancelled_order = order
                            break
                    
                    if cancelled_order:
                        if (cancelled_order.get("status") == "canceled" and
                            cancelled_order.get("payment_method") == "card" and
                            cancelled_order.get("payment_status") == "paid" and
                            cancelled_order.get("amount_received") == 30.0 and
                            cancelled_order.get("cancellation_reason") == "Test cancellation after payment"):
                            self.log_result(test_name, True, f"Cancelled order {test_order_id} retained all payment information correctly")
                            return True
                        else:
                            self.log_result(test_name, False, f"Cancelled order missing payment info: status={cancelled_order.get('status')}, payment_method={cancelled_order.get('payment_method')}, payment_status={cancelled_order.get('payment_status')}")
                            return False
                    else:
                        self.log_result(test_name, False, f"Could not find cancelled order {test_order_id}")
                        return False
                else:
                    self.log_result(test_name, False, f"Could not verify cancelled order: HTTP {verify_response.status}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def run_all_tests(self):
        """Run all backend tests."""
        print(f"🚀 Starting Backend API Tests for: {self.base_url}")
        print("=" * 60)
        
        # First get orders to have order IDs for testing
        orders_success, first_order_id = await self.test_get_orders()
        
        if not orders_success or not first_order_id:
            print("❌ Cannot proceed with payment/cancellation tests - no orders available")
            return False
        
        # Test sequence for payment and cancellation features
        tests = [
            ("Payment Recording", lambda: self.test_payment_recording(first_order_id)),
            ("Payment Methods", lambda: self.test_payment_methods(first_order_id)),
            ("Order Cancellation with Reason", lambda: self.test_order_cancellation(first_order_id)),
            ("Cancellation Without Reason", lambda: self.test_cancellation_without_reason(first_order_id)),
            ("Exact Amount Payment", lambda: self.test_exact_amount_payment(first_order_id)),
        ]
        
        passed = 1  # Count the successful get_orders test
        total = len(tests) + 1  # +1 for get_orders test
        
        for test_name, test_func in tests:
            try:
                result = await test_func()
                if result:
                    passed += 1
            except Exception as e:
                self.log_result(test_name, False, f"Test execution failed: {str(e)}")
        
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests PASSED!")
            return True
        else:
            print(f"⚠️  {total - passed} tests FAILED")
            return False

async def main():
    """Main test runner."""
    async with BackendTester() as tester:
        success = await tester.run_all_tests()
        return 0 if success else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)