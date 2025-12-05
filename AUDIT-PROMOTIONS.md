# 🔍 AUDIT COMPLET DU SYSTÈME DE PROMOTIONS

## 📋 Les 14 Types de Promotions

| # | Type | Description | Prix affiché réduit ? | Quand la remise s'applique |
|---|------|-------------|----------------------|---------------------------|
| 1 | **BOGO** | Buy One Get One (1 acheté = 1 offert) | ❌ NON | Au panier quand quantité ≥ 2 |
| 2 | **PERCENT_ITEM** | % de réduction sur produit(s) spécifique(s) | ✅ OUI | Sur le prix unitaire |
| 3 | **PERCENT_CATEGORY** | % de réduction sur une catégorie | ✅ OUI | Sur le prix unitaire |
| 4 | **FIXED_ITEM** | -X€ sur produit(s) spécifique(s) | ✅ OUI | Sur le prix unitaire |
| 5 | **FIXED_CATEGORY** | -X€ sur une catégorie | ✅ OUI | Sur le prix unitaire |
| 6 | **CONDITIONAL_DISCOUNT** | 2ème à -50%, 3 pour 2, etc. | ❌ NON | Au panier quand quantité atteinte |
| 7 | **THRESHOLD** | Remise dès X€ d'achat | ❌ NON | Au panier si total ≥ seuil |
| 8 | **SHIPPING_FREE** | Livraison gratuite | ❌ NON | Au panier (frais de livraison) |
| 9 | **NEW_CUSTOMER** | Offre 1ère commande | ⚠️ SELON CONFIG | Si discount_type = percentage/fixed |
| 10 | **INACTIVE_CUSTOMER** | Offre client inactif | ⚠️ SELON CONFIG | Si discount_type = percentage/fixed |
| 11 | **LOYALTY_MULTIPLIER** | Points fidélité x2, x3... | ❌ NON | Multiplicateur de points |
| 12 | **HAPPY_HOUR** | Remise sur horaires | ⚠️ SELON CONFIG | Si discount_type = percentage/fixed |
| 13 | **FLASH** | Vente flash durée limitée | ⚠️ SELON CONFIG | Si discount_type = percentage/fixed |
| 14 | **SEASONAL** | Promo événementielle | ⚠️ SELON CONFIG | Si discount_type = percentage/fixed |
| 15 | **PROMO_CODE** | Avec code promo | ❌ NON (code requis) | Au panier avec code |

---

## 🎯 Logique d'Affichage

### Sur la fiche produit et la home :

```
SI promo.type IN [bogo, conditional_discount, threshold, shipping_free, loyalty_multiplier]:
    → Afficher le badge (nom de la promo)
    → NE PAS afficher de prix barré
    → Prix reste le prix de base

SI promo.type IN [percent_item, percent_category, fixed_item, fixed_category]:
    → Afficher le badge
    → Calculer et afficher le prix réduit
    → Afficher le prix de base barré

SI promo.type IN [happy_hour, flash, seasonal, new_customer, inactive_customer]:
    → Vérifier si discount_type = percentage ou fixed
    → SI OUI: afficher prix réduit + prix barré
    → SI NON: juste le badge

SI promo.code_required = true:
    → NE PAS afficher de prix réduit (l'utilisateur doit entrer le code)
```

---

## 🛒 Logique au Panier (promotion_engine.py)

### BOGO (Buy One Get One)
```python
# Exemple: Burger BOGO (1 acheté = 1 offert)
# Si client achète 2 burgers à 10€:
# - Il paie: 10€ (1 burger)
# - Il obtient: 2 burgers
# - Économie: 10€

buy_qty = 1  # Acheter
get_qty = 1  # Obtenir gratuit
# Pour 4 burgers: 2 sets = 2 gratuits = 20€ de remise
```

### CONDITIONAL_DISCOUNT (2ème à -50%)
```python
# Exemple: 2ème burger à -50%
# Si client achète 2 burgers à 10€:
# - Burger 1: 10€
# - Burger 2: 5€ (-50%)
# - Total: 15€ au lieu de 20€
```

### THRESHOLD (Seuil de panier)
```python
# Exemple: -10% dès 30€ d'achat
# Si panier = 35€:
# - Remise: 3.50€
# - Total: 31.50€
```

---

## ✅ Corrections Appliquées

### 1. products.py - calculate_promo_price()
- BOGO: ne modifie plus le prix unitaire ✅
- CONDITIONAL_DISCOUNT: ne modifie plus le prix unitaire ✅  
- THRESHOLD: ne modifie plus le prix unitaire ✅
- SHIPPING_FREE: ne modifie plus le prix unitaire ✅
- LOYALTY_MULTIPLIER: ne modifie plus le prix unitaire ✅
- Les autres types calculent correctement le prix réduit ✅

### 2. app/(tabs)/index.tsx - Home Screen
- Badge affiche le nom de la promo (pas -X% pour BOGO) ✅
- Prix barré uniquement si vraie réduction de prix ✅

### 3. app/product/[id].tsx - Page Produit
- Badge et ruban affichés pour BOGO et autres promos ✅
- Prix barré uniquement si vraie réduction de prix ✅

---

## 🧪 Tests Recommandés

### Test BOGO
1. Créer promo BOGO sur un produit
2. Vérifier: badge affiché, prix NON barré
3. Ajouter 2x le produit au panier
4. Vérifier: remise appliquée au total

### Test PERCENT_ITEM
1. Créer promo -20% sur un produit
2. Vérifier: badge affiché, prix BARRÉ, nouveau prix = base * 0.8

### Test THRESHOLD
1. Créer promo -10€ dès 30€ d'achat
2. Vérifier: badge affiché sur produits, prix NON barré
3. Panier < 30€: pas de remise
4. Panier ≥ 30€: remise de 10€

---

## 📝 Exemple de Configuration BOGO

```json
{
  "name": "un acheté un offert !!",
  "type": "bogo",
  "eligible_products": ["id-du-tiramisu"],
  "bogo_buy_quantity": 1,
  "bogo_get_quantity": 1,
  "discount_type": "percentage",  // Ignoré pour BOGO
  "discount_value": 10,           // Ignoré pour BOGO
  "badge_text": "",               // Vide = utilise le nom
  "badge_color": "#FF6B35"
}
```

**Résultat attendu:**
- Home: Badge "un acheté un offert !!" + prix 5.50€ (pas barré)
- Produit: Badge + ruban + prix 5.50€ (pas barré)
- Panier avec 2x Tiramisu: Total 5.50€ au lieu de 11€
