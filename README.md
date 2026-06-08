# Hospital Bed Resource System 🏥

A modern web application for hospital bed and resource allocation management built with Next.js, React, and Prisma.

## Features

- **Bed Management** - Track bed availability and status across multiple wards
- **Patient Management** - Manage patient admissions, discharges, and transfers
- **Resource Tracking** - Monitor medical equipment and supplies
- **Real-time Analytics** - Dashboard with occupancy rates and statistics
- **Role-based Access** - Admin, Doctor, and Nurse roles
- **Alert System** - Critical alerts for bed availability and resource shortages
- **Activity Logging** - Track all system actions and changes

## Tech Stack

### Frontend
- **Next.js 15.1.0** - React framework
- **React 19.0.0** - UI library
- **Lucide React** - Icons
- **Chart.js** - Data visualization

### Backend
- **Next.js API Routes** - REST API
- **NextAuth 4.24.0** - Authentication

### Database
- **MySQL** - Database
- **Prisma 6.2.0** - ORM

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL database
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd hospital-system
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your database URL and auth secret
```

4. Run Prisma migrations
```bash
npx prisma migrate dev
```

5. Seed the database (optional)
```bash
npm run seed
```

6. Start the development server
```bash
npm run dev
```

Visit `http://localhost:3001` and log in with:
- Email: `admin@hospital.com`
- Password: `password123`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

## Environment Variables

Create a `.env` file with:
```
DATABASE_URL="mysql://user:password@localhost:3306/hospital_system"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3001"
```

## Project Structure

```
src/
  ├── app/
  │   ├── api/          - API routes
  │   ├── dashboard/    - Dashboard pages
  │   └── login/        - Authentication pages
  ├── components/       - Reusable components
  ├── lib/              - Utilities and configurations
  └── context/          - React context
prisma/
  ├── schema.prisma     - Database schema
  └── seed.js           - Database seeding script
```

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
