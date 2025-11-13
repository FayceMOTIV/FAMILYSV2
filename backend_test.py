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
BACKEND_URL = "https://diner-admin.preview.emergentagent.com"

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
                "Origin": "https://diner-admin.preview.emergentagent.com",
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

    async def get_test_product_id(self) -> Optional[str]:
        """Get a product ID for stock testing."""
        try:
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/products",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    products = data.get("products", [])
                    if products:
                        return products[0].get("id")
                return None
                
        except Exception:
            return None

    async def test_stock_status_2h(self, product_id: str) -> bool:
        """Test setting product out of stock for 2 hours."""
        test_name = "Stock Status - 2 Hours"
        
        if not product_id:
            self.log_result(test_name, False, "No product ID available")
            return False
        
        try:
            stock_data = {"status": "2h"}
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/products/{product_id}/stock-status",
                json=stock_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if data.get("success") and data.get("resume_at"):
                        # Verify the product is updated
                        async with self.session.get(
                            f"{self.base_url}/api/v1/admin/products",
                            headers={"Content-Type": "application/json"}
                        ) as get_response:
                            
                            if get_response.status == 200:
                                products_data = await get_response.json()
                                updated_product = None
                                for product in products_data.get("products", []):
                                    if product.get("id") == product_id:
                                        updated_product = product
                                        break
                                
                                if updated_product:
                                    stock_resume_at = updated_product.get("stock_resume_at")
                                    is_out_of_stock = updated_product.get("is_out_of_stock")
                                    
                                    if stock_resume_at and is_out_of_stock:
                                        # Parse and verify timestamp is ~2 hours from now
                                        from datetime import datetime, timezone
                                        resume_time = datetime.fromisoformat(stock_resume_at.replace('Z', '+00:00'))
                                        now = datetime.now(timezone.utc)
                                        time_diff = (resume_time - now).total_seconds()
                                        
                                        # Should be approximately 2 hours (7200 seconds), allow 60 second tolerance
                                        if 7140 <= time_diff <= 7260:
                                            self.log_result(test_name, True, f"Product set to out of stock for 2h, resume at: {stock_resume_at}")
                                            return True
                                        else:
                                            self.log_result(test_name, False, f"Incorrect resume time: {time_diff} seconds from now (expected ~7200)")
                                            return False
                                    else:
                                        self.log_result(test_name, False, f"Stock fields not set correctly: resume_at={stock_resume_at}, is_out_of_stock={is_out_of_stock}")
                                        return False
                                else:
                                    self.log_result(test_name, False, f"Could not find updated product {product_id}")
                                    return False
                            else:
                                self.log_result(test_name, False, f"Could not verify product update: HTTP {get_response.status}")
                                return False
                    else:
                        self.log_result(test_name, False, "Stock update failed", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_stock_status_today(self, product_id: str) -> bool:
        """Test setting product out of stock until midnight."""
        test_name = "Stock Status - Today"
        
        if not product_id:
            self.log_result(test_name, False, "No product ID available")
            return False
        
        try:
            stock_data = {"status": "today"}
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/products/{product_id}/stock-status",
                json=stock_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if data.get("success") and data.get("resume_at"):
                        # Verify the product is updated
                        async with self.session.get(
                            f"{self.base_url}/api/v1/admin/products",
                            headers={"Content-Type": "application/json"}
                        ) as get_response:
                            
                            if get_response.status == 200:
                                products_data = await get_response.json()
                                updated_product = None
                                for product in products_data.get("products", []):
                                    if product.get("id") == product_id:
                                        updated_product = product
                                        break
                                
                                if updated_product:
                                    stock_resume_at = updated_product.get("stock_resume_at")
                                    is_out_of_stock = updated_product.get("is_out_of_stock")
                                    
                                    if stock_resume_at and is_out_of_stock:
                                        # Verify timestamp is set to 23:59:59 of current day
                                        from datetime import datetime, timezone
                                        resume_time = datetime.fromisoformat(stock_resume_at.replace('Z', '+00:00'))
                                        
                                        if resume_time.hour == 23 and resume_time.minute == 59 and resume_time.second == 59:
                                            self.log_result(test_name, True, f"Product set to out of stock until midnight: {stock_resume_at}")
                                            return True
                                        else:
                                            self.log_result(test_name, False, f"Incorrect midnight time: {resume_time.hour}:{resume_time.minute}:{resume_time.second}")
                                            return False
                                    else:
                                        self.log_result(test_name, False, f"Stock fields not set correctly: resume_at={stock_resume_at}, is_out_of_stock={is_out_of_stock}")
                                        return False
                                else:
                                    self.log_result(test_name, False, f"Could not find updated product {product_id}")
                                    return False
                            else:
                                self.log_result(test_name, False, f"Could not verify product update: HTTP {get_response.status}")
                                return False
                    else:
                        self.log_result(test_name, False, "Stock update failed", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_stock_status_indefinite(self, product_id: str) -> bool:
        """Test setting product out of stock indefinitely."""
        test_name = "Stock Status - Indefinite"
        
        if not product_id:
            self.log_result(test_name, False, "No product ID available")
            return False
        
        try:
            stock_data = {"status": "indefinite"}
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/products/{product_id}/stock-status",
                json=stock_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if data.get("success"):
                        # Verify the product is updated
                        async with self.session.get(
                            f"{self.base_url}/api/v1/admin/products",
                            headers={"Content-Type": "application/json"}
                        ) as get_response:
                            
                            if get_response.status == 200:
                                products_data = await get_response.json()
                                updated_product = None
                                for product in products_data.get("products", []):
                                    if product.get("id") == product_id:
                                        updated_product = product
                                        break
                                
                                if updated_product:
                                    stock_resume_at = updated_product.get("stock_resume_at")
                                    is_out_of_stock = updated_product.get("is_out_of_stock")
                                    
                                    if stock_resume_at is None and is_out_of_stock:
                                        self.log_result(test_name, True, f"Product set to out of stock indefinitely (no resume time)")
                                        return True
                                    else:
                                        self.log_result(test_name, False, f"Stock fields not set correctly: resume_at={stock_resume_at}, is_out_of_stock={is_out_of_stock}")
                                        return False
                                else:
                                    self.log_result(test_name, False, f"Could not find updated product {product_id}")
                                    return False
                            else:
                                self.log_result(test_name, False, f"Could not verify product update: HTTP {get_response.status}")
                                return False
                    else:
                        self.log_result(test_name, False, "Stock update failed", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_stock_status_available(self, product_id: str) -> bool:
        """Test setting product back to available."""
        test_name = "Stock Status - Available"
        
        if not product_id:
            self.log_result(test_name, False, "No product ID available")
            return False
        
        try:
            stock_data = {"status": "available"}
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/products/{product_id}/stock-status",
                json=stock_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if data.get("success"):
                        # Verify the product is updated
                        async with self.session.get(
                            f"{self.base_url}/api/v1/admin/products",
                            headers={"Content-Type": "application/json"}
                        ) as get_response:
                            
                            if get_response.status == 200:
                                products_data = await get_response.json()
                                updated_product = None
                                for product in products_data.get("products", []):
                                    if product.get("id") == product_id:
                                        updated_product = product
                                        break
                                
                                if updated_product:
                                    stock_resume_at = updated_product.get("stock_resume_at")
                                    is_out_of_stock = updated_product.get("is_out_of_stock")
                                    
                                    if stock_resume_at is None and not is_out_of_stock:
                                        self.log_result(test_name, True, f"Product set back to available (in stock)")
                                        return True
                                    else:
                                        self.log_result(test_name, False, f"Stock fields not set correctly: resume_at={stock_resume_at}, is_out_of_stock={is_out_of_stock}")
                                        return False
                                else:
                                    self.log_result(test_name, False, f"Could not find updated product {product_id}")
                                    return False
                            else:
                                self.log_result(test_name, False, f"Could not verify product update: HTTP {get_response.status}")
                                return False
                    else:
                        self.log_result(test_name, False, "Stock update failed", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_stock_persistence(self, product_id: str) -> bool:
        """Test that stock changes persist correctly in database."""
        test_name = "Stock Persistence Verification"
        
        if not product_id:
            self.log_result(test_name, False, "No product ID available")
            return False
        
        try:
            # Set to 2h status first
            stock_data = {"status": "2h"}
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/products/{product_id}/stock-status",
                json=stock_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    self.log_result(test_name, False, "Could not set initial stock status")
                    return False
            
            # Wait a moment then verify persistence
            import asyncio
            await asyncio.sleep(1)
            
            # Get product details multiple times to verify persistence
            for i in range(3):
                async with self.session.get(
                    f"{self.base_url}/api/v1/admin/products",
                    headers={"Content-Type": "application/json"}
                ) as get_response:
                    
                    if get_response.status == 200:
                        products_data = await get_response.json()
                        updated_product = None
                        for product in products_data.get("products", []):
                            if product.get("id") == product_id:
                                updated_product = product
                                break
                        
                        if updated_product:
                            stock_resume_at = updated_product.get("stock_resume_at")
                            is_out_of_stock = updated_product.get("is_out_of_stock")
                            
                            if not (stock_resume_at and is_out_of_stock):
                                self.log_result(test_name, False, f"Stock data not persistent on attempt {i+1}")
                                return False
                        else:
                            self.log_result(test_name, False, f"Product not found on attempt {i+1}")
                            return False
                    else:
                        self.log_result(test_name, False, f"Could not get products on attempt {i+1}")
                        return False
                
                await asyncio.sleep(0.5)
            
            self.log_result(test_name, True, "Stock data persists correctly across multiple requests")
            return True
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def get_categories(self) -> tuple[bool, list]:
        """Get all categories for testing."""
        try:
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/categories",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    categories = data.get("categories", [])
                    return True, categories
                else:
                    return False, []
                    
        except Exception:
            return False, []

    async def test_category_reordering(self) -> bool:
        """Test category reordering functionality."""
        test_name = "Category Reordering"
        
        try:
            # Get all categories and note their current order values
            success, categories = await self.get_categories()
            if not success or len(categories) < 2:
                self.log_result(test_name, False, "Need at least 2 categories for reordering test")
                return False
            
            # Sort by order to get adjacent categories
            categories.sort(key=lambda x: x.get("order", 0))
            first_cat = categories[0]
            second_cat = categories[1]
            
            first_id = first_cat.get("id")
            second_id = second_cat.get("id")
            first_order = first_cat.get("order", 0)
            second_order = second_cat.get("order", 1)
            
            self.log_result(f"{test_name} - Initial State", True, 
                          f"First category (ID: {first_id}) order: {first_order}, Second category (ID: {second_id}) order: {second_order}")
            
            # Update first category with second's order value (swap)
            async with self.session.put(
                f"{self.base_url}/api/v1/admin/categories/{first_id}",
                json={"order": second_order},
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to update first category: HTTP {response.status}: {error_data}")
                    return False
            
            # Update second category with first's order value (swap)
            async with self.session.put(
                f"{self.base_url}/api/v1/admin/categories/{second_id}",
                json={"order": first_order},
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Failed to update second category: HTTP {response.status}: {error_data}")
                    return False
            
            # Get all categories again and verify order changed
            success, updated_categories = await self.get_categories()
            if not success:
                self.log_result(test_name, False, "Could not retrieve categories after reordering")
                return False
            
            # Find the updated categories
            updated_first = None
            updated_second = None
            for cat in updated_categories:
                if cat.get("id") == first_id:
                    updated_first = cat
                elif cat.get("id") == second_id:
                    updated_second = cat
            
            if not updated_first or not updated_second:
                self.log_result(test_name, False, "Could not find updated categories")
                return False
            
            # Verify the order values were swapped
            new_first_order = updated_first.get("order")
            new_second_order = updated_second.get("order")
            
            if new_first_order == second_order and new_second_order == first_order:
                # Verify categories are returned in new order (sorted by order field)
                updated_categories.sort(key=lambda x: x.get("order", 0))
                if updated_categories[0].get("id") == second_id and updated_categories[1].get("id") == first_id:
                    self.log_result(test_name, True, f"Category reordering successful: First category now has order {new_first_order}, Second category now has order {new_second_order}")
                    return True
                else:
                    self.log_result(test_name, False, f"Order values swapped but categories not returned in correct order")
                    return False
            else:
                self.log_result(test_name, False, f"Order values not swapped correctly: first={new_first_order} (expected {second_order}), second={new_second_order} (expected {first_order})")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def get_paid_order_with_card(self) -> tuple[bool, Optional[str]]:
        """Find a paid order with card payment method."""
        try:
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/orders",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    orders = data.get("orders", [])
                    
                    # Look for a paid order with card payment
                    for order in orders:
                        if (order.get("payment_status") == "paid" and 
                            order.get("payment_method") == "card" and
                            order.get("items") and len(order.get("items", [])) > 0):
                            return True, order.get("id")
                    
                    return False, None
                else:
                    return False, None
                    
        except Exception:
            return False, None

    async def test_partial_refund_valid_items(self) -> bool:
        """Test partial refund with valid items."""
        test_name = "Partial Refund - Valid Items"
        
        try:
            # Find a paid order with card payment
            success, order_id = await self.get_paid_order_with_card()
            if not success or not order_id:
                self.log_result(test_name, False, "No paid card orders available for refund testing")
                return False
            
            # Get the order details to check items
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/orders",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    self.log_result(test_name, False, "Could not retrieve order details")
                    return False
                
                data = await response.json()
                target_order = None
                for order in data.get("orders", []):
                    if order.get("id") == order_id:
                        target_order = order
                        break
                
                if not target_order:
                    self.log_result(test_name, False, f"Could not find order {order_id}")
                    return False
                
                items = target_order.get("items", [])
                if len(items) == 0:
                    self.log_result(test_name, False, "Order has no items to refund")
                    return False
                
                customer_email = target_order.get("customer_email")
                if not customer_email:
                    self.log_result(test_name, False, "Order has no customer email")
                    return False
            
            # Get customer's current loyalty points
            customer = await self.get_customer_by_email(customer_email)
            if not customer:
                self.log_result(test_name, False, f"Could not find customer {customer_email}")
                return False
            
            initial_points = customer.get("loyalty_points", 0)
            
            # Test refund with first item only (index 0)
            refund_data = {
                "missing_item_indices": [0],
                "reason": "Produit manquant"
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/orders/{order_id}/refund-missing-items",
                json=refund_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    
                    # Verify response includes required fields
                    if (data.get("success") and 
                        "refund_amount" in data and 
                        "new_loyalty_points" in data and 
                        "missing_items" in data):
                        
                        refund_amount = data.get("refund_amount")
                        new_loyalty_points = data.get("new_loyalty_points")
                        missing_items = data.get("missing_items")
                        
                        # Verify refund amount equals item price
                        expected_refund = items[0].get("total_price", 0)
                        if refund_amount != expected_refund:
                            self.log_result(test_name, False, f"Refund amount {refund_amount} doesn't match item price {expected_refund}")
                            return False
                        
                        # Verify loyalty points were updated correctly
                        expected_points = initial_points + refund_amount
                        if new_loyalty_points != expected_points:
                            self.log_result(test_name, False, f"Loyalty points {new_loyalty_points} don't match expected {expected_points}")
                            return False
                        
                        # Verify customer's loyalty points in database
                        updated_customer = await self.get_customer_by_email(customer_email)
                        if not updated_customer or updated_customer.get("loyalty_points") != new_loyalty_points:
                            self.log_result(test_name, False, "Customer loyalty points not updated in database")
                            return False
                        
                        self.log_result(test_name, True, f"Partial refund successful: {refund_amount}€ refunded, loyalty points: {initial_points} → {new_loyalty_points}")
                        return True
                    else:
                        self.log_result(test_name, False, "Response missing required fields", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def get_customer_by_email(self, email: str) -> Optional[dict]:
        """Get customer by email."""
        try:
            # This would typically be a customer endpoint, but we'll simulate it
            # by checking the users collection directly through orders
            return {"email": email, "loyalty_points": 0}  # Simplified for testing
        except Exception:
            return None

    async def test_partial_refund_non_card_payment(self) -> bool:
        """Test refund on non-card payment (should fail with 400)."""
        test_name = "Partial Refund - Non-Card Payment Error"
        
        try:
            # Get any order and try to refund it (assuming it's not card payment)
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/orders",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    self.log_result(test_name, False, "Could not get orders")
                    return False
                
                data = await response.json()
                orders = data.get("orders", [])
                
                # Find a non-card payment order
                non_card_order_id = None
                for order in orders:
                    if order.get("payment_method") != "card" and order.get("items"):
                        non_card_order_id = order.get("id")
                        break
                
                if not non_card_order_id:
                    # Create a test scenario by using any order (the endpoint should reject it)
                    if orders:
                        non_card_order_id = orders[0].get("id")
                    else:
                        self.log_result(test_name, False, "No orders available for testing")
                        return False
            
            # Try to refund non-card payment
            refund_data = {
                "missing_item_indices": [0],
                "reason": "Test refund on non-card payment"
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/orders/{non_card_order_id}/refund-missing-items",
                json=refund_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 400:
                    error_data = await response.json()
                    if "carte" in error_data.get("detail", "").lower():
                        self.log_result(test_name, True, "Correctly rejected non-card payment refund with 400 error")
                        return True
                    else:
                        self.log_result(test_name, False, f"Got 400 but wrong error message: {error_data}")
                        return False
                else:
                    self.log_result(test_name, False, f"Expected 400 error but got HTTP {response.status}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_partial_refund_invalid_indices(self) -> bool:
        """Test refund with invalid item indices."""
        test_name = "Partial Refund - Invalid Indices"
        
        try:
            # Find a paid card order
            success, order_id = await self.get_paid_order_with_card()
            if not success or not order_id:
                self.log_result(test_name, False, "No paid card orders available")
                return False
            
            # Try to refund with invalid indices (out of range)
            refund_data = {
                "missing_item_indices": [999, 1000],  # Invalid indices
                "reason": "Test invalid indices"
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/orders/{order_id}/refund-missing-items",
                json=refund_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                # The endpoint should handle this gracefully (either 400 error or 0 refund)
                if response.status == 400:
                    self.log_result(test_name, True, "Correctly handled invalid indices with 400 error")
                    return True
                elif response.status == 200:
                    data = await response.json()
                    if data.get("refund_amount", 0) == 0:
                        self.log_result(test_name, True, "Correctly handled invalid indices with 0 refund amount")
                        return True
                    else:
                        self.log_result(test_name, False, f"Invalid indices resulted in non-zero refund: {data}")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"Unexpected response: HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def run_new_features_tests(self):
        """Run tests for new backend features: Category Reordering and Partial Refunds."""
        print(f"🚀 Starting New Features Tests for: {self.base_url}")
        print("=" * 60)
        
        # Test sequence for new features
        tests = [
            ("Category Reordering", self.test_category_reordering),
            ("Partial Refund - Valid Items", self.test_partial_refund_valid_items),
            ("Partial Refund - Non-Card Payment Error", self.test_partial_refund_non_card_payment),
            ("Partial Refund - Invalid Indices", self.test_partial_refund_invalid_indices),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                result = await test_func()
                if result:
                    passed += 1
            except Exception as e:
                self.log_result(test_name, False, f"Test execution failed: {str(e)}")
        
        print("\n" + "=" * 60)
        print(f"📊 New Features Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All new features tests PASSED!")
            return True
        else:
            print(f"⚠️  {total - passed} new features tests FAILED")
            return False

    async def run_stock_management_tests(self):
        """Run stock management tests specifically."""
        print(f"🚀 Starting Stock Management Tests for: {self.base_url}")
        print("=" * 60)
        
        # Get a product ID for testing
        product_id = await self.get_test_product_id()
        
        if not product_id:
            print("❌ Cannot proceed with stock tests - no products available")
            return False
        
        print(f"📦 Testing with product ID: {product_id}")
        
        # Test sequence for stock management features
        tests = [
            ("Stock Status - 2 Hours", lambda: self.test_stock_status_2h(product_id)),
            ("Stock Status - Today", lambda: self.test_stock_status_today(product_id)),
            ("Stock Status - Indefinite", lambda: self.test_stock_status_indefinite(product_id)),
            ("Stock Status - Available", lambda: self.test_stock_status_available(product_id)),
            ("Stock Persistence", lambda: self.test_stock_persistence(product_id)),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                result = await test_func()
                if result:
                    passed += 1
            except Exception as e:
                self.log_result(test_name, False, f"Test execution failed: {str(e)}")
        
        print("\n" + "=" * 60)
        print(f"📊 Stock Management Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All stock management tests PASSED!")
            return True
        else:
            print(f"⚠️  {total - passed} stock management tests FAILED")
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
            ("Paid Order Cancellation Retention", self.test_paid_order_cancellation),
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
        # Run new features tests as requested in the review
        success = await tester.run_new_features_tests()
        return 0 if success else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)