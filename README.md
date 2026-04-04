# Smart Xerox Web

A modern, AI-powered smart printing service web application built with Next.js and Node.js. Users can upload PDFs, get AI-powered optimization suggestions, and make secure UPI payments for printing services.

## 🚀 Features

### User Features
- **PDF Upload & Processing**: Upload multiple PDF files with automatic page counting
- **AI-Powered Optimization**: Get intelligent suggestions for cost savings (double-sided printing, layout optimization, color vs B/W)
- **Real-time Pricing**: Dynamic price calculation based on settings
- **Mobile-First Payment**: Direct UPI app integration for mobile users + QR code fallback
- **Order Tracking**: Track printing orders by phone number
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Admin Features
- **Secure Admin Dashboard**: JWT-protected admin panel
- **Order Management**: View and update order statuses
- **Real-time Statistics**: Revenue tracking and order analytics
- **Status Updates**: Change order status from Payment Pending → Paid → Printing → Completed

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **React Dropzone** - File upload handling
- **QRCode.react** - QR code generation
- **Recharts** - Data visualization

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **PDF-parse** - PDF processing

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd smart-xerox-web
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env  # or create manually
```

**Configure `.env` file:**
```env
PORT=5000
MONGO_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secure-random-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password
UPI_ID=your-upi-id@upi
```

**Start Backend:**
```bash
npm run dev
```
✅ Backend will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
# Add your environment variables
```

**Configure `.env.local` file:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_UPI_ID=your-upi-id@upi
```

**Start Frontend:**
```bash
npm run dev
```
✅ Frontend will run on `http://localhost:3000`

## 📖 Usage

### For Users
1. **Visit** `http://localhost:3000`
2. **Upload PDFs** - Drag & drop or click to select files
3. **Enter Details** - Name and 10-digit phone number
4. **Configure Settings** - Color/BW, single/double-sided, copies, layout
5. **Review AI Suggestions** - Apply optimizations to save costs
6. **Make Payment** - Use UPI app (mobile) or scan QR code
7. **Track Order** - Use phone number to check status

### For Admins
1. **Visit** `http://localhost:3000/admin`
2. **Login** with admin credentials
3. **View Dashboard** - See orders, revenue, statistics
4. **Update Order Status** - Change order progress
5. **Monitor Operations** - Track printing workflow

## 🔗 API Endpoints

### Public Endpoints
- `POST /upload` - Upload PDF files
- `POST /orders` - Create new order
- `PUT /orders/:id/status` - Update order status (payment completion)
- `GET /orders/track/:phone` - Track orders by phone

### Admin Endpoints (Protected)
- `POST /admin/login` - Admin authentication
- `GET /admin/stats` - Dashboard statistics
- `GET /admin/orders` - All orders list

## 🔐 Security Features

- **JWT Authentication** for admin panel
- **Environment Variables** for sensitive data
- **Input Validation** on all forms
- **File Upload Restrictions** (PDF only)
- **CORS Protection**
- **Rate Limiting** ready for production

## 📱 Mobile Optimization

- **Direct UPI Integration** - Opens payment apps directly on mobile
- **Responsive Design** - Works on all screen sizes
- **Touch-Friendly** - Optimized for mobile interactions
- **Progressive Web App** ready

## 🤖 AI Features

- **Smart Cost Optimization** - Suggests best printing settings
- **Layout Recommendations** - 1/2 or 1/4 page layouts for savings
- **Color Detection** - Recommends B/W for text documents
- **Page Analysis** - Automatic page counting and processing

## 🚀 Deployment

### Backend Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

**Recommended Platforms:**
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, Heroku
- **Database**: MongoDB Atlas

## 🔧 Development

### Available Scripts

**Backend:**
```bash
npm run dev      # Development server with nodemon
npm start        # Production server
npm test         # Run tests
```

**Frontend:**
```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Production server
npm run lint     # ESLint check
```

### Project Structure
```
smart-xerox-web/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # Helper functions
│   ├── uploads/         # File storage
│   └── index.js         # Server entry point
└── frontend/
    ├── src/
    │   ├── app/         # Next.js app router
    │   ├── components/  # Reusable components
    │   └── ...          # Other source files
    └── public/          # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 📞 Support

For support, email support@smartxerox.com or create an issue in this repository.

---

**Built with ❤️ for efficient, smart printing services**