# AkroBite 

AkroBite is a food ordering and delivery mobile application built for customers and food businesses in Akropong, Ghana. The app allows customers to discover restaurants, browse menus, add meals to a cart, place orders, make payments, and track their deliveries.

The project also includes a rider experience for receiving and managing delivery requests.

# Features
## Customer App
 User authentication
 Restaurant discovery
 Browse restaurants and menus
 Search for food and restaurants
 Browse food categories
 Add items to cart
 Increase/decrease item quantities
 Pay for orders using Paystack
 View previous orders
 Track order status
 Notifications
 Delivery information
 Restaurant details
 Promotions and special offers

# Rider App
 Rider dashboard
 View available delivery requests
 View order details
 Pickup and delivery locations
 View delivery earnings
 Contact customers
 Accept delivery requests
 Manage active deliveries
 Rider order notifications through WhatsApp/SMS integration
 Tech Stack

# Mobile Application
React Native
Expo
Expo Router
TypeScript
NativeWind
Tailwind CSS
Backend
Supabase
PostgreSQL
Supabase Authentication
Supabase Edge Functions
Supabase Storage
Payments
Paystack
GHS currency
Payment initialization
Payment verification
Paystack webhooks
Local Storage
AsyncStorage

# Project Structure
food-marketplace/
│
├── assets/
│   └── images/
│
├── src/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── index.tsx
│   │   │   ├── restaurants.tsx
│   │   │   ├── orders.tsx
│   │   │   └── profile.tsx
│   │   │
│   │   ├── restaurant/
│   │   │   └── [id].tsx
│   │   │
│   │   ├── category/
│   │   │   └── [category].tsx
│   │   │
│   │   ├── cart.tsx
│   │   ├── checkout.tsx
│   │   ├── payment.tsx
│   │   ├── search.tsx
│   │   ├── categories.tsx
│   │   │
│   │   ├── rider/
│   │   │   ├── ...
│   │   │   ├── order/
│   │   │   │   └── [id].tsx
│   │   │   └── active-delivery.tsx
│   │   │
│   │   └── _layout.tsx
│   │
│   ├── components/
│   │
│   ├── context/
│   │   └── CartContext.tsx
│   │
│   ├── data/
│   │   ├── restaurantMenus.ts
│   │   ├── bloomBakesMenu.ts
│   │   ├── brachersInnMenu.ts
│   │   └── kwayisibeaMenu.ts
│   │
│   └── lib/
│       ├── supabase.ts
│       └── paystack.ts
│
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   └── functions/
│       ├── initialize-payment/
│       ├── verify-payment/
│       └── paystack-webhook/
│
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md


# Design

AkroBite uses a simple food-delivery interface focused on easy navigation and quick ordering.

Primary Colors
Color	Value
Primary	#E53935
Primary Dark	#C62828
Background	#FAFAFA
White	#FFFFFF
Text	#171717
Secondary Text	#737373
Border	#E5E5E5
Surface	#F2F2F2
Success	#16A34A
Warning	#F59E0B
Error	#DC2626

# Getting Started
Prerequisites

Make sure you have installed:

Node.js
npm
Git
Expo
Android Studio if developing on Android
Supabase account
Paystack account
1. Clone the repository
git clone YOUR_REPOSITORY_URL

Then:

cd food-marketplace
2. Install dependencies
npm install
3. Configure environment variables

Create a .env file:

EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
Important

Never put your Paystack secret key in the Expo application.

The Paystack secret key belongs on the Supabase Edge Function side.

# Supabase

AkroBite uses Supabase for:

Authentication
Restaurant data
Orders
Order items
Payments
User data
Restaurant images
Server-side payment processing

The Supabase project contains:

supabase/
├── config.toml
├── migrations/
└── functions/
    ├── initialize-payment/
    │   └── index.ts
    │
    ├── verify-payment/
    │   └── index.ts
    │
    └── paystack-webhook/
        └── index.ts
# Paystack Payment Flow

The payment architecture follows this flow:

Customer
   │
   ▼
Cart
   │
   ▼
Checkout
   │
   ▼
Payment
   │
   ▼
initialize-payment
   │
   ▼
