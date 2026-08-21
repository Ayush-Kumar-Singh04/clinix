import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Clinix Database Seed...");

  // Clean existing tables
  await prisma.calendarEvent.deleteMany();
  await prisma.calendarConnection.deleteMany();
  await prisma.notificationJob.deleteMany();
  await prisma.medicationReminder.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.appointmentSlot.deleteMany();
  await prisma.doctorLeave.deleteMany();
  await prisma.doctorWorkingHours.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create Admin Account
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@clinix.health",
      name: "Clinix System Admin",
      passwordHash,
      role: "ADMIN",
      phone: "+1 (555) 999-0000",
    },
  });

  // 2. Create Demo Patients
  const patient1 = await prisma.user.create({
    data: {
      email: "patient@clinix.health",
      name: "Sarah Jenkins",
      passwordHash,
      role: "PATIENT",
      phone: "+1 (555) 123-4567",
    },
  });

  const patient2 = await prisma.user.create({
    data: {
      email: "patient2@clinix.health",
      name: "Michael Chen",
      passwordHash,
      role: "PATIENT",
      phone: "+1 (555) 987-6543",
    },
  });

  // 3. Create Doctors & Profiles
  const doctorSpecs = [
    {
      name: "Ananya Sharma",
      email: "dr.sharma@clinix.health",
      specialization: "Cardiology",
      bio: "Board-certified cardiologist specializing in preventive cardiology, hypertension management, and heart health.",
      slotDuration: 30,
      rating: 4.9,
    },
    {
      name: "Rahul Mehta",
      email: "dr.mehta@clinix.health",
      specialization: "General Medicine",
      bio: "Primary care clinician focused on holistic family medicine, chronic disease management, and annual health triage.",
      slotDuration: 30,
      rating: 4.8,
    },
    {
      name: "Priya Iyer",
      email: "dr.iyer@clinix.health",
      specialization: "Dermatology",
      bio: "Expert dermatologist specializing in skin health, eczema, acne management, and cosmetic dermatology.",
      slotDuration: 30,
      rating: 4.9,
    },
    {
      name: "Arjun Kapoor",
      email: "dr.kapoor@clinix.health",
      specialization: "Orthopedics",
      bio: "Orthopedic surgeon specializing in sports medicine, joint health, spine evaluations, and arthritis therapy.",
      slotDuration: 30,
      rating: 4.7,
    },
  ];

  const createdDoctors: any[] = [];

  for (const docData of doctorSpecs) {
    const user = await prisma.user.create({
      data: {
        email: docData.email,
        name: docData.name,
        passwordHash,
        role: "DOCTOR",
      },
    });

    const doc = await prisma.doctor.create({
      data: {
        userId: user.id,
        specialization: docData.specialization,
        bio: docData.bio,
        slotDurationMinutes: docData.slotDuration,
        rating: docData.rating,
        isActive: true,
        workingHours: {
          create: [1, 2, 3, 4, 5].map((day) => ({
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "17:00",
          })),
        },
      },
      include: { user: true },
    });
    createdDoctors.push(doc);
  }

  const todayStr = new Date().toISOString().split("T")[0];

  // 4. Create Demo Appointments
  // Appointment 1: Completed cardiology visit with prescription & AI summary
  const appt1Slot = await prisma.appointmentSlot.create({
    data: {
      doctorId: createdDoctors[0].id,
      date: todayStr,
      startTime: "09:00",
      endTime: "09:30",
      status: "CONFIRMED",
    },
  });

  const appt1 = await prisma.appointment.create({
    data: {
      slotId: appt1Slot.id,
      patientId: patient1.id,
      doctorId: createdDoctors[0].id,
      date: todayStr,
      startTime: "09:00",
      endTime: "09:30",
      symptoms: "Mild chest tightness and elevated blood pressure during routine exercise.",
      urgency: "HIGH",
      chiefComplaint: "Preventive Cardiology Evaluation for Exercise-Induced Tightness",
      aiPreVisitSummary: JSON.stringify({
        urgency: "HIGH",
        chiefComplaint: "Exercise-induced chest tightness with hypertensive history",
        suggestedQuestions: [
          "Do you experience radiation of pain to your arm or jaw?",
          "How quickly does symptoms resolve after resting?",
          "Have you taken nitroglycerin or blood pressure medication?",
        ],
        disclaimer: "AI-generated workflow summary. Not a medical diagnosis.",
      }),
      status: "COMPLETED",
      clinicalNotes: "Patient evaluated for exertional tightness. ECG shows normal sinus rhythm without acute ischemic ST changes. Prescribed Lisinopril for mild hypertension.",
      doctorNotesPatient: "Rest, monitor BP twice daily, and take prescribed Lisinopril consistently after breakfast.",
      aiPostVisitSummary: JSON.stringify({
        summary: "Dr. Sharma performed a cardiac evaluation and verified no acute distress. You were prescribed blood pressure support medication.",
        medicationSchedule: "Lisinopril 10mg: Take 1 tablet once daily in the morning.",
        followUpSteps: ["Log morning blood pressure readings.", "Schedule a follow-up visit in 3 weeks."],
        importantInstructions: "Seek immediate emergency care if chest pain becomes severe or radiates.",
        disclaimer: "AI-generated patient-friendly summary. Follow your clinician's instructions.",
      }),
    },
  });

  // Create Prescription & Reminders for Appt 1
  const rx1 = await prisma.prescription.create({
    data: {
      appointmentId: appt1.id,
      patientId: patient1.id,
      doctorId: createdDoctors[0].id,
      items: {
        create: [
          {
            medicineName: "Lisinopril",
            dosage: "10 mg",
            frequency: "Once daily",
            duration: "30 days",
            instructions: "Take with water every morning after breakfast.",
          },
        ],
      },
    },
    include: { items: true },
  });

  await prisma.medicationReminder.create({
    data: {
      prescriptionItemId: rx1.items[0].id,
      patientId: patient1.id,
      reminderTime: "08:00",
      frequency: "Once daily",
      status: "PENDING",
    },
  });

  // Appointment 2: Upcoming dermatology visit
  const appt2Slot = await prisma.appointmentSlot.create({
    data: {
      doctorId: createdDoctors[2].id,
      date: todayStr,
      startTime: "11:00",
      endTime: "11:30",
      status: "CONFIRMED",
    },
  });

  await prisma.appointment.create({
    data: {
      slotId: appt2Slot.id,
      patientId: patient1.id,
      doctorId: createdDoctors[2].id,
      date: todayStr,
      startTime: "11:00",
      endTime: "11:30",
      symptoms: "Dry, itching skin rash on forearms persisting for 1 week.",
      urgency: "LOW",
      chiefComplaint: "Dermatological Evaluation for Forearm Eczema Flare",
      aiPreVisitSummary: JSON.stringify({
        urgency: "LOW",
        chiefComplaint: "Localized pruritic skin rash on bilateral forearms",
        suggestedQuestions: [
          "Have you started using any new laundry detergents or soaps?",
          "Does heat or sweating worsen the itching?",
          "Have you applied hydrocortisone cream?",
        ],
        disclaimer: "AI-generated workflow summary. Not a medical diagnosis.",
      }),
      status: "UPCOMING",
    },
  });

  // Seed Notification Job Log
  await prisma.notificationJob.create({
    data: {
      type: "BOOKING_CONFIRMATION",
      recipientEmail: "patient@clinix.health",
      payload: JSON.stringify({
        recipientName: "Sarah Jenkins",
        doctorName: "Dr. Ananya Sharma",
        specialization: "Cardiology",
        appointmentDate: todayStr,
        appointmentTime: "09:00",
      }),
      status: "SENT",
      sentAt: new Date(),
    },
  });

  console.log("✅ Seed Completed Successfully!");
  console.log("-----------------------------------------");
  console.log("DEMO ACCOUNTS READY:");
  console.log("Patient: patient@clinix.health / password123");
  console.log("Doctor:  dr.sharma@clinix.health / password123");
  console.log("Admin:   admin@clinix.health / password123");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
