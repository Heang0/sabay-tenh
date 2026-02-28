import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { UserProvider } from './context/UserContext';
import { WishlistProvider } from './context/WishlistContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <UserProvider>
          <WishlistProvider>
            <CartProvider>
              <SearchProvider>
                <App />
              </SearchProvider>
            </CartProvider>
          </WishlistProvider>
        </UserProvider>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);