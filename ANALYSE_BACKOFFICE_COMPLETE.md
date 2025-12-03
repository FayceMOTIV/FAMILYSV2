# 📊 ANALYSE COMPLÈTE : BACKOFFICE → MOBILE

## 🎯 CE QUI EXISTE DANS LE BACKEND

### 1. ORDERS (Commandes)
**Modèle** : `Order`
- ✅ `consumption_mode` : **takeaway**, **on_site**, **delivery**
- ✅ `pickup_date` et `pickup_time`
- ✅ `payment_method` : card, cash, ticket_resto, check, loyalty
- ✅ `payment_status` : paid, pending
- ✅ `cashback_used` et `cashback_earned`
- ✅ Statuts : new, in_preparation, ready, out_for_delivery, completed, canceled

**Routes admin** :
- GET `/admin/orders` (avec filtres)
- GET `/admin/orders/{id}`
- PATCH `/admin/orders/{id}/status`

### 2. RESERVATIONS
**Modèle** : `Reservation`
- ✅ customer_name, customer_email, customer_phone
- ✅ reservation_date, reservation_time
- ✅ party_size (nombre de personnes)
- ✅ status : pending, confirmed, canceled, completed
- ✅ notes

**Routes admin** :
- GET `/admin/reservations` (avec filtres)
- POST `/admin/reservations`
- PATCH `/admin/reservations/{id}/status`
- DELETE `/admin/reservations/{id}`

### 3. SETTINGS (Paramètres Restaurant)
**Modèle** : `RestaurantSettings`
- ✅ **enable_delivery** : bool
- ✅ **enable_takeaway** : bool
- ✅ **enable_onsite** : bool
- ✅ **enable_reservations** : bool
- ✅ is_paused, no_more_orders_today
- ✅ opening_hours, order_hours
- ✅ order_cutoff_minutes, preparation_time_minutes
- ✅ logo_url, latitude, longitude
- ✅ social_media, mentions légales

**Routes** :
- GET `/admin/settings`
- PUT `/admin/settings`

### 4. PROMOTIONS V2
**Modèle** : `Promotion`
- ✅ code, title, description
- ✅ discount_type : percentage, fixed
- ✅ discount_value
- ✅ min_order_amount
- ✅ start_date, end_date
- ✅ max_uses, times_used
- ✅ target_type : all, category, product
- ✅ is_active

**Routes admin** :
- GET `/admin/promotions`
- POST `/admin/promotions`
- PUT `/admin/promotions/{id}`
- DELETE `/admin/promotions/{id}`

## ❌ CE QUI MANQUE DANS L'APP MOBILE

### 1. MODES DE LIVRAISON (CRITIQUE)
**Problème** : Le panier ne demande PAS le mode de livraison
**Impact** : Les commandes sont créées sans `consumption_mode`

**À implémenter** :
- Récupérer settings (enable_delivery, enable_takeaway, enable_onsite)
- Afficher choix dans le panier selon settings
- Ajouter `consumption_mode` dans OrderCreate

### 2. RÉSERVATIONS (SI ACTIVÉ)
**Problème** : Aucune page réservations dans l'app

**À implémenter** :
- Page "Réserver une table"
- Formulaire : date, heure, nombre de personnes, nom, téléphone
- Appel API backend (routes publiques à créer)
- Historique réservations client

### 3. CRÉNEAUX DE RETRAIT
**Problème** : Le panier ne propose pas de créneaux horaires

**À implémenter** :
- Calculer créneaux disponibles selon `order_hours`
- Tenir compte de `order_cutoff_minutes`
- Afficher sélecteur date/heure pickup

### 4. UTILISATION CASHBACK DANS PANIER
**Problème** : Panier ne propose pas d'utiliser le cashback

**À implémenter** :
- Case à cocher "Utiliser mon cashback"
- Afficher solde disponible
- Calculer réduction automatiquement
- Envoyer `use_cashback: true` au backend

### 5. MÉTHODE DE PAIEMENT
**Problème** : Panier ne demande pas la méthode

**À implémenter** :
- Sélecteur : Carte, Espèces, Ticket Restaurant, etc.
- Envoyer `payment_method` dans OrderCreate

## 📋 PLAN D'IMPLÉMENTATION COHÉRENT

### PHASE 1 : Service Settings
1. Créer `getRestaurantSettings()` 
2. Stocker dans Zustand
3. Utiliser dans toute l'app

### PHASE 2 : Panier Complet
1. Ajouter sélection mode livraison (selon settings)
2. Ajouter créneaux horaires
3. Ajouter utilisation cashback
4. Ajouter sélection paiement
5. Tout envoyer au backend

### PHASE 3 : Réservations (si enable_reservations)
1. Créer routes backend publiques
2. Créer page mobile réservation
3. Formulaire complet
4. Historique réservations

### PHASE 4 : Affichage Dynamique
1. Cacher "Livraison" si !enable_delivery
2. Cacher "Réservations" si !enable_reservations
3. Gérer is_paused (restaurant fermé)

## ✅ COHÉRENCE REQUISE

**Backend Order** nécessite :
```javascript
{
  consumption_mode: "takeaway" | "on_site" | "delivery",
  payment_method: "card" | "cash" | "ticket_resto" | "check",
  pickup_date: "2024-11-28",
  pickup_time: "12:30",
  use_cashback: true/false
}
Mobile doit envoyer : TOUT ces champs !

