# Virtual Economy App

Welcome to the Virtual Economy App! This application allows users to earn and spend virtual currency in a gamified environment. Users can earn coins and gems through various activities, purchase exclusive items from the shop, and manage their virtual economy effectively.

## Features

- **User Balance Management**: View and manage your balance of coins and gems.
- **Shop Interface**: Browse and purchase items from different categories.
- **Featured Items**: Access daily specials and featured items with unique offers.
- **Transaction History**: Keep track of your earnings and spending through a detailed transaction history.
- **Purchase Coins**: Easily buy coins through a user-friendly interface.

## Components

- **VirtualEconomy**: The main component that manages the state and displays the virtual economy interface.
- **PurchaseModal**: A modal that opens when the user clicks "Buy Now," displaying various purchasing options for coins.
- **CoinPackCard**: A card component representing different coin purchase options, including the amount of coins and cost.
- **UI Components**: Reusable components for buttons, cards, badges, inputs, and alerts.

## Installation

To get started with the Virtual Economy App, clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd virtual-economy-app
npm install
```

## Running the Application

To run the application in development mode, use the following command:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to see the app in action.

## API Endpoints

The application includes API endpoints for managing the economy and shop data:

- **GET /api/gamification/economy**: Retrieve user balance and transaction history.
- **POST /api/gamification/economy**: Earn currency or make purchases.
- **GET /api/gamification/shop**: Retrieve shop categories and featured items.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.