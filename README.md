# Hospital Bed Resource System 🏥

A comprehensive web application for managing hospital bed allocation, patient tracking, and resource management. Built with modern tech stack for scalability and real-time updates.

## 🎯 Overview

The Hospital Bed Resource System is designed to streamline hospital operations by providing:
- **Real-time bed availability tracking** across multiple wards
- **Patient admission/discharge management** with easy transfers
- **Medical resource inventory** monitoring
- **Role-based access control** for different staff members
- **Critical alerts system** for resource shortages
- **Analytics dashboard** with occupancy metrics
- **Activity logging** for audit trails

## 📋 Features

### 👥 Role-Based Access
- **Admin** - Full system access, user management
- **Doctor** - Patient management, bed allocation
- **Nurse** - Patient care, resource tracking

### 🏢 Bed Management
- Track bed status (Available, Occupied, Maintenance, Reserved)
- View beds by ward and type (Regular, ICU, Pediatric, Maternity, Emergency)
- Real-time occupancy visualization
- Bed transfer and status updates

### 👨‍⚕️ Patient Management
- Admit/discharge patients
- Track patient vital information (age, diagnosis, priority)
- Manage patient transfers between wards
- View patient history and notes

### 📦 Resource Management
- Monitor medical equipment and supplies
- Track resource availability
- Update resource counts
- Alert system for low resources

