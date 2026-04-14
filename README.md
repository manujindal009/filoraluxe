# Filora Luxe - Premium Handcrafted Ecommerce

Filora Luxe is a high-performance, minimalist ecommerce platform designed for luxury handcrafted products. Built with a modern tech stack (Next.js 14, Supabase, Tailwind CSS), it offers a seamless shopping experience with real-time inventory management, dynamic promotional systems, and secure payment processing.

---

## 🌟 Key Features

### 🛍️ Customer Experience
- **Premium Discovery**: Smooth, high-performance product browsing with category-specific filtering.
- **Dynamic Cart**: Real-time cart updates with support for gift wrapping and complex discount logic.
- **Advanced Checkout**: Multi-step checkout flow supporting both **Cash on Delivery (COD)** and **Razorpay** digital payments.
- **Order Tracking**: Comprehensive profile section for users to view order history and download detailed invoices.
- **Smart Promotions**: Robust coupon system including percentage discounts and free shipping overrides (`FILORASHIP`).

### 🛡️ Core Infrastructure
- **Server-Side Excellence**: Next.js App Router for optimized SEO and sub-second page loads.
- **Secure Backend**: Supabase PostgreSQL with Row Level Security (RLS) to protect user data.
- **Automated Communication**: Transactional order confirmation emails powered by **Resend**.
- **Edge Functions**: Optimized Next.js API routes for secure payment verification.

### 📊 Administrative Suite
- **Management Dashboard**: Real-time sales analytics and inventory tracking.
- **Inventory Control**: Comprehensive CMS for managing products, categories (Clips, Hairbands, etc.), and stock levels.
- **Promotion Management**: Dashboard for creating and tracking specialized coupons.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/)
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **State Management**: React Context API
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Payments**: [Razorpay SDK](https://razorpay.com/)
- **Emails**: [Resend](https://resend.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm / yarn / pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/manujindal009/filoraluxe.git
   cd filoraluxe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   
   RESEND_API_KEY=your_resend_key
   ```

4. **Database Configuration**
   Execute the migration scripts located in `database/supabase/supabase_schema.sql` within your Supabase SQL Editor to set up the tables and RLS policies.

5. **Run Locally**
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

- `/app`: Next.js App Router (Pages, API Routes)
- `/components`: Reusable UI components and feature-specific layouts
- `/lib`: Supabase clients, utility functions, and API wrappers
- `/context`: Global state management (Auth, Cart, Toast)
- `/database/supabase`: PostgreSQL migration and setup scripts
- `/types`: TypeScript interface definitions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Manu Jindal**
- GitHub: [@manujindal009](https://github.com/manujindal009)
