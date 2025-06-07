import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import SimpleBarReact from 'simplebar-react';
// routes
import Router from './routes';
// theme
import ThemeConfig from './theme';
// hooks
import { useAuth, useInterval } from './hooks';
// components
import RtlLayout from './components/RtlLayout';
import ScrollToTop from './components/ScrollToTop';
import LoadingScreen from './components/LoadingScreen';
import ThemePrimaryColor from './components/ThemePrimaryColor';
import NotistackProvider from './components/NotistackProvider';

import { syncCart } from './redux/slices/cartSlice';
import { sendTrackingData } from './redux/slices/userBehaviorSlice';

import ChatIcon from '@material-ui/icons/Chat';
import { IconButton } from '@material-ui/core';
import { useLocation } from 'react-router-dom';

const isDevMode = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');

// ----------------------------------------------------------------------

export default function App() {
  const dispatch = useDispatch();
  const { isInitialized, isAuthenticated } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { pathname } = useLocation();
  useInterval(
    () => {
      dispatch(sendTrackingData());
    },
    isDevMode ? 10 : 5
  );

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      dispatch(syncCart(isAuthenticated));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isAuthenticated]);

  const Chatbot = ({ isOpen }) => (
    <div
      style={{
        position: 'fixed',
        zIndex: 50,
        bottom: '4rem',
        right: '1.5rem',
        width: '500px',
        height: '400px',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        display: isOpen ? 'block' : 'none',
      }}
    >
      <iframe
        src="http://localhost:3000/chat"
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid rgb(209 213 219)',
          borderRadius: '0.5rem',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
        }}
        title="CSKH dainguyen"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      />
    </div>
  );

  return (
    <SimpleBarReact style={{ maxHeight: '100vh' }}>
      <ThemeConfig>
        <ThemePrimaryColor>
          <RtlLayout>
            <NotistackProvider>
              <ScrollToTop />
              {isInitialized ? <Router /> : <LoadingScreen />}
            </NotistackProvider>
          </RtlLayout>
        </ThemePrimaryColor>
      </ThemeConfig>
      <Chatbot isOpen={isChatOpen} />
      {pathname !== '/chat' && (
      <IconButton
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          backgroundColor: '#3b82f6',
          color: 'white',
        }}
        onClick={() => setIsChatOpen(!isChatOpen)}
        >
          <ChatIcon />
        </IconButton>
      )}
    </SimpleBarReact>
  );
}
