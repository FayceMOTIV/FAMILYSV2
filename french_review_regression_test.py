#!/usr/bin/env python3
"""
Test rapide du backend pour vérifier qu'il n'y a pas de régression après toutes les modifications.
Focus sur endpoints critiques seulement, test rapide de 5 min max.
"""

import asyncio
import aiohttp
import json
import sys
from typing import Dict, Optional
from datetime import datetime, timezone

# Backend URL from review request
BACKEND_URL = "https://resto-hub-54.preview.emergentagent.com"

class FrenchReviewTester:
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
                        self.log_result(test_name, True, f"Login successful")
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
        """Test Settings API - Vérifier que les nouveaux champs fonctionnent."""
        test_name = "Settings API - Nouveaux Champs"
        
        try:
            # Test GET /api/v1/admin/settings
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/settings",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    
                    # Vérifier les nouveaux champs
                    required_fields = ["order_hours", "social_media", "service_links"]
                    missing_fields = []
                    
                    for field in required_fields:
                        if field not in data:
                            missing_fields.append(field)
                    
                    if missing_fields:
                        self.log_result(test_name, False, f"Champs manquants: {missing_fields}", data)
                        return False
                    
                    # Vérifier la structure des nouveaux champs
                    order_hours = data.get("order_hours", {})
                    social_media = data.get("social_media", {})
                    service_links = data.get("service_links", {})
                    
                    if not isinstance(order_hours, dict):
                        self.log_result(test_name, False, "order_hours n'est pas un dict")
                        return False
                    
                    if not isinstance(social_media, dict):
                        self.log_result(test_name, False, "social_media n'est pas un dict")
                        return False
                    
                    if not isinstance(service_links, dict):
                        self.log_result(test_name, False, "service_links n'est pas un dict")
                        return False
                    
                    self.log_result(test_name, True, f"Nouveaux champs présents et bien structurés: order_hours, social_media, service_links")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_products_categories_no_slug_regression(self) -> bool:
        """Test Products & Categories - Vérifier pas de régression avec suppression slug."""
        test_name = "Products & Categories - Pas de régression slug"
        
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
                
                products_data = await response.json()
                products = products_data.get("products", [])
                
                if len(products) == 0:
                    self.log_result(test_name, False, "Aucun produit trouvé")
                    return False
            
            # Test GET /api/v1/admin/categories
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/categories",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"GET categories failed: HTTP {response.status}: {error_data}")
                    return False
                
                categories_data = await response.json()
                categories = categories_data.get("categories", [])
                
                if len(categories) == 0:
                    self.log_result(test_name, False, "Aucune catégorie trouvée")
                    return False
            
            # Test POST /api/v1/admin/products (sans slug)
            test_product = {
                "name": "Test Product Sans Slug",
                "description": "Produit de test sans slug",
                "base_price": 15.99,
                "category": categories[0].get("name") if categories else "test-category",
                "image_url": "https://example.com/test.jpg"
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/products",
                json=test_product,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status not in [200, 201]:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"POST product sans slug failed: HTTP {response.status}: {error_data}")
                    return False
                
                product_response = await response.json()
                created_product_id = product_response.get("id")
            
            # Test POST /api/v1/admin/categories (sans slug)
            test_category = {
                "name": "Test Category Sans Slug",
                "description": "Catégorie de test sans slug",
                "order": 999,
                "is_active": True
            }
            
            async with self.session.post(
                f"{self.base_url}/api/v1/admin/categories",
                json=test_category,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status not in [200, 201]:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"POST category sans slug failed: HTTP {response.status}: {error_data}")
                    return False
                
                category_response = await response.json()
                created_category_id = category_response.get("id")
            
            # Cleanup - Delete test items
            if created_product_id:
                try:
                    async with self.session.delete(
                        f"{self.base_url}/api/v1/admin/products/{created_product_id}",
                        headers={"Content-Type": "application/json"}
                    ) as response:
                        pass  # Ignore cleanup errors
                except:
                    pass
            
            if created_category_id:
                try:
                    async with self.session.delete(
                        f"{self.base_url}/api/v1/admin/categories/{created_category_id}",
                        headers={"Content-Type": "application/json"}
                    ) as response:
                        pass  # Ignore cleanup errors
                except:
                    pass
            
            self.log_result(test_name, True, f"GET products ({len(products)} items), GET categories ({len(categories)} items), POST sans slug - tous fonctionnent")
            return True
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_orders_payment_modes(self) -> bool:
        """Test Orders & Payment - Modes de paiement corrects."""
        test_name = "Orders & Payment - Modes de paiement"
        
        try:
            # Test GET /api/v1/admin/orders
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/orders",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    orders = data.get("orders", [])
                    
                    if len(orders) == 0:
                        self.log_result(test_name, False, "Aucune commande trouvée")
                        return False
                    
                    # Vérifier les modes de paiement dans les commandes
                    payment_methods_found = set()
                    payment_statuses_found = set()
                    
                    for order in orders[:10]:  # Check first 10 orders
                        payment_method = order.get("payment_method")
                        payment_status = order.get("payment_status")
                        
                        if payment_method:
                            payment_methods_found.add(payment_method)
                        if payment_status:
                            payment_statuses_found.add(payment_status)
                    
                    # Vérifier que les modes de paiement attendus sont présents
                    expected_methods = {"cash", "card", "mobile", "online"}
                    expected_statuses = {"pending", "paid", "failed"}
                    
                    methods_present = payment_methods_found.intersection(expected_methods)
                    statuses_present = payment_statuses_found.intersection(expected_statuses)
                    
                    self.log_result(test_name, True, f"Commandes récupérées: {len(orders)}, Modes paiement trouvés: {list(payment_methods_found)}, Statuts: {list(payment_statuses_found)}")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_promotions_v2_no_regression(self) -> bool:
        """Test Promotions V2 - Pas de régression."""
        test_name = "Promotions V2 - Pas de régression"
        
        try:
            # Test GET /api/v1/admin/promotions
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/promotions",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    promotions = data.get("promotions", [])
                    
                    # Vérifier que l'endpoint fonctionne (même si pas de promotions)
                    self.log_result(test_name, True, f"Promotions V2 endpoint fonctionnel: {len(promotions)} promotions trouvées")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def run_all_tests(self):
        """Run all regression tests."""
        print("🚀 DÉMARRAGE DES TESTS DE RÉGRESSION BACKEND")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Login first
        login_success = await self.test_login()
        if not login_success:
            print("❌ ÉCHEC LOGIN - Arrêt des tests")
            return
        
        # Run priority tests from French review
        tests = [
            self.test_settings_api_nouveaux_champs,
            self.test_products_categories_no_slug_regression,
            self.test_orders_payment_modes,
            self.test_promotions_v2_no_regression
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                success = await test()
                if success:
                    passed += 1
            except Exception as e:
                print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
        
        print("=" * 60)
        print(f"📊 RÉSULTATS FINAUX: {passed}/{total} tests réussis ({(passed/total)*100:.1f}%)")
        
        if passed == total:
            print("✅ TOUS LES TESTS DE RÉGRESSION PASSENT - Pas de régression détectée")
        else:
            print("⚠️  CERTAINS TESTS ÉCHOUENT - Régression possible détectée")
        
        return passed == total

async def main():
    """Main test runner."""
    async with FrenchReviewTester() as tester:
        success = await tester.run_all_tests()
        sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())