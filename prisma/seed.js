const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🏥 Starting Hospital System seed...\n');

  // ============================================================
  // 1. Create Users
  // ============================================================
  console.log('👤 Creating users...');

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@hospital.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@hospital.com',
        password: bcrypt.hashSync('password123', 10),
        role: 'ADMIN',
      },
    }),
    prisma.user.upsert({
      where: { email: 'doctor@hospital.com' },
      update: {},
      create: {
        name: 'Dr. Sarah Wilson',
        email: 'doctor@hospital.com',
        password: bcrypt.hashSync('password123', 10),
        role: 'DOCTOR',
      },
    }),
    prisma.user.upsert({
      where: { email: 'nurse@hospital.com' },
      update: {},
      create: {
        name: 'Nurse James',
        email: 'nurse@hospital.com',
        password: bcrypt.hashSync('password123', 10),
        role: 'NURSE',
      },
    }),
  ]);

  console.log(`   ✅ Created ${users.length} users`);

  // ============================================================
  // 2. Create Wards
  // ============================================================
  console.log('🏢 Creating wards...');

  const wardData = [
    { name: 'ICU', floor: 2, totalBeds: 10 },
    { name: 'General Ward', floor: 1, totalBeds: 15 },
    { name: 'Pediatrics', floor: 3, totalBeds: 8 },
    { name: 'Maternity', floor: 3, totalBeds: 7 },
    { name: 'Emergency', floor: 1, totalBeds: 8 },
  ];

  const wards = await Promise.all(
    wardData.map((ward) =>
      prisma.ward.upsert({
        where: { name: ward.name },
        update: {},
        create: ward,
      })
    )
  );

  console.log(`   ✅ Created ${wards.length} wards`);

  // ============================================================
  // 3. Create Beds for each Ward
  // ============================================================
  console.log('🛏️  Creating beds...');

  const bedPrefixes = {
    'ICU': { prefix: 'ICU', type: 'ICU' },
    'General Ward': { prefix: 'GEN', type: 'REGULAR' },
    'Pediatrics': { prefix: 'PED', type: 'PEDIATRIC' },
    'Maternity': { prefix: 'MAT', type: 'MATERNITY' },
    'Emergency': { prefix: 'ER', type: 'EMERGENCY' },
  };

  let totalBedsCreated = 0;

  for (const ward of wards) {
    const { prefix, type } = bedPrefixes[ward.name];

    for (let i = 1; i <= ward.totalBeds; i++) {
      const bedNumber = `${prefix}-${String(i).padStart(2, '0')}`;
      await prisma.bed.upsert({
        where: { bedNumber },
        update: {},
        create: {
          wardId: ward.id,
          bedNumber,
          status: 'AVAILABLE',
          bedType: type,
        },
      });
      totalBedsCreated++;
    }
  }

  console.log(`   ✅ Created ${totalBedsCreated} beds across ${wards.length} wards`);

  // ============================================================
  // 4. Create Patients
  // ============================================================
  console.log('🧑‍⚕️ Creating patients...');

  // Get some bed IDs for assigning patients
  const availableBeds = await prisma.bed.findMany({
    where: { status: 'AVAILABLE' },
    take: 12,
    orderBy: { id: 'asc' },
  });

  const patientData = [
    // Admitted patients (assigned to beds)
    {
      name: 'Rajesh Kumar',
      age: 45,
      gender: 'MALE',
      contact: '+91-9876543210',
      diagnosis: 'Acute Myocardial Infarction',
      status: 'ADMITTED',
      priority: 'CRITICAL',
      doctor: 'Dr. Sarah Wilson',
      notes: 'Patient admitted with severe chest pain. Requires continuous monitoring.',
      bedId: availableBeds[0]?.id,
    },
    {
      name: 'Priya Sharma',
      age: 32,
      gender: 'FEMALE',
      contact: '+91-9876543211',
      diagnosis: 'Pneumonia',
      status: 'ADMITTED',
      priority: 'HIGH',
      doctor: 'Dr. Sarah Wilson',
      notes: 'Bilateral pneumonia. Started on IV antibiotics.',
      bedId: availableBeds[1]?.id,
    },
    {
      name: 'Amit Patel',
      age: 58,
      gender: 'MALE',
      contact: '+91-9876543212',
      diagnosis: 'Type 2 Diabetes - Uncontrolled',
      status: 'ADMITTED',
      priority: 'MEDIUM',
      doctor: 'Dr. Arun Mehta',
      notes: 'Blood sugar levels critical. Insulin therapy initiated.',
      bedId: availableBeds[2]?.id,
    },
    {
      name: 'Sunita Devi',
      age: 67,
      gender: 'FEMALE',
      contact: '+91-9876543213',
      diagnosis: 'Fractured Hip - Post Surgery',
      status: 'ADMITTED',
      priority: 'MEDIUM',
      doctor: 'Dr. Vikram Singh',
      notes: 'Post-operative care. Physiotherapy scheduled.',
      bedId: availableBeds[3]?.id,
    },
    {
      name: 'Arjun Reddy',
      age: 8,
      gender: 'MALE',
      contact: '+91-9876543214',
      diagnosis: 'Dengue Fever',
      status: 'ADMITTED',
      priority: 'HIGH',
      doctor: 'Dr. Meera Nair',
      notes: 'Platelet count dropping. Close monitoring required.',
      bedId: availableBeds[4]?.id,
    },
    {
      name: 'Kavitha Menon',
      age: 28,
      gender: 'FEMALE',
      contact: '+91-9876543215',
      diagnosis: 'Normal Delivery - Post Partum',
      status: 'ADMITTED',
      priority: 'LOW',
      doctor: 'Dr. Lakshmi Iyer',
      notes: 'Mother and baby doing well. Discharge planned tomorrow.',
      bedId: availableBeds[5]?.id,
    },
    {
      name: 'Mohammed Irfan',
      age: 52,
      gender: 'MALE',
      contact: '+91-9876543216',
      diagnosis: 'Chronic Kidney Disease Stage 4',
      status: 'ADMITTED',
      priority: 'CRITICAL',
      doctor: 'Dr. Sarah Wilson',
      notes: 'Dialysis scheduled. Awaiting nephrology consult.',
      bedId: availableBeds[6]?.id,
    },
    {
      name: 'Deepa Krishnan',
      age: 41,
      gender: 'FEMALE',
      contact: '+91-9876543217',
      diagnosis: 'Appendicitis - Post Appendectomy',
      status: 'ADMITTED',
      priority: 'LOW',
      doctor: 'Dr. Vikram Singh',
      notes: 'Surgery successful. Recovery progressing well.',
      bedId: availableBeds[7]?.id,
    },
    {
      name: 'Suresh Babu',
      age: 73,
      gender: 'MALE',
      contact: '+91-9876543218',
      diagnosis: 'COPD Exacerbation',
      status: 'ADMITTED',
      priority: 'HIGH',
      doctor: 'Dr. Arun Mehta',
      notes: 'On nebulization and oxygen support. SpO2 fluctuating.',
      bedId: availableBeds[8]?.id,
    },
    {
      name: 'Ananya Gupta',
      age: 5,
      gender: 'FEMALE',
      contact: '+91-9876543219',
      diagnosis: 'Acute Gastroenteritis',
      status: 'ADMITTED',
      priority: 'MEDIUM',
      doctor: 'Dr. Meera Nair',
      notes: 'Severe dehydration. IV fluids administered.',
      bedId: availableBeds[9]?.id,
    },
    {
      name: 'Venkatesh Rao',
      age: 61,
      gender: 'MALE',
      contact: '+91-9876543220',
      diagnosis: 'Stroke - Left Hemiparesis',
      status: 'ADMITTED',
      priority: 'CRITICAL',
      doctor: 'Dr. Sarah Wilson',
      notes: 'CT scan shows ischemic stroke. Thrombolysis administered.',
      bedId: availableBeds[10]?.id,
    },
    {
      name: 'Fatima Begum',
      age: 35,
      gender: 'FEMALE',
      contact: '+91-9876543221',
      diagnosis: 'Cesarean Section - Post Operative',
      status: 'ADMITTED',
      priority: 'MEDIUM',
      doctor: 'Dr. Lakshmi Iyer',
      notes: 'C-section performed successfully. Baby in NICU for observation.',
      bedId: availableBeds[11]?.id,
    },
    // Discharged patients (no bed assigned)
    {
      name: 'Ravi Shankar',
      age: 39,
      gender: 'MALE',
      contact: '+91-9876543222',
      diagnosis: 'Malaria - P. Vivax',
      status: 'DISCHARGED',
      priority: 'MEDIUM',
      doctor: 'Dr. Arun Mehta',
      notes: 'Completed treatment course. Follow-up in 2 weeks.',
      bedId: null,
      admittedAt: new Date('2026-05-20T08:00:00Z'),
      dischargedAt: new Date('2026-05-25T14:00:00Z'),
    },
    {
      name: 'Lakshmi Narayan',
      age: 55,
      gender: 'FEMALE',
      contact: '+91-9876543223',
      diagnosis: 'Gallbladder Stones - Post Cholecystectomy',
      status: 'DISCHARGED',
      priority: 'LOW',
      doctor: 'Dr. Vikram Singh',
      notes: 'Laparoscopic cholecystectomy successful. Diet advice given.',
      bedId: null,
      admittedAt: new Date('2026-05-18T10:30:00Z'),
      dischargedAt: new Date('2026-05-22T11:00:00Z'),
    },
    {
      name: 'Karthik Subramanian',
      age: 22,
      gender: 'MALE',
      contact: '+91-9876543224',
      diagnosis: 'Road Traffic Accident - Multiple Fractures',
      status: 'DISCHARGED',
      priority: 'HIGH',
      doctor: 'Dr. Vikram Singh',
      notes: 'Stabilized and fractures set. Referred to orthopedic OPD.',
      bedId: null,
      admittedAt: new Date('2026-05-10T03:15:00Z'),
      dischargedAt: new Date('2026-05-20T09:00:00Z'),
    },
    {
      name: 'Neha Joshi',
      age: 29,
      gender: 'FEMALE',
      contact: '+91-9876543225',
      diagnosis: 'Severe Allergic Reaction - Anaphylaxis',
      status: 'DISCHARGED',
      priority: 'CRITICAL',
      doctor: 'Dr. Sarah Wilson',
      notes: 'Epinephrine administered. Recovered fully. Allergy testing recommended.',
      bedId: null,
      admittedAt: new Date('2026-05-26T19:45:00Z'),
      dischargedAt: new Date('2026-05-27T16:00:00Z'),
    },
    {
      name: 'Gopal Verma',
      age: 48,
      gender: 'MALE',
      contact: '+91-9876543226',
      diagnosis: 'Peptic Ulcer Disease',
      status: 'DISCHARGED',
      priority: 'MEDIUM',
      doctor: 'Dr. Arun Mehta',
      notes: 'Endoscopy performed. PPI therapy prescribed for 8 weeks.',
      bedId: null,
      admittedAt: new Date('2026-05-22T07:00:00Z'),
      dischargedAt: new Date('2026-05-26T10:30:00Z'),
    },
    {
      name: 'Meena Kumari',
      age: 63,
      gender: 'FEMALE',
      contact: '+91-9876543227',
      diagnosis: 'Hypertensive Crisis',
      status: 'DISCHARGED',
      priority: 'HIGH',
      doctor: 'Dr. Sarah Wilson',
      notes: 'BP stabilized with IV medications. Oral antihypertensives adjusted.',
      bedId: null,
      admittedAt: new Date('2026-05-24T13:20:00Z'),
      dischargedAt: new Date('2026-05-28T08:00:00Z'),
    },
  ];

  const createdPatients = [];
  for (const patient of patientData) {
    const created = await prisma.patient.create({
      data: {
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        contact: patient.contact,
        diagnosis: patient.diagnosis,
        status: patient.status,
        priority: patient.priority,
        doctor: patient.doctor,
        notes: patient.notes,
        bedId: patient.bedId || undefined,
        admittedAt: patient.admittedAt || new Date(),
        dischargedAt: patient.dischargedAt || undefined,
      },
    });
    createdPatients.push(created);

    // Mark the bed as occupied if patient is assigned
    if (patient.bedId) {
      await prisma.bed.update({
        where: { id: patient.bedId },
        data: { status: 'OCCUPIED' },
      });
    }
  }

  // Also set a couple of beds to MAINTENANCE and RESERVED
  const maintenanceBeds = await prisma.bed.findMany({
    where: { status: 'AVAILABLE' },
    take: 3,
    skip: 5,
  });

  if (maintenanceBeds.length >= 3) {
    await prisma.bed.update({
      where: { id: maintenanceBeds[0].id },
      data: { status: 'MAINTENANCE' },
    });
    await prisma.bed.update({
      where: { id: maintenanceBeds[1].id },
      data: { status: 'MAINTENANCE' },
    });
    await prisma.bed.update({
      where: { id: maintenanceBeds[2].id },
      data: { status: 'RESERVED' },
    });
  }

  console.log(`   ✅ Created ${createdPatients.length} patients (${patientData.filter(p => p.bedId).length} admitted, ${patientData.filter(p => !p.bedId).length} discharged)`);

  // ============================================================
  // 5. Create Resources
  // ============================================================
  console.log('📦 Creating resources...');

  const resourceData = [
    { name: 'Ventilators', category: 'equipment', total: 25, available: 8, icon: 'wind' },
    { name: 'Oxygen Cylinders', category: 'supply', total: 50, available: 15, icon: 'cylinder' },
    { name: 'Defibrillators', category: 'equipment', total: 10, available: 4, icon: 'zap' },
    { name: 'Wheelchairs', category: 'equipment', total: 30, available: 12, icon: 'accessibility' },
    { name: 'IV Pumps', category: 'equipment', total: 40, available: 18, icon: 'droplets' },
    { name: 'Heart Monitors', category: 'equipment', total: 20, available: 6, icon: 'heart-pulse' },
    { name: 'Blood Units', category: 'supply', total: 100, available: 45, icon: 'droplet' },
    { name: 'Surgical Kits', category: 'supply', total: 15, available: 7, icon: 'scissors' },
  ];

  const resources = await Promise.all(
    resourceData.map((resource) =>
      prisma.resource.upsert({
        where: { name: resource.name },
        update: {},
        create: resource,
      })
    )
  );

  console.log(`   ✅ Created ${resources.length} resources`);

  // ============================================================
  // 6. Create Alerts
  // ============================================================
  console.log('🚨 Creating alerts...');

  const alertData = [
    // Active alerts
    {
      title: 'ICU Ventilator Shortage',
      message: 'Only 3 ventilators remaining in ICU. Immediate procurement or redistribution required. Current patients on ventilator support: 5. Expected new admissions requiring ventilators: 2.',
      priority: 'CRITICAL',
      wardId: wards.find(w => w.name === 'ICU')?.id,
      createdBy: users[0].id,
      resolved: false,
    },
    {
      title: 'Emergency Ward Overcrowding',
      message: 'Emergency ward is at 90% capacity. Only 1 bed available. Consider diverting non-critical cases to General Ward. Average wait time has increased to 45 minutes.',
      priority: 'HIGH',
      wardId: wards.find(w => w.name === 'Emergency')?.id,
      createdBy: users[1].id,
      resolved: false,
    },
    // Resolved alerts
    {
      title: 'Blood Bank Stock Low',
      message: 'O-negative blood units were running low. Stock has been replenished from regional blood bank.',
      priority: 'MEDIUM',
      createdBy: users[0].id,
      resolved: true,
      resolvedAt: new Date('2026-05-28T14:30:00Z'),
      resolvedBy: users[0].id,
    },
    {
      title: 'Scheduled Maintenance - General Ward',
      message: 'Routine maintenance of beds GEN-12 and GEN-13 completed. Beds are now back in service.',
      priority: 'LOW',
      wardId: wards.find(w => w.name === 'General Ward')?.id,
      createdBy: users[2].id,
      resolved: true,
      resolvedAt: new Date('2026-05-27T09:00:00Z'),
      resolvedBy: users[2].id,
    },
  ];

  const alerts = [];
  for (const alert of alertData) {
    const created = await prisma.alert.create({ data: alert });
    alerts.push(created);
  }

  console.log(`   ✅ Created ${alerts.length} alerts (${alertData.filter(a => !a.resolved).length} active, ${alertData.filter(a => a.resolved).length} resolved)`);

  // ============================================================
  // 7. Create Activity Logs
  // ============================================================
  console.log('📋 Creating activity logs...');

  const activityLogData = [
    {
      action: 'Patient Admitted',
      entityType: 'patient',
      entityId: createdPatients[0]?.id || 1,
      userId: users[1].id,
      details: 'Rajesh Kumar admitted to ICU with Acute Myocardial Infarction. Assigned to bed ICU-01.',
      createdAt: new Date('2026-05-28T06:30:00Z'),
    },
    {
      action: 'Patient Admitted',
      entityType: 'patient',
      entityId: createdPatients[1]?.id || 2,
      userId: users[1].id,
      details: 'Priya Sharma admitted with Pneumonia. Assigned to bed ICU-02.',
      createdAt: new Date('2026-05-28T08:15:00Z'),
    },
    {
      action: 'Bed Status Changed',
      entityType: 'bed',
      entityId: availableBeds[0]?.id || 1,
      userId: users[2].id,
      details: 'Bed ICU-01 status changed from AVAILABLE to OCCUPIED.',
      createdAt: new Date('2026-05-28T06:32:00Z'),
    },
    {
      action: 'Bed Status Changed',
      entityType: 'bed',
      entityId: maintenanceBeds[0]?.id || 20,
      userId: users[0].id,
      details: 'Bed marked for scheduled maintenance.',
      createdAt: new Date('2026-05-27T10:00:00Z'),
    },
    {
      action: 'Resource Updated',
      entityType: 'resource',
      entityId: resources[0]?.id || 1,
      userId: users[0].id,
      details: 'Ventilator availability updated. Available units reduced from 10 to 8.',
      createdAt: new Date('2026-05-28T09:00:00Z'),
    },
    {
      action: 'Resource Updated',
      entityType: 'resource',
      entityId: resources[6]?.id || 7,
      userId: users[0].id,
      details: 'Blood bank stock replenished. O-negative units added: 20.',
      createdAt: new Date('2026-05-28T14:00:00Z'),
    },
    {
      action: 'Patient Discharged',
      entityType: 'patient',
      entityId: createdPatients[12]?.id || 13,
      userId: users[1].id,
      details: 'Ravi Shankar discharged after completing malaria treatment. Follow-up scheduled.',
      createdAt: new Date('2026-05-25T14:00:00Z'),
    },
    {
      action: 'Patient Discharged',
      entityType: 'patient',
      entityId: createdPatients[13]?.id || 14,
      userId: users[1].id,
      details: 'Lakshmi Narayan discharged post cholecystectomy. Recovery satisfactory.',
      createdAt: new Date('2026-05-22T11:00:00Z'),
    },
    {
      action: 'Patient Admitted',
      entityType: 'patient',
      entityId: createdPatients[4]?.id || 5,
      userId: users[1].id,
      details: 'Arjun Reddy (age 8) admitted with Dengue Fever. Platelet count critically low.',
      createdAt: new Date('2026-05-28T11:45:00Z'),
    },
    {
      action: 'Alert Created',
      entityType: 'alert',
      entityId: alerts[0]?.id || 1,
      userId: users[0].id,
      details: 'Critical alert raised: ICU Ventilator Shortage.',
      createdAt: new Date('2026-05-29T07:00:00Z'),
    },
    {
      action: 'Alert Resolved',
      entityType: 'alert',
      entityId: alerts[2]?.id || 3,
      userId: users[0].id,
      details: 'Blood Bank Stock Low alert resolved. Stock replenished.',
      createdAt: new Date('2026-05-28T14:30:00Z'),
    },
    {
      action: 'Patient Admitted',
      entityType: 'patient',
      entityId: createdPatients[6]?.id || 7,
      userId: users[1].id,
      details: 'Mohammed Irfan admitted with CKD Stage 4. Dialysis initiated.',
      createdAt: new Date('2026-05-27T16:00:00Z'),
    },
    {
      action: 'Bed Status Changed',
      entityType: 'bed',
      entityId: availableBeds[5]?.id || 6,
      userId: users[2].id,
      details: 'Bed assigned to Kavitha Menon for post-partum care.',
      createdAt: new Date('2026-05-28T02:30:00Z'),
    },
    {
      action: 'Patient Discharged',
      entityType: 'patient',
      entityId: createdPatients[15]?.id || 16,
      userId: users[1].id,
      details: 'Neha Joshi discharged after recovery from anaphylaxis.',
      createdAt: new Date('2026-05-27T16:00:00Z'),
    },
    {
      action: 'Resource Updated',
      entityType: 'resource',
      entityId: resources[4]?.id || 5,
      userId: users[2].id,
      details: 'IV Pumps redistributed. 3 units moved from General Ward to ICU.',
      createdAt: new Date('2026-05-29T08:15:00Z'),
    },
    {
      action: 'Patient Transferred',
      entityType: 'patient',
      entityId: createdPatients[2]?.id || 3,
      userId: users[1].id,
      details: 'Amit Patel transferred from Emergency to General Ward for continued care.',
      createdAt: new Date('2026-05-28T15:30:00Z'),
    },
    {
      action: 'Alert Created',
      entityType: 'alert',
      entityId: alerts[1]?.id || 2,
      userId: users[1].id,
      details: 'High priority alert: Emergency Ward at 90% capacity.',
      createdAt: new Date('2026-05-29T10:00:00Z'),
    },
  ];

  await prisma.activityLog.createMany({
    data: activityLogData,
  });

  console.log(`   ✅ Created ${activityLogData.length} activity log entries`);

  // ============================================================
  // 8. Create Notifications
  // ============================================================
  console.log('🔔 Creating notifications...');

  const notificationData = [
    // Admin notifications
    {
      userId: users[0].id,
      title: 'System Update',
      message: 'Hospital management system has been updated to version 1.0.0.',
      type: 'system',
      read: true,
      createdAt: new Date('2026-05-25T08:00:00Z'),
    },
    {
      userId: users[0].id,
      title: 'Critical Alert: ICU Ventilators',
      message: 'ICU ventilator availability is critically low. Only 3 units remaining.',
      type: 'alert',
      read: false,
      createdAt: new Date('2026-05-29T07:00:00Z'),
    },
    {
      userId: users[0].id,
      title: 'Weekly Report Ready',
      message: 'The weekly bed occupancy and resource utilization report is ready for review.',
      type: 'report',
      read: false,
      createdAt: new Date('2026-05-29T06:00:00Z'),
    },
    {
      userId: users[0].id,
      title: 'New Staff Registration',
      message: 'Dr. Meera Nair has been added to the system. Please verify credentials.',
      type: 'system',
      read: true,
      createdAt: new Date('2026-05-26T10:00:00Z'),
    },
    // Doctor notifications
    {
      userId: users[1].id,
      title: 'Patient Critical Update',
      message: 'Rajesh Kumar (ICU-01) - Cardiac enzymes elevated. Immediate review required.',
      type: 'patient',
      read: false,
      createdAt: new Date('2026-05-29T08:30:00Z'),
    },
    {
      userId: users[1].id,
      title: 'Lab Results Available',
      message: 'Blood work results for Priya Sharma are now available in the system.',
      type: 'lab',
      read: false,
      createdAt: new Date('2026-05-29T09:15:00Z'),
    },
    {
      userId: users[1].id,
      title: 'Discharge Approval Needed',
      message: 'Kavitha Menon (MAT) is ready for discharge. Please approve the discharge summary.',
      type: 'patient',
      read: true,
      createdAt: new Date('2026-05-28T16:00:00Z'),
    },
    {
      userId: users[1].id,
      title: 'Consultation Request',
      message: 'Nephrology consultation requested for Mohammed Irfan (CKD Stage 4).',
      type: 'patient',
      read: true,
      createdAt: new Date('2026-05-27T17:00:00Z'),
    },
    // Nurse notifications
    {
      userId: users[2].id,
      title: 'Shift Reminder',
      message: 'Your night shift starts at 8:00 PM today. Ward assignment: ICU.',
      type: 'schedule',
      read: true,
      createdAt: new Date('2026-05-28T18:00:00Z'),
    },
    {
      userId: users[2].id,
      title: 'Medication Alert',
      message: 'Suresh Babu (GEN-04) - Nebulization due at 2:00 PM.',
      type: 'medication',
      read: false,
      createdAt: new Date('2026-05-29T13:45:00Z'),
    },
    {
      userId: users[2].id,
      title: 'Bed Maintenance Complete',
      message: 'Beds GEN-12 and GEN-13 maintenance completed. Beds are now available.',
      type: 'maintenance',
      read: true,
      createdAt: new Date('2026-05-27T09:00:00Z'),
    },
    {
      userId: users[2].id,
      title: 'Supply Request Approved',
      message: 'Your request for additional IV fluids for the ICU has been approved.',
      type: 'supply',
      read: false,
      createdAt: new Date('2026-05-29T11:00:00Z'),
    },
  ];

  await prisma.notification.createMany({
    data: notificationData,
  });

  console.log(`   ✅ Created ${notificationData.length} notifications`);

  // ============================================================
  // Summary
  // ============================================================
  console.log('\n🎉 Seed completed successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Users:         ${users.length}`);
  console.log(`   Wards:         ${wards.length}`);
  console.log(`   Beds:          ${totalBedsCreated}`);
  console.log(`   Patients:      ${createdPatients.length}`);
  console.log(`   Resources:     ${resources.length}`);
  console.log(`   Alerts:        ${alerts.length}`);
  console.log(`   Activity Logs: ${activityLogData.length}`);
  console.log(`   Notifications: ${notificationData.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📧 Login Credentials:');
  console.log('   Admin:  admin@hospital.com  / password123');
  console.log('   Doctor: doctor@hospital.com / password123');
  console.log('   Nurse:  nurse@hospital.com  / password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('\n❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