### 📊 Analytics & Reporting
- Occupancy rate charts
- Ward-wise breakdown
- Resource utilization statistics
- PDF report generation
- Activity logs for compliance

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 15.1.0, React 19.0.0, Tailwind CSS |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | MySQL with Prisma ORM |
| **Authentication** | NextAuth.js 4.24.0 |
| **Charts** | Chart.js, React-ChartJS-2 |
| **Security** | bcryptjs for password hashing |
| **Icons** | Lucide React |

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** 9.0.0 or higher (comes with Node.js)
- **MySQL** 8.0 or higher ([Download](https://www.mysql.com/downloads/))
- **Git** ([Download](https://git-scm.com/))

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/abhixt244/hospital-system.git
cd hospital-system
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages from `package.json`:
- Next.js, React, and dependencies
- Prisma for database management
- NextAuth for authentication
- Chart.js for visualizations

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
# Format: mysql://username:password@host:port/database_name
DATABASE_URL="mysql://root:your_password@localhost:3306/hospital_system"

# NextAuth Configuration
# Generate a random secret key for security
NEXTAUTH_SECRET="generate-a-random-secret-key-here"

# NextAuth URL (where your app is hosted)
NEXTAUTH_URL="http://localhost:3001"
```

**How to generate NEXTAUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Create MySQL Database

```bash
mysql -u root -p
CREATE DATABASE hospital_system;
EXIT;
```

### Step 5: Run Prisma Migrations

This creates all database tables based on the schema:

```bash
npx prisma migrate dev --name init
```

### Step 6: Seed Sample Data (Optional)

Populate the database with sample data for testing:

```bash
npm run seed
```

This creates:
- 3 users (Admin, Doctor, Nurse)
- 5 wards with 48 beds
- 18 sample patients
- 8 resources
- Sample alerts and activity logs

### Step 7: Start the Development Server

```bash
npm run dev
```

The application will start at: **http://localhost:3001**

## 🔐 Default Login Credentials

After seeding, use these to log in:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@hospital.com` | `password123` |
| Doctor | `doctor@hospital.com` | `password123` |
| Nurse | `nurse@hospital.com` | `password123` |

> ⚠️ **Important**: Change these passwords in production!

## 📖 Usage Guide

### 1. Dashboard
The main dashboard shows:
- Bed occupancy overview (charts)
- Ward-wise bed distribution
- Recent activity feed
- Quick access to management sections

### 2. Bed Management
- View all beds with their current status
- See which beds are occupied and by whom
- Change bed status (Available → Maintenance)
- Filter beds by ward type

### 3. Patient Management
- Admit new patients
- View active patients
- Discharge patients
- Transfer patients between wards
- View patient history

### 4. Resource Management
- Track medical equipment and supplies
- Update inventory levels
- Get alerts when resources are low
- View resource utilization

### 5. Analytics
- View occupancy trends
- Generate occupancy reports
- Export data as PDF
- Analyze ward performance

## 🏗 Project Structure

```
hospital-system/
├── src/
│   ├── app/
│   │   ├── api/                    # REST API endpoints
│   │   │   ├── beds/              # Bed management APIs
│   │   │   ├── patients/          # Patient management APIs
│   │   │   ├── resources/         # Resource management APIs
│   │   │   ├── auth/              # Authentication APIs
│   │   │   ├── dashboard/         # Dashboard data APIs
│   │   │   └── [other routes]
│   │   ├── dashboard/             # Main dashboard pages
│   │   │   ├── beds/              # Bed management page
│   │   │   ├── patients/          # Patient management page
│   │   │   ├── resources/         # Resource management page
│   │   │   └── page.js            # Dashboard home
│   │   ├── login/                 # Login page
│   │   ├── layout.js              # Root layout
│   │   ├── globals.css            # Global styles
│   │   └── providers.js           # NextAuth providers
│   ├── components/                # Reusable components
│   │   ├── StatsCard.js          # Statistics cards
│   │   ├── OccupancyChart.js     # Chart visualizations
│   │   ├── PatientForm.js        # Patient forms
│   │   ├── BedGrid.js            # Bed display grid
│   │   └── [other components]
│   ├── lib/                       # Utilities
│   │   ├── prisma.js             # Prisma client
│   │   ├── auth.js               # Auth configuration
│   │   └── utils.js              # Helper functions
│   └── context/                  # React context
│       └── ToastContext.js       # Toast notifications
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.js                   # Sample data seeding
├── public/                        # Static files
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies
└── README.md                      # This file
```

## 📚 Available Scripts

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Seed database with sample data
npm run seed

# Open Prisma Studio (database GUI)
npx prisma studio
```

## 🔧 Configuration Files

### `next.config.js`
Next.js configuration for optimization and deployment settings.

### `jsconfig.json`
Path aliases and JavaScript configuration for cleaner imports.

### `prisma/schema.prisma`
Database schema defining all models and relationships.

## 🚨 Troubleshooting

### Issue: Database Connection Error
```
Error: Cannot connect to database
```
**Solution:**
1. Ensure MySQL is running: `mysql -u root -p`
2. Check DATABASE_URL in `.env`
3. Verify database exists: `SHOW DATABASES;`
4. Run migrations: `npx prisma migrate dev`

### Issue: Port 3001 Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution:**
```bash
# Find process using port 3001 and kill it
# On Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force

# On macOS/Linux:
lsof -ti:3001 | xargs kill -9
```

### Issue: Prisma Migration Error
```
Error: Migration could not be confirmed
```
**Solution:**
```bash
npx prisma migrate resolve --rolled-back "initial_migration"
npx prisma migrate dev --name init
```

### Issue: NextAuth Secret Not Set
```
Error: NEXTAUTH_SECRET is required
```
**Solution:** Generate and add to `.env`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📊 Database Schema

Key models in the system:

### User
- Admin, Doctor, Nurse roles
- Email-based authentication
- Password hashing with bcrypt

### Ward
- Hospital wards (ICU, General, Pediatrics, Maternity, Emergency)
- Multiple floors
- Total bed count

### Bed
- Belongs to a ward
- Status tracking (Available, Occupied, Maintenance, Reserved)
- Bed type classification
- Current patient assignment

### Patient
- Personal information
- Diagnosis and priority level
- Admission/discharge dates
- Assigned bed and doctor
- Medical notes

### Resource
- Equipment and supplies tracking
- Total and available counts
- Category classification

### Alert
- System alerts for critical situations
- Priority levels
- Resolution tracking

## 🔐 Security Features

- ✅ Password hashing with bcryptjs
- ✅ Session-based authentication with NextAuth
- ✅ Role-based access control (RBAC)
- ✅ Environment variables for sensitive data
- ✅ Activity logging for audit trails
- ✅ CSRF protection with NextAuth

## 📈 Performance Optimization

- Server-side data fetching with Prisma
- Optimized API endpoints with aggregations
- React component memoization
- CSS-in-JS for minimal bundle size
- Database indexing on frequently queried fields

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🆘 Support & Issues

- 📧 Email: support@example.com
- 🐛 Report bugs: [GitHub Issues](https://github.com/abhixt244/hospital-system/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/abhixt244/hospital-system/discussions)

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [React Documentation](https://react.dev/)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Prisma](https://www.prisma.io/)
- Authentication with [NextAuth.js](https://next-auth.js.org/)
- Icons from [Lucide React](https://lucide.dev/)

## 📞 Contact

- GitHub: [@abhixt244](https://github.com/abhixt244)
- Project Link: [hospital-system](https://github.com/abhixt244/hospital-system)

---

**Made with ❤️ for better hospital management**
