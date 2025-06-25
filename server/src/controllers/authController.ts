import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = 'Ronak'; // Use environment variable in production


export const signup = async (req: any, res: any) => {
  const { name, email, latitude, longitude } = req.body;
  console.log(req.body)
  try {
    // Check if user already exists
    const existingUser = await prisma.driver.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new driver
    const newDriver = await prisma.driver.create({
      data: {
        name,
        email,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    });

    // Generate JWT
    const token = jwt.sign({ userid: newDriver.id,name:name }, JWT_SECRET);

    res.status(201).json({ message: 'Signup successful', token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
};

// ------------------- SIGNIN -------------------
export const signin = async (req: any, res: any) => {
  const { email } = req.body;

  try {
    const user = await prisma.driver.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If email found, issue token (no password in your schema)
    const token = jwt.sign({ userid: user.id ,name:user.name}, JWT_SECRET);

    res.json({ message: 'Signin successful', token });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Signin failed' });
  }
};
