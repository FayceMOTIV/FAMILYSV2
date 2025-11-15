#!/usr/bin/env python3
"""
Settings API Corrected Testing for Family's Back Office - French Review Request
Tests nouveaux champs Settings API et vérification de non-régression (CORRECTED VERSION)
"""

import asyncio
import aiohttp
import json
import sys
from typing import Dict, Optional
from datetime import datetime, timezone

# Backend URL from environment
BACKEND_URL = "https://resto-hub-54.preview.emergentagent.com"

class SettingsAPICorrectedTester:
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

    async def test_settings_get_new_fields(self) -> bool:
        """Test GET /api/v1/admin/settings - Vérifier nouveaux champs."""
        test_name = "Settings GET - Nouveaux Champs"
        
        if not self.auth_token:
            self.log_result(test_name, False, "No auth token available")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/settings",
                headers=headers
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    
                    # Vérifier les nouveaux champs requis
                    required_new_fields = ["order_hours", "social_media", "service_links"]
                    found_fields = []
                    missing_fields = []
                    
                    for field in required_new_fields:
                        if field in data:
                            found_fields.append(field)
                        else:
                            missing_fields.append(field)
                    
                    if len(found_fields) == len(required_new_fields):
                        self.log_result(test_name, True, f"Tous les nouveaux champs présents: {found_fields}")
                        
                        # Log structure of new fields for verification
                        for field in found_fields:
                            field_value = data.get(field)
                            print(f"   📋 {field}: {type(field_value).__name__} = {field_value}")
                        
                        return True
                    else:
                        self.log_result(test_name, False, f"Champs manquants: {missing_fields}. Trouvés: {found_fields}")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_settings_put_new_fields_corrected(self) -> bool:
        """Test PUT /api/v1/admin/settings - Tester mise à jour nouveaux champs (CORRECTED)."""
        test_name = "Settings PUT - Mise à jour Nouveaux Champs (Corrected)"
        
        if not self.auth_token:
            self.log_result(test_name, False, "No auth token available")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Test data for new fields
            test_settings = {
                "order_hours": {
                    "monday": {"open": "09:00", "close": "22:00"},
                    "tuesday": {"open": "09:00", "close": "22:00"},
                    "wednesday": {"open": "09:00", "close": "22:00"},
                    "thursday": {"open": "09:00", "close": "22:00"},
                    "friday": {"open": "09:00", "close": "23:00"},
                    "saturday": {"open": "10:00", "close": "23:00"},
                    "sunday": {"open": "10:00", "close": "21:00"}
                },
                "social_media": {
                    "facebook": "https://facebook.com/familys.restaurant.test",
                    "instagram": "https://instagram.com/familys_burger_test",
                    "twitter": "https://twitter.com/familys_app_test",
                    "tiktok": "https://tiktok.com/@familys_official_test"
                },
                "service_links": {
                    "delivery": "https://delivery.familys.app.test",
                    "reservation": "https://reservation.familys.app.test",
                    "loyalty": "https://loyalty.familys.app.test",
                    "support": "https://support.familys.app.test"
                }
            }
            
            async with self.session.put(
                f"{self.base_url}/api/v1/admin/settings",
                json=test_settings,
                headers=headers
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    
                    # The endpoint returns the full updated settings object, not a success flag
                    # Verify each new field was updated by checking the returned data
                    all_updated = True
                    for field_name, field_value in test_settings.items():
                        if data.get(field_name) != field_value:
                            all_updated = False
                            print(f"   ❌ {field_name} not updated correctly")
                            print(f"      Expected: {field_value}")
                            print(f"      Got: {data.get(field_name)}")
                    
                    if all_updated:
                        self.log_result(test_name, True, "Tous les nouveaux champs mis à jour avec succès (endpoint retourne l'objet complet)")
                        return True
                    else:
                        self.log_result(test_name, False, "Certains champs n'ont pas été mis à jour correctement")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_ai_marketing_stats_corrected(self) -> bool:
        """Test AI Marketing - Stats disponibles (CORRECTED)."""
        test_name = "AI Marketing - Stats (Corrected)"
        
        if not self.auth_token:
            self.log_result(test_name, False, "No auth token available")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/ai-marketing/stats",
                headers=headers
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    
                    # Check for actual stats fields returned by the endpoint
                    actual_stats = ["total_campaigns", "accepted", "refused", "pending", "total_ca_generated", "acceptance_rate"]
                    found_stats = []
                    
                    for stat in actual_stats:
                        if stat in data:
                            found_stats.append(stat)
                    
                    if len(found_stats) >= 4:  # At least 4 stats present
                        self.log_result(test_name, True, f"Stats AI Marketing disponibles: {found_stats}")
                        
                        # Log actual stats values
                        for stat in found_stats:
                            print(f"   📊 {stat}: {data.get(stat)}")
                        
                        # Also log weekly summary if present
                        if "weekly_summary" in data:
                            print(f"   📝 weekly_summary: {data.get('weekly_summary')[:100]}...")
                        
                        return True
                    else:
                        self.log_result(test_name, False, f"Stats insuffisantes. Trouvées: {found_stats}")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_no_regression_orders_corrected(self) -> bool:
        """Test No Regression - Orders API (CORRECTED)."""
        test_name = "No Regression - Orders (Corrected)"
        
        try:
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/orders",
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    
                    if "orders" in data:
                        orders = data["orders"]
                        order_count = len(orders)
                        
                        if order_count > 0:
                            # Verify order structure with correct field names
                            sample_order = orders[0]
                            required_fields = ["id", "status", "total"]  # "total" not "total_amount"
                            
                            missing_fields = []
                            for field in required_fields:
                                if field not in sample_order:
                                    missing_fields.append(field)
                            
                            if not missing_fields:
                                self.log_result(test_name, True, f"Orders API fonctionnel: {order_count} commandes avec structure correcte (champ 'total' confirmé)")
                                return True
                            else:
                                self.log_result(test_name, False, f"Structure commande incorrecte, champs manquants: {missing_fields}")
                                return False
                        else:
                            self.log_result(test_name, True, "Orders API fonctionnel (aucune commande)")
                            return True
                    else:
                        self.log_result(test_name, False, "Response missing 'orders' field", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_promotions_v2_no_regression(self) -> bool:
        """Test Promotions V2 - Pas de régression."""
        test_name = "Promotions V2 - No Regression"
        
        if not self.auth_token:
            self.log_result(test_name, False, "No auth token available")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with self.session.get(
                f"{self.base_url}/api/v1/admin/promotions",
                headers=headers
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    
                    if "promotions" in data:
                        promotions = data["promotions"]
                        promotion_count = len(promotions)
                        
                        # Verify promotions have expected structure
                        if promotion_count > 0:
                            sample_promo = promotions[0]
                            required_fields = ["id", "name", "type", "discount_value", "is_active"]
                            
                            missing_fields = []
                            for field in required_fields:
                                if field not in sample_promo:
                                    missing_fields.append(field)
                            
                            if not missing_fields:
                                self.log_result(test_name, True, f"Promotions V2 fonctionnel: {promotion_count} promotions trouvées avec structure correcte")
                                
                                # Log promotion details
                                for i, promo in enumerate(promotions[:2]):  # Show first 2 promotions
                                    print(f"   🎯 Promotion {i+1}: {promo.get('name')} ({promo.get('type')}) - {promo.get('discount_value')}% - Active: {promo.get('is_active')}")
                                
                                return True
                            else:
                                self.log_result(test_name, False, f"Structure promotion incorrecte, champs manquants: {missing_fields}")
                                return False
                        else:
                            self.log_result(test_name, True, "Promotions V2 endpoint fonctionnel (aucune promotion active)")
                            return True
                    else:
                        self.log_result(test_name, False, "Response missing 'promotions' field", data)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result(test_name, False, f"HTTP {response.status}: {error_data}")
                    return False
                    
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    async def test_comprehensive_regression_check(self) -> bool:
        """Test comprehensive regression check on core endpoints."""
        test_name = "Comprehensive Regression Check"
        
        try:
            endpoints_to_test = [
                ("/api/v1/admin/products", "products"),
                ("/api/v1/admin/categories", "categories"),
                ("/api/v1/admin/options", "options"),
                ("/api/v1/admin/orders", "orders")
            ]
            
            all_working = True
            results = []
            
            for endpoint, data_key in endpoints_to_test:
                async with self.session.get(
                    f"{self.base_url}{endpoint}",
                    headers={"Content-Type": "application/json"}
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        if data_key in data:
                            count = len(data[data_key])
                            results.append(f"{data_key}: {count} items")
                        else:
                            all_working = False
                            results.append(f"{data_key}: MISSING KEY")
                    else:
                        all_working = False
                        results.append(f"{data_key}: HTTP {response.status}")
            
            if all_working:
                self.log_result(test_name, True, f"Tous les endpoints principaux fonctionnels: {', '.join(results)}")
                return True
            else:
                self.log_result(test_name, False, f"Certains endpoints ont des problèmes: {', '.join(results)}")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            return False

    def print_summary(self):
        """Print test summary."""
        print("\n" + "="*80)
        print("🧪 RÉSUMÉ DES TESTS CORRIGÉS - SETTINGS API & NON-RÉGRESSION")
        print("="*80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"📊 Total: {total_tests} tests")
        print(f"✅ Réussis: {passed_tests}")
        print(f"❌ Échoués: {failed_tests}")
        print(f"📈 Taux de réussite: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ TESTS ÉCHOUÉS ({failed_tests}):")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['message']}")
        
        print(f"\n✅ TESTS RÉUSSIS ({passed_tests}):")
        for result in self.test_results:
            if result["success"]:
                print(f"   • {result['test']}: {result['message']}")
        
        print("\n" + "="*80)

async def main():
    """Run all corrected Settings API tests."""
    print("🚀 DÉMARRAGE DES TESTS SETTINGS API CORRIGÉS - FAMILY'S RESTAURANT")
    print("🎯 Focus: Nouveaux champs Settings + Vérification non-régression (VERSION CORRIGÉE)")
    print("🔗 Backend URL:", BACKEND_URL)
    print("👤 Admin Credentials: admin@familys.app / Admin@123456")
    print("="*80)
    
    async with SettingsAPICorrectedTester() as tester:
        # 1. Authentication
        print("\n🔐 PHASE 1: AUTHENTIFICATION")
        login_success = await tester.test_login()
        
        if not login_success:
            print("❌ Échec de l'authentification - Arrêt des tests")
            return
        
        # 2. Settings API - New Fields Testing (Corrected)
        print("\n⚙️ PHASE 2: SETTINGS API - NOUVEAUX CHAMPS (CORRIGÉ)")
        await tester.test_settings_get_new_fields()
        await tester.test_settings_put_new_fields_corrected()
        
        # 3. Promotions V2 - No Regression
        print("\n🎯 PHASE 3: PROMOTIONS V2 - NON-RÉGRESSION")
        await tester.test_promotions_v2_no_regression()
        
        # 4. AI Marketing Testing (Corrected)
        print("\n📈 PHASE 4: AI MARKETING (CORRIGÉ)")
        await tester.test_ai_marketing_stats_corrected()
        
        # 5. No Regression Testing (Corrected)
        print("\n🔄 PHASE 5: VÉRIFICATION NON-RÉGRESSION (CORRIGÉ)")
        await tester.test_no_regression_orders_corrected()
        await tester.test_comprehensive_regression_check()
        
        # Print final summary
        tester.print_summary()

if __name__ == "__main__":
    asyncio.run(main())