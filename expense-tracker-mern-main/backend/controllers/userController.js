import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'; 

// Path to data file
const DATA_FILE = path.join(process.cwd(), 'data', 'users.json');

// Helper function to read users from file
const readUsersFile = async () => {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Try to read the file
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    if (error.code === 'ENOENT' || error.message.includes('Unexpected end of JSON input')) {
      await fs.writeFile(DATA_FILE, JSON.stringify([]));
      return [];
    }
    throw error;
  }
};

// Helper function to write users to file
const writeUsersFile = async (users) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
};

// Helper function to find a user by property
const findUser = async (property, value) => {
  const users = await readUsersFile();
  return users.find(user => user[property] === value);
};

export const registerControllers = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter All Fields",
      });
    }

    const users = await readUsersFile();
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
      return res.status(409).json({
        success: false,
        message: "User already Exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with unique ID
    const newUser = {
      _id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      isAvatarImageSet: false,
      avatarImage: "",
      createdAt: new Date().toISOString()
    };

    // Add to users array and save to file
    users.push(newUser);
    await writeUsersFile(users);

    // Clone user obj and remove password
    const userResponse = { ...newUser };
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "User Created Successfully",
      user: userResponse
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const loginControllers = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter All Fields",
      });
    }

    const user = await findUser('email', email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Email or Password",
      });
    }

    // Clone user obj and remove password
    const userResponse = { ...user };
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}`,
      user: userResponse,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const setAvatarController = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const imageData = req.body.image;

    const users = await readUsersFile();
    const userIndex = users.findIndex(u => u._id === userId);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user data
    users[userIndex].isAvatarImageSet = true;
    users[userIndex].avatarImage = imageData;

    // Save updated users array
    await writeUsersFile(users);

    return res.status(200).json({
      isSet: users[userIndex].isAvatarImageSet,
      image: users[userIndex].avatarImage,
    });
  } catch (err) {
    next(err);
  }
};

export const allUsers = async (req, res, next) => {
  try {
    const users = await readUsersFile();
    
    // Filter out the requesting user and sensitive data
    const filteredUsers = users
      .filter(user => user._id !== req.params.id)
      .map(user => ({
        _id: user._id,
        email: user.email,
        username: user.name, // Assuming username maps to name
        avatarImage: user.avatarImage
      }));

    return res.json(filteredUsers);
  } catch (err) {
    next(err);
  }
};