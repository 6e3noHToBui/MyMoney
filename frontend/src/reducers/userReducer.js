const SET_USER = "SET_USER";
const LOGOUT = "LOGOUT";
const SET_ACTIVE_WALLET = "SET_ACTIVE_WALLET";

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('userState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('userState', serializedState);
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
};

const defaultState = {
  currentUser: {},
  isAuth: false,
  activeWallet: false
};

export default function userReducer(state = loadState() || defaultState, action) {
  switch (action.type) {
    case SET_USER:
      const newState = {
        ...state,
        currentUser: action.payload,
        isAuth: true
      };
      saveState(newState);
      return newState;
    case LOGOUT:
      localStorage.removeItem('token');
      const logoutState = {
        ...state,
        currentUser: {},
        isAuth: false,
        activeWallet: false
      };
      saveState(logoutState);
      return logoutState;
    case SET_ACTIVE_WALLET:
      const setActiveWalletState = {
        ...state,
        activeWallet: action.payload
      };
      saveState(setActiveWalletState);
      return setActiveWalletState;
    default:
      return state;
  }
}

export const setUser = user => ({type: SET_USER, payload: user});
export const logout = () => ({type: LOGOUT});
export const setActiveWallet = walletId => ({type: SET_ACTIVE_WALLET, payload: walletId});
