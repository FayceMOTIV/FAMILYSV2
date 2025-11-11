import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, MapPin, Clock, Check, ShoppingBag, Utensils, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from '../hooks/use-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, user, completeOrder, loyaltyStamps } = useApp();
  const [step, setStep] = useState(1);
  const [orderData, setOrderData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    consumptionMode: '', // à emporter, sur place
    pickupDate: '',
    pickupTime: '',
    paymentMethod: 'card',
    specialInstructions: ''
  });

  const total = getCartTotal();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Votre panier est vide
          </h2>
          <Button
            onClick={() => navigate('/menu')}
            className="bg-gradient-to-r from-[#C62828] to-[#8B0000] text-white"
          >
            Découvrir le menu
          </Button>
        </div>
      </div>
    );
  }

  const handleInputChange = (field, value) => {
    setOrderData({ ...orderData, [field]: value });
  };

  const validateStep = () => {
    if (step === 1) {
      if (!orderData.consumptionMode) {
        toast({
          title: 'Mode de consommation manquant',
          description: 'Choisissez comment vous souhaitez consommer',
          variant: 'destructive'
        });
        return false;
      }
    }
    if (step === 2) {
      if (!orderData.pickupDate || !orderData.pickupTime) {
        toast({
          title: 'Date/Heure manquante',
          description: 'Veuillez sélectionner une date et heure',
          variant: 'destructive'
        });
        return false;
      }
    }
    if (step === 3) {
      if (!orderData.name || !orderData.email || !orderData.phone) {
        toast({
          title: 'Informations manquantes',
          description: 'Veuillez remplir tous les champs',
          variant: 'destructive'
        });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handlePlaceOrder = () => {
    // Simulate payment processing
    toast({
      title: 'Commande en cours...',
      description: 'Traitement de votre paiement'
    });

    setTimeout(() => {
      completeOrder();
      toast({
        title: 'Commande confirmée !',
        description: `Vous avez gagné un tampon ! (${loyaltyStamps + 1}/10)`,
      });
      navigate('/profile');
    }, 1500);
  };

  const timeSlots = [
    '18:00', '18:15', '18:30', '18:45',
    '19:00', '19:15', '19:30', '19:45',
    '20:00', '20:15', '20:30', '20:45',
    '21:00', '21:15', '21:30', '21:45'
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => step === 1 ? navigate(-1) : setStep(step - 1)}
            className="flex items-center text-[#C62828] dark:text-[#FFD54F] hover:underline font-semibold"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Retour
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    s <= step
                      ? 'bg-[#C62828] text-white scale-110'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {s < step ? <Check className="w-6 h-6" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                      s < step ? 'bg-[#C62828]' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
            <span>Mode</span>
            <span>Date/Heure</span>
            <span>Infos</span>
            <span>Paiement</span>
          </div>
        </div>

        {/* Step 1: Consumption Mode */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <Utensils className="w-6 h-6 mr-3 text-[#C62828] dark:text-[#FFD54F]" />
                Mode de consommation
              </h2>
              <div className="space-y-4">
                <button
                  onClick={() => handleInputChange('consumptionMode', 'takeaway')}
                  className={`w-full flex items-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                    orderData.consumptionMode === 'takeaway'
                      ? 'border-[#C62828] bg-[#C62828]/10 dark:bg-[#C62828]/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#C62828]'
                  }`}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#C62828] to-[#8B0000] rounded-2xl flex items-center justify-center mr-4">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-lg text-gray-800 dark:text-white">À emporter</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Récupérez votre commande au comptoir</div>
                  </div>
                  {orderData.consumptionMode === 'takeaway' && (
                    <Check className="w-6 h-6 text-[#C62828] dark:text-[#FFD54F]" />
                  )}
                </button>

                <button
                  onClick={() => handleInputChange('consumptionMode', 'dine-in')}
                  className={`w-full flex items-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                    orderData.consumptionMode === 'dine-in'
                      ? 'border-[#C62828] bg-[#C62828]/10 dark:bg-[#C62828]/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#C62828]'
                  }`}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#FFD54F] to-[#FFC107] rounded-2xl flex items-center justify-center mr-4">
                    <Utensils className="w-7 h-7 text-[#121212]" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-lg text-gray-800 dark:text-white">Sur place</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Consommez directement au restaurant</div>
                  </div>
                  {orderData.consumptionMode === 'dine-in' && (
                    <Check className="w-6 h-6 text-[#C62828] dark:text-[#FFD54F]" />
                  )}
                </button>

                <button
                  onClick={() => handleInputChange('consumptionMode', 'delivery')}
                  className={`w-full flex items-center p-6 rounded-2xl border-2 transition-all duration-300 opacity-60 cursor-not-allowed`}
                  disabled
                >
                  <div className="w-14 h-14 bg-gray-300 dark:bg-gray-700 rounded-2xl flex items-center justify-center mr-4">
                    <ShoppingBag className="w-7 h-7 text-gray-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-lg text-gray-500 dark:text-gray-600">Livraison</div>
                    <div className="text-sm text-gray-400 dark:text-gray-500">Bientôt disponible</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-[#C62828] dark:text-[#FFD54F]" />
                Date et heure de {orderData.consumptionMode === 'dine-in' ? 'réservation' : 'retrait'}
              </h2>
              
              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Choisissez la date
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(() => {
                    const dates = [];
                    for (let i = 0; i < 7; i++) {
                      const date = new Date();
                      date.setDate(date.getDate() + i);
                      const dateStr = date.toISOString().split('T')[0];
                      const dayName = i === 0 ? "Aujourd'hui" : i === 1 ? 'Demain' : date.toLocaleDateString('fr-FR', { weekday: 'short' });
                      const dayNum = date.getDate();
                      const month = date.toLocaleDateString('fr-FR', { month: 'short' });
                      
                      dates.push(
                        <button
                          key={dateStr}
                          onClick={() => handleInputChange('pickupDate', dateStr)}
                          className={`p-4 rounded-2xl font-semibold transition-all duration-300 ${
                            orderData.pickupDate === dateStr
                              ? 'bg-[#C62828] text-white scale-105 shadow-lg'
                              : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="text-xs opacity-80">{dayName}</div>
                          <div className="text-2xl font-black">{dayNum}</div>
                          <div className="text-xs">{month}</div>
                        </button>
                      );
                    }
                    return dates;
                  })()}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Choisissez l'heure
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleInputChange('pickupTime', time)}
                      className={`p-4 rounded-xl font-semibold transition-all duration-300 ${
                        orderData.pickupTime === time
                          ? 'bg-[#C62828] text-white scale-105 shadow-lg'
                          : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#FFD54F]/20 rounded-xl">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>📍 Adresse:</strong><br />
                  123 Avenue de la République, 01000 Bourg-en-Bresse
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Contact Info */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <MapPin className="w-6 h-6 mr-3 text-[#C62828] dark:text-[#FFD54F]" />
                Vos coordonnées
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nom complet *
                  </label>
                  <Input
                    type="text"
                    value={orderData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={orderData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="jean.dupont@example.com"
                    className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone *
                  </label>
                  <Input
                    type="tel"
                    value={orderData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <CreditCard className="w-6 h-6 mr-3 text-[#C62828] dark:text-[#FFD54F]" />
                Mode de paiement
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleInputChange('paymentMethod', 'card')}
                  className={`w-full flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-300 ${
                    orderData.paymentMethod === 'card'
                      ? 'border-[#C62828] bg-[#C62828]/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#C62828]'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <CreditCard className="w-6 h-6 text-[#C62828] dark:text-[#FFD54F]" />
                    <div className="text-left">
                      <div className="font-bold text-gray-800 dark:text-white">Carte bancaire</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Stripe (CB, Apple Pay, Google Pay)</div>
                    </div>
                  </div>
                  {orderData.paymentMethod === 'card' && (
                    <Check className="w-6 h-6 text-[#C62828] dark:text-[#FFD54F]" />
                  )}
                </button>
                <button
                  onClick={() => handleInputChange('paymentMethod', 'onsite')}
                  className={`w-full flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-300 ${
                    orderData.paymentMethod === 'onsite'
                      ? 'border-[#C62828] bg-[#C62828]/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#C62828]'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">💵</div>
                    <div className="text-left">
                      <div className="font-bold text-gray-800 dark:text-white">Paiement sur place</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Espèces ou CB au retrait</div>
                    </div>
                  </div>
                  {orderData.paymentMethod === 'onsite' && (
                    <Check className="w-6 h-6 text-[#C62828] dark:text-[#FFD54F]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Récapitulatif</h3>
          
          {/* Order Details Summary */}
          {step > 1 && orderData.consumptionMode && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-[#0f0f0f] rounded-2xl space-y-2">
              <div className="flex items-center text-sm">
                <Utensils className="w-4 h-4 mr-2 text-[#C62828] dark:text-[#FFD54F]" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {orderData.consumptionMode === 'takeaway' ? 'À emporter' : 'Sur place'}
                </span>
              </div>
              {orderData.pickupDate && orderData.pickupTime && (
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 text-[#C62828] dark:text-[#FFD54F]" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(orderData.pickupDate).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })} à {orderData.pickupTime}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Cart Items */}
          <div className="space-y-3 mb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {item.totalPrice.toFixed(2)}€
                </span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800 dark:text-white">Total</span>
            <span className="text-3xl font-bold text-[#C62828] dark:text-[#FFD54F]">
              {total.toFixed(2)}€
            </span>
          </div>
          
          {total >= 8 && (
            <div className="mt-4 p-4 bg-[#FFD54F]/20 rounded-xl">
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                🎫 +{(total * 0.05).toFixed(2)}€ cashback (5%) sur cette commande !
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={step === 4 ? handlePlaceOrder : handleNext}
          className="w-full bg-gradient-to-r from-[#C62828] to-[#8B0000] hover:from-[#8B0000] hover:to-[#C62828] text-white py-8 rounded-2xl text-xl font-bold shadow-2xl transition-all duration-300 active:scale-95"
        >
          {step === 4 ? 'Confirmer la commande' : 'Continuer'}
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
