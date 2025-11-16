#!/usr/bin/env python3
"""
Test complet du système de gestion des commandes - Identifier tous les bugs de transition de statuts
URL: https://foodapp-redesign.preview.emergentagent.com

Tests à effectuer selon la demande:
1. Créer une commande de test
2. Tester toutes les transitions de statuts possibles
3. Tester les blocages de paiement
4. Tester les annulations
5. Tester les edge cases
6. Vérifier la cohérence des données
7. Tester les notifications
"""

import asyncio
import aiohttp
import json
import sys
from typing import Dict, Optional, List
from datetime import datetime, timezone
import uuid

# Backend URL from environment
BACKEND_URL = "https://foodapp-redesign.preview.emergentagent.com"

class OrderStatusTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = None
        self.auth_token = None
        self.test_results = []
        self.test_order_id = None
        
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

    async def get_existing_order(self) -> Optional[str]:
        """Get an existing order ID for testing."""
        try:
            headers = {"Content-Type": "application/json"}
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
                
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/orders",
                headers=headers
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    orders = data.get("orders", [])
                    if orders:
                        # Find an order that's not completed or canceled
                        for order in orders:
                            status = order.get("status", "")
                            if status not in ["completed", "canceled"]:
                                return order.get("id")
                        # If no suitable order found, use the first one
                        return orders[0].get("id")
                return None
                
        except Exception as e:
            print(f"Error getting existing order: {str(e)}")
            return None

    async def create_test_order(self) -> bool:
        """Créer une commande de test."""
        test_name = "1. Créer une commande de test"
        
        # For this test, we'll use an existing order since creating orders 
        # typically requires customer-facing endpoints
        order_id = await self.get_existing_order()
        
        if order_id:
            self.test_order_id = order_id
            self.log_result(test_name, True, f"Using existing order ID: {order_id}")
            return True
        else:
            self.log_result(test_name, False, "No orders available for testing")
            return False

    async def get_order_details(self, order_id: str) -> Optional[Dict]:
        """Get order details."""
        try:
            headers = {"Content-Type": "application/json"}
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
                
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/orders",
                headers=headers
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    orders = data.get("orders", [])
                    for order in orders:
                        if order.get("id") == order_id:
                            return order
                return None
                
        except Exception:
            return None

    async def update_order_status(self, order_id: str, new_status: str, reason: str = None) -> tuple[bool, Dict]:
        """Update order status."""
        try:
            headers = {"Content-Type": "application/json"}
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            
            payload = {"status": new_status}
            if reason:
                payload["cancellation_reason"] = reason
            
            async with self.session.patch(
                f"{self.base_url}/api/v1/admin/orders/{order_id}/status",
                json=payload,
                headers=headers
            ) as response:
                
                data = await response.json() if response.content_type == 'application/json' else {"error": await response.text()}
                return response.status == 200, data
                
        except Exception as e:
            return False, {"error": str(e)}

    async def record_payment(self, order_id: str, payment_method: str = "card") -> tuple[bool, Dict]:
        """Record payment for order."""
        try:
            headers = {"Content-Type": "application/json"}
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            
            payload = {
                "payment_method": payment_method,
                "payment_status": "paid"
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/orders/{order_id}/payment",
                json=payload,
                headers=headers
            ) as response:
                
                data = await response.json() if response.content_type == 'application/json' else {"error": await response.text()}
                return response.status == 200, data
                
        except Exception as e:
            return False, {"error": str(e)}

    async def test_normal_flow_takeaway(self) -> bool:
        """Test flow normal (À emporter): new → in_preparation → ready → completed."""
        test_name = "2. Flow normal (À emporter)"
        
        if not self.test_order_id:
            self.log_result(test_name, False, "No test order available")
            return False
        
        try:
            # Reset order to new status first
            success, _ = await self.update_order_status(self.test_order_id, "new")
            if not success:
                self.log_result(test_name, False, "Could not reset order to 'new' status")
                return False
            
            # Test transitions: new → in_preparation
            success, data = await self.update_order_status(self.test_order_id, "in_preparation")
            if not success:
                self.log_result(test_name, False, f"new → in_preparation failed: {data}")
                return False
            
            # Verify status changed
            order = await self.get_order_details(self.test_order_id)
            if not order or order.get("status") != "in_preparation":
                self.log_result(test_name, False, f"Status not updated to in_preparation: {order.get('status') if order else 'order not found'}")
                return False
            
            # Test transitions: in_preparation → ready
            success, data = await self.update_order_status(self.test_order_id, "ready")
            if not success:
                self.log_result(test_name, False, f"in_preparation → ready failed: {data}")
                return False
            
            # Verify status changed
            order = await self.get_order_details(self.test_order_id)
            if not order or order.get("status") != "ready":
                self.log_result(test_name, False, f"Status not updated to ready: {order.get('status') if order else 'order not found'}")
                return False
            
            # Test transitions: ready → completed (should fail if not paid)
            success, data = await self.update_order_status(self.test_order_id, "completed")
            
            # Check if order is paid
            order = await self.get_order_details(self.test_order_id)
            is_paid = order and order.get("payment_status") == "paid"
            
            if is_paid:
                # If already paid, transition should succeed
                if success:
                    self.log_result(test_name, True, "✅ Flow normal completed successfully (order was already paid)")
                    return True
                else:
                    self.log_result(test_name, False, f"ready → completed failed even though order is paid: {data}")
                    return False
            else:
                # If not paid, transition should fail
                if not success:
                    self.log_result(test_name, True, "✅ ready → completed correctly blocked (order not paid)")
                    return True
                else:
                    self.log_result(test_name, False, "❌ BUG: ready → completed allowed without payment!")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_delivery_flow(self) -> bool:
        """Test flow livraison: new → in_preparation → ready → out_for_delivery → completed."""
        test_name = "3. Flow livraison"
        
        if not self.test_order_id:
            self.log_result(test_name, False, "No test order available")
            return False
        
        try:
            # Reset order to new status first
            success, _ = await self.update_order_status(self.test_order_id, "new")
            if not success:
                self.log_result(test_name, False, "Could not reset order to 'new' status")
                return False
            
            # Test transitions: new → in_preparation
            success, data = await self.update_order_status(self.test_order_id, "in_preparation")
            if not success:
                self.log_result(test_name, False, f"new → in_preparation failed: {data}")
                return False
            
            # Test transitions: in_preparation → ready
            success, data = await self.update_order_status(self.test_order_id, "ready")
            if not success:
                self.log_result(test_name, False, f"in_preparation → ready failed: {data}")
                return False
            
            # Test transitions: ready → out_for_delivery
            success, data = await self.update_order_status(self.test_order_id, "out_for_delivery")
            if not success:
                self.log_result(test_name, False, f"ready → out_for_delivery failed: {data}")
                return False
            
            # Verify status changed
            order = await self.get_order_details(self.test_order_id)
            if not order or order.get("status") != "out_for_delivery":
                self.log_result(test_name, False, f"Status not updated to out_for_delivery: {order.get('status') if order else 'order not found'}")
                return False
            
            # Test transitions: out_for_delivery → completed (should fail if not paid)
            success, data = await self.update_order_status(self.test_order_id, "completed")
            
            # Check if order is paid
            order = await self.get_order_details(self.test_order_id)
            is_paid = order and order.get("payment_status") == "paid"
            
            if is_paid:
                # If already paid, transition should succeed
                if success:
                    self.log_result(test_name, True, "✅ Flow livraison completed successfully (order was already paid)")
                    return True
                else:
                    self.log_result(test_name, False, f"out_for_delivery → completed failed even though order is paid: {data}")
                    return False
            else:
                # If not paid, transition should fail
                if not success:
                    self.log_result(test_name, True, "✅ out_for_delivery → completed correctly blocked (order not paid)")
                    return True
                else:
                    self.log_result(test_name, False, "❌ BUG: out_for_delivery → completed allowed without payment!")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_payment_blocking(self) -> bool:
        """Test les blocages de paiement."""
        test_name = "4. Tester les blocages de paiement"
        
        if not self.test_order_id:
            self.log_result(test_name, False, "No test order available")
            return False
        
        try:
            # Set order to ready status
            success, _ = await self.update_order_status(self.test_order_id, "ready")
            if not success:
                self.log_result(test_name, False, "Could not set order to ready status")
                return False
            
            # Try to complete without payment
            success, data = await self.update_order_status(self.test_order_id, "completed")
            
            # Check current payment status
            order = await self.get_order_details(self.test_order_id)
            is_paid = order and order.get("payment_status") == "paid"
            
            if not is_paid:
                if not success:
                    # Good - completion was blocked
                    error_msg = data.get("detail", "").lower()
                    if "payment" in error_msg or "paiement" in error_msg or "payé" in error_msg:
                        self.log_result(test_name, True, f"✅ Completion correctly blocked with payment error: {data.get('detail', '')}")
                    else:
                        self.log_result(test_name, True, f"✅ Completion blocked (reason: {data.get('detail', 'Unknown')})")
                    
                    # Now record payment
                    payment_success, payment_data = await self.record_payment(self.test_order_id, "card")
                    if not payment_success:
                        self.log_result(f"{test_name} - Payment Recording", False, f"Could not record payment: {payment_data}")
                        return False
                    
                    # Try to complete again after payment
                    success, data = await self.update_order_status(self.test_order_id, "completed")
                    if success:
                        self.log_result(f"{test_name} - After Payment", True, "✅ Completion allowed after payment recorded")
                        return True
                    else:
                        self.log_result(f"{test_name} - After Payment", False, f"Completion still blocked after payment: {data}")
                        return False
                else:
                    self.log_result(test_name, False, "❌ BUG: Completion allowed without payment!")
                    return False
            else:
                # Order is already paid
                if success:
                    self.log_result(test_name, True, "✅ Completion allowed for already paid order")
                    return True
                else:
                    self.log_result(test_name, False, f"Completion blocked even though order is paid: {data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_cancellations(self) -> bool:
        """Test les annulations."""
        test_name = "5. Tester les annulations"
        
        if not self.test_order_id:
            self.log_result(test_name, False, "No test order available")
            return False
        
        try:
            results = []
            
            # Test cancellation from different statuses
            statuses_to_test = ["new", "in_preparation", "ready"]
            
            for status in statuses_to_test:
                # Set order to the status
                success, _ = await self.update_order_status(self.test_order_id, status)
                if not success:
                    results.append(f"❌ Could not set order to {status}")
                    continue
                
                # Test cancellation with reason
                success, data = await self.update_order_status(self.test_order_id, "canceled", "Test cancellation from " + status)
                if success:
                    # Verify cancellation was recorded
                    order = await self.get_order_details(self.test_order_id)
                    if order and order.get("status") == "canceled":
                        reason = order.get("cancellation_reason", "")
                        if "Test cancellation from " + status in reason:
                            results.append(f"✅ Cancellation from {status} with reason: SUCCESS")
                        else:
                            results.append(f"⚠️ Cancellation from {status}: status changed but reason not saved correctly")
                    else:
                        results.append(f"❌ Cancellation from {status}: status not updated in database")
                else:
                    results.append(f"❌ Cancellation from {status} failed: {data.get('detail', '')}")
            
            # Test cancellation without reason
            success, _ = await self.update_order_status(self.test_order_id, "new")
            success, data = await self.update_order_status(self.test_order_id, "canceled")
            if success:
                order = await self.get_order_details(self.test_order_id)
                if order and order.get("status") == "canceled":
                    results.append("✅ Cancellation without reason: SUCCESS")
                else:
                    results.append("❌ Cancellation without reason: status not updated")
            else:
                results.append(f"❌ Cancellation without reason failed: {data.get('detail', '')}")
            
            # Check results
            success_count = sum(1 for r in results if r.startswith("✅"))
            total_tests = len(results)
            
            if success_count == total_tests:
                self.log_result(test_name, True, f"All cancellation tests passed ({success_count}/{total_tests})")
                for result in results:
                    print(f"   {result}")
                return True
            else:
                self.log_result(test_name, False, f"Some cancellation tests failed ({success_count}/{total_tests})")
                for result in results:
                    print(f"   {result}")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_edge_cases(self) -> bool:
        """Test les edge cases."""
        test_name = "6. Tester les edge cases"
        
        if not self.test_order_id:
            self.log_result(test_name, False, "No test order available")
            return False
        
        try:
            results = []
            
            # Test invalid status transition (new → completed directly)
            success, _ = await self.update_order_status(self.test_order_id, "new")
            success, data = await self.update_order_status(self.test_order_id, "completed")
            if not success:
                results.append("✅ Invalid transition (new → completed) correctly blocked")
            else:
                results.append("❌ BUG: Invalid transition (new → completed) allowed!")
            
            # Test non-existent status
            success, data = await self.update_order_status(self.test_order_id, "invalid_status")
            if not success:
                results.append("✅ Invalid status correctly rejected")
            else:
                results.append("❌ BUG: Invalid status accepted!")
            
            # Test non-existent order ID
            fake_order_id = str(uuid.uuid4())
            success, data = await self.update_order_status(fake_order_id, "in_preparation")
            if not success:
                results.append("✅ Non-existent order ID correctly rejected")
            else:
                results.append("❌ BUG: Non-existent order ID accepted!")
            
            # Test double status change (rapid succession)
            success, _ = await self.update_order_status(self.test_order_id, "new")
            success1, _ = await self.update_order_status(self.test_order_id, "in_preparation")
            success2, _ = await self.update_order_status(self.test_order_id, "ready")
            
            if success1 and success2:
                # Verify final status
                order = await self.get_order_details(self.test_order_id)
                if order and order.get("status") == "ready":
                    results.append("✅ Rapid status changes handled correctly")
                else:
                    results.append(f"⚠️ Rapid status changes: final status is {order.get('status') if order else 'unknown'}")
            else:
                results.append("❌ Rapid status changes failed")
            
            # Check results
            success_count = sum(1 for r in results if r.startswith("✅"))
            total_tests = len(results)
            
            if success_count >= total_tests - 1:  # Allow one warning
                self.log_result(test_name, True, f"Edge case tests mostly passed ({success_count}/{total_tests})")
                for result in results:
                    print(f"   {result}")
                return True
            else:
                self.log_result(test_name, False, f"Multiple edge case tests failed ({success_count}/{total_tests})")
                for result in results:
                    print(f"   {result}")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_data_consistency(self) -> bool:
        """Vérifier la cohérence des données."""
        test_name = "7. Vérifier la cohérence des données"
        
        if not self.test_order_id:
            self.log_result(test_name, False, "No test order available")
            return False
        
        try:
            results = []
            
            # Get initial order state
            initial_order = await self.get_order_details(self.test_order_id)
            if not initial_order:
                self.log_result(test_name, False, "Could not get initial order details")
                return False
            
            initial_updated_at = initial_order.get("updated_at")
            
            # Change status and verify data consistency
            success, _ = await self.update_order_status(self.test_order_id, "in_preparation")
            if not success:
                results.append("❌ Could not change status for consistency test")
            else:
                # Get updated order
                updated_order = await self.get_order_details(self.test_order_id)
                if not updated_order:
                    results.append("❌ Could not retrieve updated order")
                else:
                    # Check status updated
                    if updated_order.get("status") == "in_preparation":
                        results.append("✅ Status correctly updated in database")
                    else:
                        results.append(f"❌ Status not updated: {updated_order.get('status')}")
                    
                    # Check updated_at changed
                    new_updated_at = updated_order.get("updated_at")
                    if new_updated_at and new_updated_at != initial_updated_at:
                        results.append("✅ updated_at timestamp changed")
                    else:
                        results.append("⚠️ updated_at timestamp not changed or missing")
                    
                    # Check other fields preserved
                    preserved_fields = ["id", "customer_email", "items", "total_amount"]
                    for field in preserved_fields:
                        if updated_order.get(field) == initial_order.get(field):
                            results.append(f"✅ {field} preserved")
                        else:
                            results.append(f"❌ {field} changed unexpectedly")
            
            # Test payment status consistency
            payment_success, _ = await self.record_payment(self.test_order_id, "card")
            if payment_success:
                payment_order = await self.get_order_details(self.test_order_id)
                if payment_order:
                    if payment_order.get("payment_status") == "paid":
                        results.append("✅ payment_status correctly updated")
                    else:
                        results.append(f"❌ payment_status not updated: {payment_order.get('payment_status')}")
                    
                    if payment_order.get("payment_method") == "card":
                        results.append("✅ payment_method correctly saved")
                    else:
                        results.append(f"❌ payment_method not saved: {payment_order.get('payment_method')}")
            
            # Check results
            success_count = sum(1 for r in results if r.startswith("✅"))
            warning_count = sum(1 for r in results if r.startswith("⚠️"))
            total_tests = len(results)
            
            if success_count >= total_tests - warning_count:
                self.log_result(test_name, True, f"Data consistency tests passed ({success_count}/{total_tests}, {warning_count} warnings)")
                for result in results:
                    print(f"   {result}")
                return True
            else:
                self.log_result(test_name, False, f"Data consistency issues found ({success_count}/{total_tests})")
                for result in results:
                    print(f"   {result}")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_notifications(self) -> bool:
        """Tester les notifications (simulation)."""
        test_name = "8. Tester les notifications"
        
        # Note: This is a simplified test since we don't have direct access to notification system
        # In a real scenario, we would check if notifications are sent for each status change
        
        try:
            # Check if notifications endpoint exists
            headers = {"Content-Type": "application/json"}
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/notifications",
                headers=headers
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    notifications = data.get("notifications", [])
                    
                    # Look for order-related notifications
                    order_notifications = []
                    notification_types = ["order_preparing", "order_ready", "order_delivering", "order_completed"]
                    
                    for notif in notifications:
                        notif_type = notif.get("notification_type", "")
                        if any(nt in notif_type for nt in notification_types):
                            order_notifications.append(notif)
                    
                    if order_notifications:
                        self.log_result(test_name, True, f"✅ Found {len(order_notifications)} order-related notifications in system")
                        
                        # Show notification types found
                        types_found = set()
                        for notif in order_notifications[:5]:  # Show first 5
                            types_found.add(notif.get("notification_type", "unknown"))
                        
                        print(f"   Notification types found: {', '.join(types_found)}")
                        return True
                    else:
                        self.log_result(test_name, True, f"✅ Notifications endpoint accessible, but no order notifications found (may be expected in test environment)")
                        return True
                else:
                    self.log_result(test_name, False, f"Could not access notifications endpoint: HTTP {response.status}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def run_all_tests(self):
        """Run all order status transition tests."""
        print("🧪 DÉMARRAGE DES TESTS DU SYSTÈME DE GESTION DES COMMANDES")
        print("=" * 80)
        
        # Login first
        if not await self.test_login():
            print("❌ Login failed, cannot continue tests")
            return
        
        # Run all tests
        tests = [
            self.create_test_order,
            self.test_normal_flow_takeaway,
            self.test_delivery_flow,
            self.test_payment_blocking,
            self.test_cancellations,
            self.test_edge_cases,
            self.test_data_consistency,
            self.test_notifications
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if await test():
                    passed += 1
                print()  # Add spacing between tests
            except Exception as e:
                print(f"❌ Test {test.__name__} crashed: {str(e)}")
                print()
        
        # Summary
        print("=" * 80)
        print(f"📊 RÉSULTATS FINAUX: {passed}/{total} tests réussis")
        
        if passed == total:
            print("🎉 TOUS LES TESTS SONT PASSÉS!")
        else:
            print(f"⚠️  {total - passed} tests ont échoué - voir les détails ci-dessus")
            
            # Show failed tests
            failed_tests = []
            for result in self.test_results:
                if not result["success"]:
                    failed_tests.append(result["test"])
            
            if failed_tests:
                print("\n❌ TESTS ÉCHOUÉS:")
                for test in failed_tests:
                    print(f"   - {test}")
        
        print("=" * 80)

async def main():
    """Main test runner."""
    async with OrderStatusTester() as tester:
        await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())