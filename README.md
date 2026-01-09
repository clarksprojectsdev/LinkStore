# LinkStore - WhatsApp Mini Store App

A minimal, mobile-first mini-store application that allows vendors to create and share their products via WhatsApp. Built with React Native and Expo.

## Features

- **Store Management**: Create and customize your store with name, WhatsApp number, and banner image
- **Product Catalog**: Add products with images, titles, descriptions, and prices
- **WhatsApp Integration**: Direct WhatsApp ordering with pre-filled messages
- **Local Storage**: All data is stored locally using AsyncStorage
- **Responsive Design**: Clean, minimal UI optimized for mobile devices

## Screens

1. **Store Screen**: Main store view with product grid and store banner
2. **Product Details**: Detailed product view with larger images and full descriptions
3. **Vendor Setup**: Store configuration and product management

## Tech Stack

- React Native 0.81.5
- Expo SDK 54
- React Navigation 6
- Firebase Authentication
- AsyncStorage for local data persistence
- Expo ImagePicker for image selection
- Expo Linking for WhatsApp integration

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- Expo Go app on your mobile device

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd LinkStore
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Scan the QR code with Expo Go app on your mobile device

### Project Structure

```
LinkStore/
├── App.js                 # Main app component with navigation
├── context/
│   └── StoreContext.js   # Global state management
├── screens/
│   ├── StoreScreen.js    # Main store view
│   ├── ProductDetailsScreen.js  # Product details
│   └── VendorSetupScreen.js     # Store setup & product management
├── assets/               # App icons and images
└── package.json          # Dependencies and scripts
```

## Usage

### Setting Up Your Store

1. Open the app and navigate to "Add Product"
2. Set your store name and WhatsApp number
3. Add a banner image (optional)
4. Save your store information

### Adding Products

1. Navigate to "Add Product" from the store screen
2. Upload a product image
3. Enter product details (name, price, description)
4. Tap "Add Product" to save

### Customer Experience

1. Customers view your store and products
2. Tap on products to see details
3. Use "Order on WhatsApp" button to start a chat
4. Pre-filled message includes product details and price

## Configuration

The app uses AsyncStorage to persist data locally. No backend setup is required for the MVP version.

### WhatsApp Integration

- Set your WhatsApp number with country code (e.g., +1234567890)
- The app will automatically format messages and open WhatsApp chats

## Development

### Adding New Features

- New screens can be added to the `screens/` directory
- Update navigation in `App.js`
- Extend the StoreContext for additional state management

### Styling

The app uses a consistent design system with:
- Primary color: #28a745 (green)
- Secondary color: #007AFF (blue)
- Background: #ffffff (white)
- Text: #333 (dark gray)

## Troubleshooting

### Common Issues

1. **Images not loading**: Ensure you have proper permissions for photo library access
2. **WhatsApp not opening**: Verify the phone number format includes country code
3. **App crashes**: Check that all dependencies are properly installed

### Debug Mode

Enable debug mode by shaking your device or pressing Cmd+D (iOS) / Cmd+M (Android) in the simulator.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
