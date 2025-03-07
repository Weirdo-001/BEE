import fs from 'fs/promises';
import path from 'path';
import moment from "moment";
import { v4 as uuidv4 } from 'uuid';

// Paths to data files
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const TRANSACTIONS_FILE = path.join(process.cwd(), 'data', 'transactions.json');

// Helper functions to read and write files
const readFile = async (filePath) => {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT' || error.message.includes('Unexpected end of JSON input')) {
      await fs.writeFile(filePath, JSON.stringify([]));
      return [];
    }
    throw error;
  }
};

const writeFile = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// Read users from file
const readUsers = async () => readFile(USERS_FILE);

// Write users to file
const writeUsers = async (users) => writeFile(USERS_FILE, users);

// Read transactions from file
const readTransactions = async () => readFile(TRANSACTIONS_FILE);

// Write transactions to file
const writeTransactions = async (transactions) => writeFile(TRANSACTIONS_FILE, transactions);

// Find user by ID
const findUserById = async (userId) => {
  const users = await readUsers();
  return users.find(user => user._id === userId);
};

export const addTransactionController = async (req, res) => {
  try {
    const {
      title,amount, description, date, category, userId, transactionType,
    } = req.body;

    if (
      !title || !amount || !description || !date || !category || !transactionType
    ) {
      return res.status(408).json({
        success: false,
        messages: "Please Fill all fields",
      });
    }

    // Get user from file
    const user = await findUserById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Create new transaction
    const newTransaction = {
      _id: uuidv4(),
      title,
      amount,
      category,
      description,
      date,
      user: userId,
      transactionType,
      createdAt: new Date().toISOString()
    };

    // Read existing transactions
    const transactions = await readTransactions();
    
    // Add new transaction
    transactions.push(newTransaction);
    
    // Save to transactions file
    await writeTransactions(transactions);

    // Update user's transactions array
    const users = await readUsers();
    const userIndex = users.findIndex(u => u._id === userId);
    
    if (!users[userIndex].transactions) {
      users[userIndex].transactions = [];
    }
    
    users[userIndex].transactions.push(newTransaction._id);
    
    // Save updated users
    await writeUsers(users);

    return res.status(200).json({
      success: true,
      message: "Transaction Added Successfully",
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
};

export const getAllTransactionController = async (req, res) => {
  try {
    const { userId, type, frequency, startDate, endDate } = req.body;

    // Get user from file
    const user = await findUserById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Read all transactions
    const allTransactions = await readTransactions();
    
    // Filter transactions based on user ID
    let transactions = allTransactions.filter(t => t.user === userId);

    // Filter by transaction type if specified
    if (type !== 'all') {
      transactions = transactions.filter(t => t.transactionType === type);
    }

    // Filter by date based on frequency
    if (frequency !== 'custom') {
      const cutoffDate = moment().subtract(Number(frequency), "days").toDate();
      transactions = transactions.filter(t => moment(t.date).toDate() > cutoffDate);
    } else if (startDate && endDate) {
      const startDateTime = moment(startDate).toDate();
      const endDateTime = moment(endDate).toDate();
      transactions = transactions.filter(t => {
        const transactionDate = moment(t.date).toDate();
        return transactionDate >= startDateTime && transactionDate <= endDateTime;
      });
    }

    return res.status(200).json({
      success: true,
      transactions: transactions,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
};

export const deleteTransactionController = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.body.userId;

    // Get user from file
    const user = await findUserById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Read transactions
    const transactions = await readTransactions();
    
    // Find transaction index
    const transactionIndex = transactions.findIndex(t => t._id === transactionId);
    
    if (transactionIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Transaction not found",
      });
    }
    
    // Remove transaction
    transactions.splice(transactionIndex, 1);
    
    // Save updated transactions
    await writeTransactions(transactions);

    // Update user's transactions array
    const users = await readUsers();
    const userIndex = users.findIndex(u => u._id === userId);
    
    if (users[userIndex].transactions) {
      users[userIndex].transactions = users[userIndex].transactions.filter(
        id => id !== transactionId
      );
    }
    
    // Save updated users
    await writeUsers(users);

    return res.status(200).json({
      success: true,
      message: `Transaction successfully deleted`,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
};

export const updateTransactionController = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { title, amount, description, date, category, transactionType } = req.body;
    // Read transactions
    const transactions = await readTransactions(); 
    // Find transaction index
    const transactionIndex = transactions.findIndex(t => t._id === transactionId);
    
    if (transactionIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Transaction not found",
      });
    }
    // Update transaction properties
    if (title) {
      transactions[transactionIndex].title = title;
    }
    
    if (description) {
      transactions[transactionIndex].description = description;
    }
    
    if (amount) {
      transactions[transactionIndex].amount = amount;
    }
    
    if (category) {
      transactions[transactionIndex].category = category;
    }
    
    if (transactionType) {
      transactions[transactionIndex].transactionType = transactionType;
    }
    
    if (date) {
      transactions[transactionIndex].date = date;
    }
    
    // Add updated timestamp
    transactions[transactionIndex].updatedAt = new Date().toISOString();
    
    // Save updated transactions
    await writeTransactions(transactions);

    return res.status(200).json({
      success: true,
      message: `Transaction Updated Successfully`,
      transaction: transactions[transactionIndex],
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
};