Paystack
   │
   ▼
Customer completes payment
   │
   ▼
verify-payment
   │
   ▼
Order confirmed
   │
   ▼
Rider notification

The Paystack secret key is stored as a Supabase Edge Function secret.

For example:

npx supabase secrets set PAYSTACK_SECRET_KEY=sk_test_YOUR_SECRET_KEY

Check configured secrets:

npx supabase secrets list

# Supabase Edge Functions

Deploy the payment functions with:

npx supabase functions deploy initialize-payment
npx supabase functions deploy verify-payment
npx supabase functions deploy paystack-webhook

The webhook function must be publicly accessible because Paystack needs to call it.

# Order System

Orders contain information such as:

Order
├── id
├── user_id
├── subtotal
├── delivery_fee
├── service_fee
├── total
├── delivery_option
├── status
├── payment_status
├── payment_reference
└── created_at

Individual products are stored in:

order_items
├── id
├── order_id
├── menu_item_id
├── name
├── description
├── price
├── quantity
├── restaurant_id
├── restaurant_name
└── image

# Rider Delivery System

The rider application is designed around delivery requests.

New Order
    │
    ▼
Available Riders
    │
    ├── WhatsApp
    │
    └── SMS
    │
    ▼
Rider opens AkroBite
    │
    ▼
Delivery Request
    │
    ▼
Order Details
    │
    ▼
Accept Delivery
    │
    ▼
Active Delivery
    │
    ▼
Picked Up
    │
    ▼
On The Way
    │
    ▼
Delivered

The rider order details screen displays:

Restaurant
Restaurant address
Customer
Customer address
Customer phone number
Order items
Food total
Delivery fee
Distance
Estimated delivery time
Delivery earnings

# Restaurant Menus

Restaurant menus are organized under:

src/data/

The shared menu registry is:

restaurantMenus.ts

Individual restaurant menus can be maintained separately:

bloomBakesMenu.ts
brachersInnMenu.ts
kwayisibeaMenu.ts

This allows the restaurant detail screen and category screens to reuse the same menu data.

# Restaurant Images

Restaurant images can be hosted using Supabase Storage.

The application uses the restaurant's:

image_url

rather than requiring every restaurant image to be bundled with the application.

This makes it possible to update restaurant images without publishing a new version of the mobile app.

# Authentication

AkroBite uses Supabase Authentication.

Authentication can support:

Email/password
Google
Apple

Authentication callbacks are handled through the Expo Router authentication route.

# Development

Start the Expo development server:

npx expo start

For Android:

npx expo start --android

For an Android development build:

npx expo run:android
 Useful Commands

Install dependencies:

npm install

Start Expo:

npx expo start

Run Android:

npx expo run:android

Check TypeScript:

npx tsc --noEmit

Supabase CLI:

npx supabase --version

Deploy Edge Function:

npx supabase functions deploy FUNCTION_NAME
 Security

Do not commit secrets to Git.

Never put these in React Native code:

PAYSTACK_SECRET_KEY
SUPABASE_SERVICE_ROLE_KEY

Only public Supabase credentials should be exposed to the mobile application.

Sensitive operations such as payment initialization and verification should happen inside Supabase Edge Functions.

# Roadmap
## Customer
 Authentication
 Restaurant browsing
 Menu browsing
 Categories
 Cart
 Checkout
 Payment integration
 Orders
 Real-time order tracking
 Push notifications

## Rider
 Rider screens
 Delivery request UI
 Order details UI
 Active delivery UI
 Connect rider orders to Supabase
 Rider authentication/roles
 Atomic delivery acceptance
 WhatsApp notifications
 SMS notifications
 Real-time delivery status
 Rider location tracking

## Restaurant
 Restaurant dashboard
 Restaurant order management
 Menu management
 Order status updates
 Restaurant notifications

## Contributing
Create a new branch:
git checkout -b feature/your-feature
Make your changes.
Test the application.
Commit:
git add .
git commit -m "Add your feature"
Push:
git push origin feature/your-feature
Open a pull request.

## License

This project is currently a private project. Licensing information can be added when the project is made publicly available.

# Project

AkroBite - Food delivery made easier in Akropong, Ghana.
