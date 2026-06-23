import { config } from "dotenv";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

config();

const seedUsers = [
  // Female Users
  {
    email: "emma.thompson@example.com",
    fullname: "Emma Thompson",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    email: "olivia.miller@example.com",
    fullname: "Olivia Miller",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    email: "sophia.davis@example.com",
    fullname: "Sophia Davis",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    email: "ava.wilson@example.com",
    fullname: "Ava Wilson",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    email: "isabella.brown@example.com",
    fullname: "Isabella Brown",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/5.jpg",
  },
  {
    email: "mia.johnson@example.com",
    fullname: "Mia Johnson",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/6.jpg",
  },
  {
    email: "charlotte.williams@example.com",
    fullname: "Charlotte Williams",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/7.jpg",
  },
  {
    email: "amelia.garcia@example.com",
    fullname: "Amelia Garcia",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/8.jpg",
  },

  // Male Users
  {
    email: "james.anderson@example.com",
    fullname: "James Anderson",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    email: "william.clark@example.com",
    fullname: "William Clark",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    email: "benjamin.taylor@example.com",
    fullname: "Benjamin Taylor",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    email: "lucas.moore@example.com",
    fullname: "Lucas Moore",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    email: "henry.jackson@example.com",
    fullname: "Henry Jackson",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    email: "alexander.martin@example.com",
    fullname: "Alexander Martin",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/6.jpg",
  },
  {
    email: "daniel.rodriguez@example.com",
    fullname: "Daniel Rodriguez",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/7.jpg",
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log("Users already exist in database. Skipping seed.");
      process.exit(0);
    }

    // Hash passwords before inserting
    const hashedUsers = await Promise.all(
      seedUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    await User.insertMany(hashedUsers);
    console.log("Database seeded successfully with", hashedUsers.length, "users");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Call the function
seedDatabase();