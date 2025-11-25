#!/usr/bin/env python3
"""
Test spécifique pour les blocages de paiement - Identifier les bugs critiques
"""

import asyncio
import aiohttp
import json
from typing import Dict, Optional

BACKEND_URL = "https://react-reborn.preview.emergentagent.com"

class PaymentBlockingTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = None
        self.auth_token = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def login(self) -> bool:
        """Login to get auth token."""
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
                        return True
                return False
        except Exception:
            return False

    async def get_unpaid_order(self) -> Optional[str]:
        """Find an unpaid order for testing."""
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
                    
                    # Look for unpaid orders
                    for order in orders:
                        payment_status = order.get("payment_status")
                        if payment_status != "paid":
                            return order.get("id")
                    
                    # If all orders are paid, use the first one and clear its payment
                    if orders:
                        order_id = orders[0].get("id")
                        # Try to clear payment status (this might not work, but worth trying)
                        await self.clear_payment(order_id)
                        return order_id
                        
                return None
        except Exception:
            return None

    async def clear_payment(self, order_id: str) -> bool:
        """Try to clear payment status for testing."""
        try:
            headers = {"Content-Type": "application/json"}
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            
            # Try to set payment status to unpaid
            payload = {
                "payment_method": "",
                "payment_status": "pending"
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/orders/{order_id}/payment",
                json=payload,
                headers=headers
            ) as response:
                return response.status == 200
        except Exception:
            return False

    async def update_order_status(self, order_id: str, new_status: str) -> tuple[bool, Dict]:
        """Update order status."""
        try:
            headers = {"Content-Type": "application/json"}
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            
            payload = {"status": new_status}
            
            async with self.session.patch(
                f"{self.base_url}/api/v1/admin/orders/{order_id}/status",
                json=payload,
                headers=headers
            ) as response:
                
                data = await response.json() if response.content_type == 'application/json' else {"error": await response.text()}
                return response.status == 200, data
        except Exception as e:
            return False, {"error": str(e)}

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

    async def test_payment_blocking_comprehensive(self):
        """Test comprehensive payment blocking scenarios."""
        print("🔒 TEST COMPLET DES BLOCAGES DE PAIEMENT")
        print("=" * 60)
        
        if not await self.login():
            print("❌ Login failed")
            return
        
        order_id = await self.get_unpaid_order()
        if not order_id:
            print("❌ No orders available for testing")
            return
        
        print(f"📋 Using order ID: {order_id}")
        
        # Test 1: Try to complete from new status without payment
        print("\n🧪 Test 1: new → completed (sans paiement)")
        success, _ = await self.update_order_status(order_id, "new")
        success, data = await self.update_order_status(order_id, "completed")
        
        if success:
            print("❌ BUG CRITIQUE: Transition new → completed autorisée sans paiement!")
        else:
            print(f"✅ Transition new → completed bloquée: {data.get('detail', 'Raison inconnue')}")
        
        # Test 2: Try to complete from ready status without payment
        print("\n🧪 Test 2: ready → completed (sans paiement)")
        success, _ = await self.update_order_status(order_id, "ready")
        
        # Check current payment status
        order = await self.get_order_details(order_id)
        is_paid = order and order.get("payment_status") == "paid"
        
        print(f"📊 État actuel du paiement: {order.get('payment_status') if order else 'inconnu'}")
        
        success, data = await self.update_order_status(order_id, "completed")
        
        if not is_paid:
            if success:
                print("❌ BUG CRITIQUE: Transition ready → completed autorisée sans paiement!")
            else:
                print(f"✅ Transition ready → completed bloquée: {data.get('detail', 'Raison inconnue')}")
        else:
            print("ℹ️  Commande déjà payée, test non applicable")
        
        # Test 3: Try invalid status transitions
        print("\n🧪 Test 3: Transitions de statut invalides")
        
        invalid_transitions = [
            ("new", "out_for_delivery"),
            ("in_preparation", "completed"),
            ("new", "invalid_status")
        ]
        
        for from_status, to_status in invalid_transitions:
            success, _ = await self.update_order_status(order_id, from_status)
            success, data = await self.update_order_status(order_id, to_status)
            
            if success:
                print(f"❌ BUG: Transition invalide {from_status} → {to_status} autorisée!")
            else:
                print(f"✅ Transition invalide {from_status} → {to_status} bloquée")
        
        print("\n" + "=" * 60)

async def main():
    async with PaymentBlockingTester() as tester:
        await tester.test_payment_blocking_comprehensive()

if __name__ == "__main__":
    asyncio.run(main())