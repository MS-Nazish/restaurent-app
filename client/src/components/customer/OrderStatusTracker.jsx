import React from 'react';
import { CheckCircle2, Clock, CookingPot, Bike, ShoppingBag } from 'lucide-react';

const OrderStatusTracker = ({ currentStatus = 'preparing' }) => {
  // Define the steps in the restaurant order lifecycle
  const steps = [
    { id: 'placed', label: 'Order Placed', icon: Clock },
    { id: 'preparing', label: 'Preparing Food', icon: CookingPot },
    { id: 'dispatched', label: 'Out for Delivery', icon: Bike },
    { id: 'delivered', label: 'Delivered', icon: ShoppingBag },
  ];

  // Find the index of the current status to determine progress
  const currentStepIndex = steps.findIndex((step) => step.id === currentStatus);

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Track Your Order</h2>
      
      <div className="relative flex justify-between items-center w-full">
        {/* Progress Line Background */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 transition-all duration-500 ease-in-out -z-10"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1 relative">
              {/* Icon Container */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                    ? 'bg-white border-green-500 text-green-500 shadow-md scale-110'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              {/* Step Label */}
              <span
                className={`mt-3 text-sm font-medium text-center transition-colors duration-300 ${
                  isActive 
                    ? 'text-green-600 font-bold' 
                    : isCompleted 
                    ? 'text-gray-700' 
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusTracker;