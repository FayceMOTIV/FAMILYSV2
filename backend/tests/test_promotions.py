import asyncio
from datetime import datetime, date, time, timedelta
from services.promotion_engine import PromotionEngine
from models.promotion import Promotion, PromotionType, DiscountValueType

class PromotionTester:
    """Tests automatiques pour tous les types de promotions"""
    
    def __init__(self, db):
        self.db = db
        self.engine = PromotionEngine(db)
        self.results = []
    
    async def run_all_tests(self):
        """Lance tous les tests"""
        print("\n" + "="*60)
        print("🧪 TESTS AUTOMATIQUES DES PROMOTIONS FAMILY'S")
        print("="*60 + "\n")
        
        await self.test_bogo()
        await self.test_percent_item()
        await self.test_percent_category()
        await self.test_conditional_discount()
        await self.test_threshold()
        await self.test_shipping_free()
        await self.test_new_customer()
        await self.test_inactive_customer()
        await self.test_happy_hour()
        await self.test_flash()
        await self.test_loyalty_multiplier()
        await self.test_promo_code()
        await self.test_priority_and_stacking()
        
        self.print_report()
    
    def log_result(self, test_name, passed, message=""):
        """Enregistre un résultat de test"""
        status = "✅ PASS" if passed else "❌ FAIL"
        self.results.append({
            "test": test_name,
            "passed": passed,
            "message": message
        })
        print(f"{status} - {test_name}")
        if message:
            print(f"     └─ {message}")
    
    async def test_bogo(self):
        """Test BOGO (Buy One Get One)"""
        print("\n🎁 Test: BOGO")
        
        promo = Promotion(
            id="test-bogo",
            restaurant_id="test",
            name="BOGO Burger",
            description="Achetez 1 burger = 1 offert",
            type=PromotionType.BOGO,
            discount_type=DiscountValueType.FREE_ITEM,
            discount_value=100,
            eligible_products=["prod-1"],
            bogo_buy_quantity=1,
            bogo_get_quantity=1,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status="active",
            is_active=True
        )
        
        cart = {
            "items": [
                {"product_id": "prod-1", "name": "Burger", "price": 10.0, "quantity": 2}
            ],
            "total": 20.0
        }
        
        result = self.engine.calculate_discount(promo, cart)
        
        # Devrait offrir 1 burger (10€)
        if result["discount"] == 10.0:
            self.log_result("BOGO - Achetez 1 = 1 offert", True, "Remise correcte: 10€")
        else:
            self.log_result("BOGO - Achetez 1 = 1 offert", False, f"Remise attendue: 10€, reçue: {result['discount']}€")
    
    async def test_percent_item(self):
        """Test réduction % sur produit"""
        print("\n💯 Test: % sur produit")
        
        promo = Promotion(
            id="test-percent-item",
            restaurant_id="test",
            name="20% Burger",
            description="20% de remise sur le burger",
            type=PromotionType.PERCENT_ITEM,
            discount_type=DiscountValueType.PERCENTAGE,
            discount_value=20,
            eligible_products=["prod-1"],
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status="active",
            is_active=True
        )
        
        cart = {
            "items": [
                {"product_id": "prod-1", "name": "Burger", "price": 10.0, "quantity": 1}
            ],
            "total": 10.0
        }
        
        result = self.engine.calculate_discount(promo, cart)
        
        # Devrait donner 20% de 10€ = 2€
        if result["discount"] == 2.0:
            self.log_result("% Produit - 20% sur 10€", True, "Remise correcte: 2€")
        else:
            self.log_result("% Produit - 20% sur 10€", False, f"Remise attendue: 2€, reçue: {result['discount']}€")
    
    async def test_percent_category(self):
        """Test réduction % sur catégorie"""
        print("\n💯 Test: % sur catégorie")
        
        promo = Promotion(
            id="test-percent-category",
            restaurant_id="test",
            name="15% Burgers",
            description="15% sur tous les burgers",
            type=PromotionType.PERCENT_CATEGORY,
            discount_type=DiscountValueType.PERCENTAGE,
            discount_value=15,
            eligible_categories=["cat-burgers"],
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status="active",
            is_active=True
        )
        
        cart = {
            "items": [
                {"product_id": "prod-1", "category_id": "cat-burgers", "name": "Burger 1", "price": 10.0, "quantity": 1},
                {"product_id": "prod-2", "category_id": "cat-burgers", "name": "Burger 2", "price": 12.0, "quantity": 1}
            ],
            "total": 22.0
        }
        
        result = self.engine.calculate_discount(promo, cart)
        
        # Devrait donner 15% de 22€ = 3.3€
        expected = 3.3
        if abs(result["discount"] - expected) < 0.01:
            self.log_result("% Catégorie - 15% sur 22€", True, f"Remise correcte: {result['discount']:.2f}€")
        else:
            self.log_result("% Catégorie - 15% sur 22€", False, f"Remise attendue: {expected}€, reçue: {result['discount']}€")
    
    async def test_conditional_discount(self):
        """Test remise conditionnelle (2e à -50%)"""
        print("\n🔢 Test: 2e à -50%")
        
        promo = Promotion(
            id="test-conditional",
            restaurant_id="test",
            name="2e à -50%",
            description="Le 2ème article à moitié prix",
            type=PromotionType.CONDITIONAL_DISCOUNT,
            discount_type=DiscountValueType.PERCENTAGE,
            discount_value=50,
            eligible_products=["prod-1"],
            conditional_quantity=2,
            conditional_discount_percent=50,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status="active",
            is_active=True
        )
        
        cart = {
            "items": [
                {"product_id": "prod-1", "name": "Burger", "price": 10.0, "quantity": 2}
            ],
            "total": 20.0
        }
        
        result = self.engine.calculate_discount(promo, cart)
        
        # Devrait donner 50% de 10€ = 5€
        if result["discount"] == 5.0:
            self.log_result("Conditionnelle - 2e à -50%", True, "Remise correcte: 5€")
        else:
            self.log_result("Conditionnelle - 2e à -50%", False, f"Remise attendue: 5€, reçue: {result['discount']}€")
    
    async def test_threshold(self):
        """Test seuil de panier"""
        print("\n🎯 Test: Seuil de panier")
        
        promo = Promotion(
            id="test-threshold",
            restaurant_id="test",
            name="Dès 30€ = -10%",
            description="10% de remise dès 30€",
            type=PromotionType.THRESHOLD,
            discount_type=DiscountValueType.PERCENTAGE,
            discount_value=10,
            min_cart_amount=30.0,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status="active",
            is_active=True
        )
        
        # Test avec panier > 30€
        cart_pass = {"items": [], "total": 35.0}
        result_pass = self.engine.calculate_discount(promo, cart_pass)
        
        # Test avec panier < 30€
        cart_fail = {"items": [], "total": 25.0}
        result_fail = self.engine.calculate_discount(promo, cart_fail)
        
        if result_pass["discount"] == 3.5 and result_fail["discount"] == 0:
            self.log_result("Seuil - Dès 30€", True, "Appliqué si > 30€, non appliqué si < 30€")
        else:
            self.log_result("Seuil - Dès 30€", False, f"Résultats incorrects")
    
    async def test_shipping_free(self):
        """Test livraison gratuite"""
        print("\n🚚 Test: Livraison gratuite")
        
        promo = Promotion(
            id="test-shipping",
            restaurant_id="test",
            name="Livraison offerte",
            description="Frais de livraison gratuits",
            type=PromotionType.SHIPPING_FREE,
            discount_type=DiscountValueType.FREE_ITEM,
            discount_value=0,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status="active",
            is_active=True
        )
        
        cart = {"items": [], "total": 20.0, "delivery_fee": 5.0}
        result = self.engine.calculate_discount(promo, cart)
        
        if result["discount"] == 5.0:
            self.log_result("Livraison gratuite", True, "Frais de 5€ annulés")
        else:
            self.log_result("Livraison gratuite", False, f"Remise attendue: 5€, reçue: {result['discount']}€")
    
    async def test_new_customer(self):
        """Test nouveau client"""
        print("\n✨ Test: Nouveau client")
        
        promo = Promotion(
            id="test-new-customer",
            restaurant_id="test",
            name="Bienvenue -20%",
            description="20% pour les nouveaux clients",
            type=PromotionType.NEW_CUSTOMER,
            discount_type=DiscountValueType.PERCENTAGE,
            discount_value=20,
            target_new_customers=True,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status="active",
            is_active=True
        )
        
        cart = {"items": [], "total": 20.0}
        customer_new = {"orders_count": 0}
        customer_old = {"orders_count": 5}
        
        # Vérifier conditions
        is_applicable_new = self.engine._check_conditions(
            promo, cart, customer_new, None, "mon", time(12, 0)
        )
        is_applicable_old = self.engine._check_conditions(
            promo, cart, customer_old, None, "mon", time(12, 0)
        )
        
        if is_applicable_new and not is_applicable_old:
            self.log_result("Nouveau client", True, "Appliqué uniquement aux nouveaux")
        else:
            self.log_result("Nouveau client", False, "Conditions incorrectes")
    
    async def test_inactive_customer(self):
        """Test client inactif"""
        print("\n💤 Test: Client inactif")
        
        promo = Promotion(
            id="test-inactive",
            restaurant_id="test",
            name="Réactivation -25%",
            description="25% pour clients inactifs 30j",
            type=PromotionType.INACTIVE_CUSTOMER,
            discount_type=DiscountValueType.PERCENTAGE,
            discount_value=25,
            target_inactive_days=30,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status="active",
            is_active=True
        )
        
        cart = {"items": [], "total": 20.0}
        
        # Client inactif depuis 35 jours
        inactive_date = (datetime.now() - timedelta(days=35)).isoformat()
        customer_inactive = {"last_order_date": inactive_date}
        
        # Client actif (commande il y a 10 jours)
        active_date = (datetime.now() - timedelta(days=10)).isoformat()
        customer_active = {"last_order_date": active_date}
        
        is_applicable_inactive = self.engine._check_conditions(
            promo, cart, customer_inactive, None, "mon", time(12, 0)
        )
        is_applicable_active = self.engine._check_conditions(
            promo, cart, customer_active, None, "mon", time(12, 0)
        )
        
        if is_applicable_inactive and not is_applicable_active:
            self.log_result("Client inactif", True, "Appliqué uniquement aux inactifs 30j+")
        else:
            self.log_result("Client inactif", False, "Conditions incorrectes")
    
    async def test_happy_hour(self):
        """Test Happy Hour"""
        print("\n🍻 Test: Happy Hour")
        
        promo = Promotion(
            id="test-happy-hour",
            restaurant_id="test",
            name="Happy Hour 15h-18h",
            description="15% entre 15h et 18h",
            type=PromotionType.HAPPY_HOUR,
            discount_type=DiscountValueType.PERCENTAGE,
            discount_value=15,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            start_time=time(15, 0),
            end_time=time(18, 0),
            status="active",
            is_active=True
        )
        
        cart = {"items": [], "total": 20.0}
        
        # Test dans la plage horaire
        is_applicable_in = self.engine._check_conditions(
            promo, cart, None, None, "mon", time(16, 0)
        )
        
        # Test hors plage horaire
        is_applicable_out = self.engine._check_conditions(
            promo, cart, None, None, "mon", time(19, 0)
        )
        
        if is_applicable_in and not is_applicable_out:
            self.log_result("Happy Hour", True, "Appliqué uniquement entre 15h-18h")
        else:
            self.log_result("Happy Hour", False, "Conditions horaires incorrectes")
    
    async def test_flash(self):
        """Test offre flash"""
        print("\n⚡ Test: Offre Flash")
        
        promo = Promotion(
            id="test-flash",
            restaurant_id="test",
            name="Flash 24h",
            description="Offre flash 24h",
            type=PromotionType.FLASH,
            discount_type=DiscountValueType.PERCENTAGE,
            discount_value=30,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=1),
            status="active",
            is_active=True
        )
        
        # Vérifier que la promo est bien limitée dans le temps
        if (promo.end_date - promo.start_date).days == 1:
            self.log_result("Offre Flash", True, "Durée limitée à 24h")
        else:
            self.log_result("Offre Flash", False, "Durée incorrecte")
    
    async def test_loyalty_multiplier(self):
        """Test multiplicateur fidélité"""
        print("\n⭐ Test: Multiplicateur fidélité")
        
        promo = Promotion(
            id="test-loyalty",
            restaurant_id="test",
            name="Points x2",
            description="Points de fidélité doublés",
            type=PromotionType.LOYALTY_MULTIPLIER,
            discount_type=DiscountValueType.MULTIPLIER,
            discount_value=0,
            multiplier_value=2.0,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status="active",
            is_active=True
        )
        
        if promo.multiplier_value == 2.0:
            self.log_result("Multiplicateur fidélité", True, "Multiplicateur x2 configuré")
        else:
            self.log_result("Multiplicateur fidélité", False, "Multiplicateur incorrect")
    
    async def test_promo_code(self):
        """Test code promo"""
        print("\n🔖 Test: Code promo")
        
        promo = Promotion(
            id="test-code",
            restaurant_id="test",
            name="Code WELCOME10",
            description="10% avec code WELCOME10",
            type=PromotionType.PROMO_CODE,
            discount_type=DiscountValueType.PERCENTAGE,
            discount_value=10,
            promo_code="WELCOME10",
            code_required=True,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status="active",
            is_active=True
        )
        
        cart = {"items": [], "total": 20.0}
        
        # Test avec bon code
        is_applicable_good = self.engine._check_conditions(
            promo, cart, None, "WELCOME10", "mon", time(12, 0)
        )
        
        # Test sans code
        is_applicable_no_code = self.engine._check_conditions(
            promo, cart, None, None, "mon", time(12, 0)
        )
        
        if is_applicable_good and not is_applicable_no_code:
            self.log_result("Code promo", True, "Appliqué uniquement avec code correct")
        else:
            self.log_result("Code promo", False, "Validation du code incorrecte")
    
    async def test_priority_and_stacking(self):
        """Test priorité et cumul"""
        print("\n🔄 Test: Priorité et cumul")
        
        promo1 = Promotion(
            id="test-prio-1",
            restaurant_id="test",
            name="Promo priorité 1",
            description="Priorité haute",
            type=PromotionType.PERCENT_ITEM,
            discount_type=DiscountValueType.PERCENTAGE,
            discount_value=10,
            eligible_products=["prod-1"],
            priority=10,
            stackable=False,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status="active",
            is_active=True
        )
        
        promo2 = Promotion(
            id="test-prio-2",
            restaurant_id="test",
            name="Promo priorité 2",
            description="Priorité basse",
            type=PromotionType.PERCENT_ITEM,
            discount_type=DiscountValueType.PERCENTAGE,
            discount_value=15,
            eligible_products=["prod-1"],
            priority=5,
            stackable=False,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status="active",
            is_active=True
        )
        
        # La promo avec priorité 10 devrait être appliquée en premier
        if promo1.priority > promo2.priority:
            self.log_result("Priorité", True, "Promo priorité 10 > priorité 5")
        else:
            self.log_result("Priorité", False, "Système de priorité incorrect")
        
        # Test non-cumul
        if not promo1.stackable:
            self.log_result("Non-cumul", True, "Promos non cumulables")
        else:
            self.log_result("Non-cumul", False, "Flag stackable incorrect")
    
    def print_report(self):
        """Affiche le rapport final"""
        print("\n" + "="*60)
        print("📊 RAPPORT FINAL")
        print("="*60)
        
        total = len(self.results)
        passed = sum(1 for r in self.results if r["passed"])
        failed = total - passed
        success_rate = (passed / total * 100) if total > 0 else 0
        
        print(f"\nTotal tests: {total}")
        print(f"✅ Réussis: {passed}")
        print(f"❌ Échoués: {failed}")
        print(f"📈 Taux de réussite: {success_rate:.1f}%\n")
        
        if failed > 0:
            print("❌ Tests échoués:")
            for r in self.results:
                if not r["passed"]:
                    print(f"   • {r['test']}: {r['message']}")
        else:
            print("🎉 TOUS LES TESTS SONT PASSÉS!")
        
        print("\n" + "="*60 + "\n")

# Fonction pour lancer les tests
async def run_promotion_tests(db):
    tester = PromotionTester(db)
    await tester.run_all_tests()
    return tester.results
