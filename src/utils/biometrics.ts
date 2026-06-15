import * as LocalAuthentication from "expo-local-authentication";

/**
 * Checks biometric availability and triggers authentication.
 * Returns true if authentication succeeds.
 */
export const authorizedBiometrics = async (): Promise<boolean> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return false;
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock Expense Tracker",
      fallbackLabel: "Use Passcode",
      disableDeviceFallback: false,
    });

    return result.success;
  } catch (error) {
    console.error("Biometric authentication error:", error);
    return false;
  }
};
