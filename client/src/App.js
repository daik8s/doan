import { useEffect } from 'react';
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

const isDevMode = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');

// ----------------------------------------------------------------------

export default function App() {
  const dispatch = useDispatch();
  const { isInitialized, isAuthenticated } = useAuth();

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

  // const Chatbot = ({ isOpen }) => (
  //   <div
  //     style={{
  //       position: 'absolute',
  //       zIndex: 50,
  //       bottom: '4rem',
  //       right: '-1.5rem',
  //       width: '500px',
  //       height: '500px',
  //       backgroundColor: 'white',
  //       borderRadius: '0.5rem',
  //       boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  //       display: isOpen ? 'block' : 'none',
  //       '@media (min-width: 768px)': {
  //         right: 0,
  //         width: '24rem',
  //         height: '500px'
  //       },
  //       '@media (min-width: 1536px)': {
  //         height: '600px'
  //       }
  //     }}
  //   >
  //     <iframe
  //       src="https://binhdanhoaai.com/"
  //       style={{
  //         width: '100%',
  //         height: '100%',
  //         border: '1px solid rgb(209 213 219)',
  //         borderRadius: '0.5rem'
  //       }}
  //       title="CSKH dainguyen"
  //       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  //       allowFullScreen
  //     />
  //   </div>
  // );
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
      {/* <Chatbot isOpen={true} /> */}
    </SimpleBarReact>
  );
}
