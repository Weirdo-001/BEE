import React from "react";
import { Container, Row } from "react-bootstrap";
import CircularProgressBar from "../../components/CircularProgressBar";
import LineProgressBar from "../../components/LineProgressBar";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const Analytics = ({ transactions }) => {
  const TotalTransactions = transactions.length;
  const totalIncomeTransactions = transactions.filter(
    (item) => item.transactionType === "credit"
  );
  const totalExpenseTransactions = transactions.filter(
    (item) => item.transactionType === "expense"
  );

  let totalIncomePercent =
    (totalIncomeTransactions.length / TotalTransactions) * 100;
  let totalExpensePercent =
    (totalExpenseTransactions.length / TotalTransactions) * 100;

  // Calculate total income by parsing amounts to numbers and summing them
  const totalTurnOverIncome = transactions
    .filter((item) => item.transactionType === "credit")
    .reduce((acc, transaction) => acc + parseFloat(transaction.amount || 0), 0);
    
  // Calculate total expense by parsing amounts to numbers and summing them
  const totalTurnOverExpense = transactions
    .filter((item) => item.transactionType === "expense")
    .reduce((acc, transaction) => acc + parseFloat(transaction.amount || 0), 0);

  // Calculate total turnover as the sum of income and expense
  const totalTurnOver = totalTurnOverIncome + totalTurnOverExpense;

  // Calculate percentages based on total turnover
  const TurnOverIncomePercent = (totalTurnOverIncome / totalTurnOver) * 100;
  const TurnOverExpensePercent = (totalTurnOverExpense / totalTurnOver) * 100;

  const categories = [
    "Groceries",
    "Rent",
    "Salary",
    "Tip",
    "Food",
    "Medical",
    "Utilities",
    "Entertainment",
    "Transportation",
    "Other",
  ];

  const colors = {
    "Groceries": '#FF6384',
    "Rent": '#36A2EB',
    "Salary": '#FFCE56',
    "Tip": '#4BC0C0',
    "Food": '#9966FF',
    "Medical": '#FF9F40',
    "Utilities": '#8AC926',
    "Entertainment": '#6A4C93',
    "Transportation": '#1982C4',
    "Other": '#F45B69',
  };

  return (
    <>
      <Container className="mt-5 ">
        <Row>
          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header bg-black text-white">
                <span style={{ fontWeight: "bold" }}>Total Transactions:</span>{" "}
                {TotalTransactions}
              </div>
              <div className="card-body">
                <h5 className="card-title " style={{color: "green"}}>
                  Income: <ArrowDropUpIcon/>{totalIncomeTransactions.length}
                </h5>
                <h5 className="card-title" style={{color: "red"}}>
                  Expense: <ArrowDropDownIcon />{totalExpenseTransactions.length}
                </h5>

                <div className="d-flex justify-content-center mt-3">
                  <CircularProgressBar
                    percentage={isNaN(totalIncomePercent) ? 0 : totalIncomePercent.toFixed(0)}
                    color="green"
                  />
                </div>

                <div className="d-flex justify-content-center mt-4 mb-2">
                  <CircularProgressBar
                    percentage={isNaN(totalExpensePercent) ? 0 : totalExpensePercent.toFixed(0)}
                    color="red"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header bg-black text-white ">
                <span style={{ fontWeight: "bold" }}>Total TurnOver:</span>{" "}
                {totalTurnOver.toLocaleString()}
              </div>
              <div className="card-body">
                <h5 className="card-title" style={{color: "green"}}>
                  Income: <ArrowDropUpIcon /> {totalTurnOverIncome.toLocaleString()} <CurrencyRupeeIcon />
                </h5>
                <h5 className="card-title" style={{color: "red"}}>
                  Expense: <ArrowDropDownIcon /> {totalTurnOverExpense.toLocaleString()} <CurrencyRupeeIcon />
                </h5>
                <div className="d-flex justify-content-center mt-3">
                  <CircularProgressBar
                    percentage={isNaN(TurnOverIncomePercent) ? 0 : TurnOverIncomePercent.toFixed(0)}
                    color="green"
                  />
                </div>

                <div className="d-flex justify-content-center mt-4 mb-4">
                  <CircularProgressBar
                    percentage={isNaN(TurnOverExpensePercent) ? 0 : TurnOverExpensePercent.toFixed(0)}
                    color="red"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header  bg-black text-white">
                <span style={{ fontWeight: "bold" }}>Categorywise Income</span>{" "}
              </div>
              <div className="card-body">
                {categories.map((category, index) => {
                  const income = transactions
                    .filter(transaction => transaction.transactionType === "credit" && transaction.category === category)
                    .reduce((acc, transaction) => acc + parseFloat(transaction.amount || 0), 0);
                  
                  // Calculate percentage based on total income
                  const incomePercent = (income / totalTurnOverIncome) * 100;

                  return(
                    <React.Fragment key={`income-${index}`}>
                      {income > 0 && (
                        <LineProgressBar 
                          label={`${category} (${income.toLocaleString()})`}
                          percentage={isNaN(incomePercent) ? 0 : incomePercent.toFixed(0)} 
                          lineColor={colors[category]} 
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header  bg-black text-white">
                <span style={{ fontWeight: "bold" }}>Categorywise Expense</span>{" "}
              </div>
              <div className="card-body">
                {categories.map((category, index) => {
                  const expenses = transactions
                    .filter(transaction => transaction.transactionType === "expense" && transaction.category === category)
                    .reduce((acc, transaction) => acc + parseFloat(transaction.amount || 0), 0);
                  
                  // Calculate percentage based on total expense
                  const expensePercent = (expenses / totalTurnOverExpense) * 100;

                  return(
                    <React.Fragment key={`expense-${index}`}>
                      {expenses > 0 && (
                        <LineProgressBar 
                          label={`${category} (${expenses.toLocaleString()})`}
                          percentage={isNaN(expensePercent) ? 0 : expensePercent.toFixed(0)} 
                          lineColor={colors[category]}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Analytics;