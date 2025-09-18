import auth from '@react-native-firebase/auth';

export const registerUser = async (email, password) => {
  const userCredential = await auth().createUserWithEmailAndPassword(email, password);
  const { user } = userCredential;
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName || '',
  };
};

export const loginUser = async (email, password) => {
  const userCredential = await auth().signInWithEmailAndPassword(email, password);
  const { user } = userCredential;
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName || '',
  };
};

export const resetPassword = async (email) => {
  return auth().sendPasswordResetEmail(email);
};

export const sendVerificationCode = async (phoneNumber) => {
  const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
  return confirmation;
};

export const confirmVerificationCode = async (confirmation, code) => {
  const userCredential = await confirmation.confirm(code);
  const { user } = userCredential;
  return {
    uid: user.uid,
    email: user.email || '',
    name: user.displayName || '',
  };
};
